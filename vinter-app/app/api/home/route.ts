import { auth } from "@/lib/auth";
import { jsonError, jsonResponse } from "@/lib/api";
import { prisma, normalizeProject } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  const sessionUser = session.user as any;
  const userId = sessionUser.id ?? sessionUser.email ?? null;

  if (!userId) {
    return jsonError("UNAUTHORIZED", "No authenticated user id available.", 401);
  }

  try {
    const activeUserProject = await prisma.userProject.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      include: {
        project: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!activeUserProject || !activeUserProject.project) {
      return jsonResponse({
        current_project: null,
        next_action: { type: "CHOOSE_PROJECT" },
      });
    }

    const project = normalizeProject(activeUserProject.project);

    return jsonResponse({
      current_project: {
        id: project.id,
        title: project.title,
        category: project.category,
        progress: activeUserProject.progress,
        role: project.role,
        description: project.description,
        requirements: project.requirements,
        constraints: project.constraints,
        acceptance_criteria: project.acceptance_criteria,
        competencies: project.competencies,
      },
      next_action: { type: "CONTINUE_PROJECT" },
    });
  } catch (error) {
    console.error("HOME_FETCH_FAILED", error);
    return jsonError("HOME_FETCH_FAILED", "Failed to load home state.", 500);
  }
}
