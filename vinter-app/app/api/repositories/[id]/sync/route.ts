import { jsonResponse } from "@/lib/api";
import { createRepositorySyncJob } from "@/lib/domain";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return jsonResponse({
    repository_id: id,
    ...createRepositorySyncJob(),
  });
}
