import { jsonError, jsonResponse } from "@/lib/api";
import { getMentorSession } from "@/lib/domain";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return jsonError("SESSION_NOT_FOUND", "Mentor session not found.", 404);
  }

  return jsonResponse(getMentorSession(id));
}
