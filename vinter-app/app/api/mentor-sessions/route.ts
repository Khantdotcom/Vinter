import { auth } from "@/lib/auth";
import { jsonError, jsonResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { generateMentorReview } from "@/lib/mentor";

export async function POST(request: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  const sessionUser = session.user as any;
  const userId = sessionUser.id ?? sessionUser.email ?? null;

  if (!userId) {
    return jsonError("UNAUTHORIZED", "No authenticated user id available.", 401);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const userProjectId: string | undefined = body.userProjectId;

    if (!userProjectId) {
      return jsonError("INVALID_REQUEST", "userProjectId is required.", 400);
    }

    const userProject = await prisma.userProject.findUnique({
      where: { id: userProjectId },
      include: { user: true },
    });

    if (!userProject) {
      return jsonError("USER_PROJECT_NOT_FOUND", "User project not found.", 404);
    }

    if (userProject.userId !== userId && userProject.user?.id !== userId) {
      return jsonError("FORBIDDEN", "You do not have access to this project.", 403);
    }

    // Generate the AI's opening review and first question
    const openingMessage = await generateMentorReview(userProjectId);

    // Persist session + opening message in a transaction
    const mentorSession = await prisma.$transaction(async (tx) => {
      const newSession = await tx.mentorSession.create({
        data: {
          userProjectId,
          status: "ACTIVE",
        },
      });

      await tx.mentorMessage.create({
        data: {
          sessionId: newSession.id,
          role: "MENTOR",
          content: openingMessage,
        },
      });

      await tx.userProject.update({
        where: { id: userProjectId },
        data: { status: "MENTOR_SESSION" },
      });

      return newSession;
    });

    return jsonResponse({
      sessionId: mentorSession.id,
      status: mentorSession.status,
      openingMessage,
    });
  } catch (error) {
    console.error("MENTOR_SESSION_CREATE_FAILED", error);
    return jsonError("MENTOR_SESSION_CREATE_FAILED", "Failed to start mentor session.", 500);
  }
}
