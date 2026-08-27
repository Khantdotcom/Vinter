import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { prisma, normalizeProject } from "@/lib/prisma";

const MODEL = "gemini-3.6-flash";
const MAX_USER_TURNS = 4;

// ─── generateMentorReview ───────────────────────────────────────────────────
// Called once when a mentor session is initiated. Receives the userProjectId,
// fetches the project brief + locked snapshot, and returns an opening analysis
// and the first question for the user.

export async function generateMentorReview(userProjectId: string): Promise<string> {
  const userProject = await prisma.userProject.findUnique({
    where: { id: userProjectId },
    include: {
      project: true,
      repository: {
        include: { snapshots: { orderBy: { fetchedAt: "desc" }, take: 1 } },
      },
    },
  });

  if (!userProject || !userProject.project) {
    throw new Error("UserProject or Project not found.");
  }

  const project = normalizeProject(userProject.project);
  const repo = userProject.repository;
  const snapshot = repo?.snapshots?.[0] ?? null;

  const repoContext = repo
    ? `Repository: ${repo.owner}/${repo.name} (${repo.defaultBranch ?? "main"})${snapshot ? `, commit ${snapshot.commitSha}` : ", no snapshot"}`
    : "No repository connected.";

  const prompt = `You are the AI Mentor for a Virtual Internship, acting like a supportive engineering manager.

Persona and voice (must follow exactly):
- Helpful, progressive, human, user-centered, and Gen-Z-esque.
- Casual but professional.
- Never robotic, cold, or condescending.

Teaching style (must follow exactly):
- Use Feynman's technique: ask the candidate to explain their code or architecture in simple terms.
- Encourage exploratory learning by helping them reason through trade-offs.
- Do not immediately hand over final answers; guide with questions and reflection.

Project: ${project.title}
Category: ${project.category}
Role assigned: ${project.role}
Requirements:
${project.requirements.map((r) => `- ${r}`).join("\n")}
Constraints:
${project.constraints.map((c) => `- ${c}`).join("\n")}

${repoContext}

Your task:
1. Briefly acknowledge the project context (1–2 sentences) in the brand voice.
2. Identify the most critical technical decision a developer would face in this project.
3. Ask one focused, open-ended question about that decision, inviting a simple explanation of their architecture/code rationale (Feynman style). Do not ask multiple questions.

Keep your response concise and direct. Do not use headers or bullet points in your reply.`;

  const result = await generateText({
    model: google(MODEL),
    prompt,
  });

  return result.text.trim();
}

// ─── generateMentorResponse ─────────────────────────────────────────────────
// Called on each user message. Receives the full session ID, fetches the
// conversation history from the DB, and generates the next AI turn.
// Returns { text, sessionComplete } where sessionComplete is true once the
// 4th user message has been answered.

export async function generateMentorResponse(
  sessionId: string,
  userMessage: string,
): Promise<{ text: string; sessionComplete: boolean }> {
  const session = await prisma.mentorSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      userProject: {
        include: { project: true },
      },
    },
  });

  if (!session) {
    throw new Error("MentorSession not found.");
  }

  const project = session.userProject?.project
    ? normalizeProject(session.userProject.project)
    : null;

  // Count completed user turns (messages already in DB from this session,
  // not counting the message being submitted right now).
  const previousUserTurns = session.messages.filter((m) => m.role === "USER").length;
  const currentTurnNumber = previousUserTurns + 1;
  const isLastTurn = currentTurnNumber >= MAX_USER_TURNS;

  const systemPrompt = `You are the AI Mentor for a Virtual Internship, acting like a supportive engineering manager.
${project ? `The candidate is being assessed on the project: "${project.title}" (${project.category}).` : ""}

Persona and voice (must follow exactly):
- Helpful, progressive, human, user-centered, and Gen-Z-esque.
- Casual but professional.
- Never robotic, cold, or condescending.

Teaching style (must follow exactly):
- Use Feynman's technique: ask the candidate to explain their code or architecture in simple terms.
- Encourage exploratory learning by helping them reason through trade-offs.
- Do not immediately hand over final answers; guide with questions and reflection.

Rules:
- Ask one focused follow-up question per turn.
- Challenge the candidate's technical decisions in a supportive and constructive way.
- This is turn ${currentTurnNumber} of ${MAX_USER_TURNS}.
${
  isLastTurn
    ? `- This is the FINAL turn. After responding to the candidate's answer, do NOT ask another question. Instead, close the session with a brief summary of the discussion in the same brand voice. Start your closing with the exact phrase "SESSION_COMPLETE:" followed by your summary.`
    : `- After your question, wait for the candidate's response.`
}`;

  // Build message history for the model
  const history = session.messages.map((m) => ({
    role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
    content: m.content,
  }));

  const result = await generateText({
    model: google(MODEL),
    system: systemPrompt,
    messages: [
      ...history,
      { role: "user" as const, content: userMessage },
    ],
  });

  const text = result.text.trim();
  const sessionComplete = isLastTurn && text.includes("SESSION_COMPLETE:");

  return { text, sessionComplete };
}
