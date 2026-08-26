import { jsonError, jsonResponse } from "@/lib/api";
import { getProjectById, startProject } from "@/lib/domain";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const project = getProjectById(projectId);

  if (!project) {
    return jsonError("PROJECT_NOT_FOUND", "Project not found.", 404);
  }

  return jsonResponse(startProject(projectId));
}
