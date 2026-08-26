import { jsonError, jsonResponse } from "@/lib/api";
import { answerMentorQuestion } from "@/lib/domain";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { content?: string } | null;

  if (!body?.content) {
    return jsonError("INVALID_MESSAGE", "A message body is required.", 400);
  }

  return jsonResponse(answerMentorQuestion(id, body.content));
}
