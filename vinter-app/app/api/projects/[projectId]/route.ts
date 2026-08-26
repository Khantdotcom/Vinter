import { jsonError, jsonResponse } from "@/lib/api";
import { getProjectById } from "@/lib/domain";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const project = getProjectById(projectId);

  if (!project) {
    return jsonError("PROJECT_NOT_FOUND", "Project not found.", 404);
  }

  return jsonResponse({
    id: project.id,
    title: project.title,
    description: project.description,
    business_context: project.business_context,
    role: project.role,
    requirements: project.requirements,
    constraints: project.constraints,
    acceptance_criteria: project.acceptance_criteria,
    competencies: project.competencies,
  });
}
