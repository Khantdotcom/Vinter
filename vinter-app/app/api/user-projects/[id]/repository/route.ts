import { jsonError, jsonResponse } from "@/lib/api";
import { connectRepository } from "@/lib/domain";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { github_repository_id?: string } | null;

  if (!body?.github_repository_id) {
    return jsonError("INVALID_REPOSITORY_REQUEST", "A github_repository_id is required.", 400);
  }

  return jsonResponse(connectRepository(id, body.github_repository_id));
}
