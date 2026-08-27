import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

import { normalizeProject, prisma } from "@/lib/prisma";

const MODEL = "gemini-3.6-flash";

// ─── Zod schema ─────────────────────────────────────────────────────────────

const AssessmentSchema = z.object({
  summary: z.string().describe("A short evaluation of the candidate's technical defense."),
  passed: z.boolean().describe("Whether the candidate demonstrated the required competencies."),
  evidences: z
    .array(
      z.object({
        competency: z.string().describe("The competency being assessed."),
        question: z.string().describe("The question that was asked by the mentor."),
        answer: z.string().describe("The candidate's answer or relevant response."),
        note: z.string().describe("Brief evaluator note on the quality of the answer."),
      }),
    )
    .describe("Per-competency extractions from the conversation history."),
});

export type FinalAssessmentResult = z.infer<typeof AssessmentSchema>;

// ─── generateFinalAssessment ─────────────────────────────────────────────────

export async function generateFinalAssessment(
  userProjectId: string,
): Promise<FinalAssessmentResult> {
  const userProject = await prisma.userProject.findUnique({
    where: { id: userProjectId },
    include: {
      project: true,
      repository: {
        include: { snapshots: { orderBy: { fetchedAt: "desc" }, take: 1 } },
      },
      mentorSessions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { messages: { orderBy: { createdAt: "asc" } } },
      },
    },
  });

  if (!userProject?.project) {
    throw new Error("UserProject or Project not found.");
  }

  const project = normalizeProject(userProject.project);
  const repo = userProject.repository;
  const snapshot = repo?.snapshots?.[0] ?? null;
  const session = userProject.mentorSessions?.[0] ?? null;

  const repoContext = repo
    ? `Repository: ${repo.owner}/${repo.name} (${repo.defaultBranch ?? "main"})${snapshot ? `, commit ${snapshot.commitSha}` : ", no snapshot"}`
    : "No repository connected.";

  const conversationHistory =
    session?.messages
      .map((m) => `${m.role === "MENTOR" ? "Mentor" : "Candidate"}: ${m.content}`)
      .join("\n\n") ?? "No conversation history available.";

  const competenciesList = project.competencies
    .map((c: string) => `- ${c}`)
    .join("\n");

  const prompt = `You are a Senior Engineering Assessor evaluating a junior developer's technical interview.

Project: ${project.title}
Category: ${project.category}
Role: ${project.role}
Required competencies:
${competenciesList}

${repoContext}

Full mentor conversation:
---
${conversationHistory}
---

Based solely on the conversation above, produce a structured final assessment:
- Decide whether the candidate passed (demonstrated sufficient competency across all areas).
- Write a concise summary (2–4 sentences) of their overall performance.
- For each competency, extract the best matching question/answer exchange as evidence and add a brief evaluator note.

Be objective and specific. Only reference what was actually said in the conversation.`;

  const { object } = await generateObject({
    model: google(MODEL),
    schema: AssessmentSchema,
    prompt,
  });

  return object;
}
