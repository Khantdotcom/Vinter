import { jsonError, jsonResponse } from "@/lib/api";
import { prisma, normalizeProject } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return jsonError("PROJECT_NOT_FOUND", "Project not found.", 404);
    }

    return jsonResponse(normalizeProject(project));
  } catch (error) {
    console.error("PROJECT_FETCH_FAILED", error);
    return jsonError("PROJECT_FETCH_FAILED", "Failed to load project.", 500);
  }
}
