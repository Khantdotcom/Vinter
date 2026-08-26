import { jsonResponse } from "@/lib/api";
import { createMentorSession } from "@/lib/domain";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return jsonResponse({
    user_project_id: id,
    ...createMentorSession(),
  });
}
