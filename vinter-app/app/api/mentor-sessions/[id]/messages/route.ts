import { auth } from "@/lib/auth";
import { jsonError, jsonResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { generateMentorResponse } from "@/lib/mentor";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const session = await auth();

  if (!session || !session.user) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const content: string | undefined = body.content;

    if (!content?.trim()) {
      return jsonError("INVALID_MESSAGE", "A message body is required.", 400);
    }

    const mentorSession = await prisma.mentorSession.findUnique({
      where: { id: sessionId },
    });

    if (!mentorSession) {
      return jsonError("SESSION_NOT_FOUND", "Mentor session not found.", 404);
    }

    if (mentorSession.status === "COMPLETED") {
      return jsonError("SESSION_CLOSED", "This mentor session is already completed.", 400);
    }

    // Save the user's message first
    await prisma.mentorMessage.create({
      data: {
        sessionId,
        role: "USER",
        content: content.trim(),
      },
    });

    // Generate the AI's reply
    const { text: aiText, sessionComplete } = await generateMentorResponse(sessionId, content.trim());

    // Save the AI reply and optionally close the session in a transaction
    const aiMessage = await prisma.$transaction(async (tx) => {
      const msg = await tx.mentorMessage.create({
        data: {
          sessionId,
          role: "MENTOR",
          content: aiText,
        },
      });

      if (sessionComplete) {
        await tx.mentorSession.update({
          where: { id: sessionId },
          data: { status: "COMPLETED" },
        });
      }

      return msg;
    });

    return jsonResponse({
      messageId: aiMessage.id,
      content: aiMessage.content,
      role: aiMessage.role,
      sessionComplete,
      sessionStatus: sessionComplete ? "COMPLETED" : "ACTIVE",
    });
  } catch (error) {
    console.error("MENTOR_MESSAGE_FAILED", error);
    return jsonError("MENTOR_MESSAGE_FAILED", "Failed to process mentor message.", 500);
  }
}
