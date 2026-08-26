import { auth } from "@/lib/auth";
import { jsonError, jsonResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;

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
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return jsonError("PROJECT_NOT_FOUND", "Project not found.", 404);
    }

    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const username =
        sessionUser.name ?? sessionUser.email?.split("@")[0] ?? "vinter-user";

      user = await prisma.user.create({
        data: {
          id: userId,
          username,
          email: sessionUser.email ?? null,
          githubUsername: sessionUser.githubUsername ?? null,
          githubId: sessionUser.githubId ?? null,
          image: sessionUser.image ?? null,
        },
      });
    }

    const userProject = await prisma.userProject.upsert({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: project.id,
        },
      },
      update: {
        status: "ACTIVE",
      },
      create: {
        userId: user.id,
        projectId: project.id,
        status: "ACTIVE",
      },
    });

    return jsonResponse({
      user_project_id: userProject.id,
      project_id: project.id,
      status: userProject.status,
    });
  } catch (error) {
    console.error("PROJECT_START_FAILED", error);
    return jsonError("PROJECT_START_FAILED", "Failed to start project.", 500);
  }
}
