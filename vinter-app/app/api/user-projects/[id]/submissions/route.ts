import { jsonError, jsonResponse } from "@/lib/api";
import { submitProject } from "@/lib/domain";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return jsonError("INVALID_SUBMISSION", "A valid user project id is required.", 400);
  }

  return jsonResponse(submitProject(id));
}
