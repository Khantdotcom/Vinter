import { jsonError, jsonResponse } from "@/lib/api";
import { getJobStatus } from "@/lib/domain";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;

  if (!jobId) {
    return jsonError("JOB_NOT_FOUND", "Job not found.", 404);
  }

  return jsonResponse(getJobStatus(jobId));
}
