import { jsonResponse } from "@/lib/api";
import { getProof } from "@/lib/domain";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return jsonResponse({
    user_project_id: id,
    ...getProof(),
  });
}
