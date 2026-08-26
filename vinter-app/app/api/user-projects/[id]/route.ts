import { jsonError, jsonResponse } from "@/lib/api";
import { getUserProjectOverview } from "@/lib/domain";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return jsonError("USER_PROJECT_NOT_FOUND", "User project not found.", 404);
  }

  return jsonResponse(getUserProjectOverview(id));
}
