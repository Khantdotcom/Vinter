import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { generateFinalAssessment } from "@/lib/assessment";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ data: null, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const { id: userProjectId } = await params;

  // Guard: ensure the userProject belongs to this user
  const userProject = await prisma.userProject.findUnique({
    where: { id: userProjectId },
    include: {
      repository: {
        include: { snapshots: { orderBy: { fetchedAt: "desc" }, take: 1 } },
      },
      project: true,
    },
  });

  if (!userProject || userProject.userId !== userId) {
    return NextResponse.json({ data: null, error: { code: "NOT_FOUND", message: "User project not found" } }, { status: 404 });
  }

  // Run the AI assessment
  const result = await generateFinalAssessment(userProjectId);

  const snapshot = userProject.repository?.snapshots?.[0] ?? null;
  const competenciesRaw: string[] = (() => {
    try {
      return JSON.parse(userProject.project.competencies);
    } catch {
      return [userProject.project.competencies];
    }
  })();

  // Persist everything in a single transaction
  const { assessment, proof } = await prisma.$transaction(async (tx) => {
    // 1. Create Assessment + evidence rows
    const assessment = await tx.assessment.create({
      data: {
        userProjectId,
        status: "COMPLETED",
        summary: result.summary,
        evidence: {
          create: result.evidences.map((e) => ({
            competency: e.competency,
            sourceType: "MENTOR_SESSION",
            question: e.question,
            answer: e.answer,
            note: e.note,
          })),
        },
      },
    });

    // 2. Optionally create a Proof record
    let proof = null;
    if (result.passed) {
      proof = await tx.proof.create({
        data: {
          userProjectId,
          result: "PASSED",
          publicId: crypto.randomUUID(),
          competencies: JSON.stringify(competenciesRaw),
          verifiedThrough: JSON.stringify({
            repositoryId: userProject.repository?.id ?? null,
            snapshotId: snapshot?.id ?? null,
            commitSha: snapshot?.commitSha ?? null,
            branch: snapshot?.branch ?? null,
          }),
        },
      });
    }

    // 3. Advance UserProject status
    await tx.userProject.update({
      where: { id: userProjectId },
      data: { status: "COMPLETED" },
    });

    return { assessment, proof };
  });

  return NextResponse.json({
    data: {
      passed: result.passed,
      proofPublicId: proof?.publicId ?? null,
      assessmentId: assessment.id,
    },
    error: null,
  });
}
