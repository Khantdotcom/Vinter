import { auth } from "@/lib/auth";
import { jsonError, jsonResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  const accessToken = (session as any)?.accessToken ?? (session as any)?.user?.accessToken ?? null;

  if (!session || !session.user || !accessToken) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  const sessionUser = session.user as any;
  const userId = sessionUser.id ?? sessionUser.email ?? null;

  if (!userId) {
    return jsonError("UNAUTHORIZED", "No authenticated user id available.", 401);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const githubId = body.githubId ?? body.id ?? null;
    const name = body.name ?? null;
    const rawOwner = body.owner ?? null;
    const owner = typeof rawOwner === "object" && rawOwner ? rawOwner.login : typeof rawOwner === "string" ? rawOwner : null;
    const url = body.url ?? body.html_url ?? null;
    const visibility = typeof body.visibility === "string" ? body.visibility : body.private ? "PRIVATE" : "PUBLIC";
    const defaultBranch = body.defaultBranch ?? body.default_branch ?? "main";

    if (!id || !githubId || !name || !owner || !url) {
      return jsonError("INVALID_REPOSITORY", "Repository details are required.", 400);
    }

    const userProject = await prisma.userProject.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!userProject) {
      return jsonError("USER_PROJECT_NOT_FOUND", "User project not found.", 404);
    }

    if (userProject.userId !== userId && userProject.user?.id !== userId) {
      return jsonError("FORBIDDEN", "You do not have access to this project.", 403);
    }

    const repository = await prisma.repository.upsert({
      where: { userProjectId: userProject.id },
      update: {
        githubId: String(githubId),
        name,
        owner: String(owner),
        url,
        visibility: String(visibility).toUpperCase(),
        defaultBranch,
        status: "CONNECTED",
      },
      create: {
        userProjectId: userProject.id,
        githubId: String(githubId),
        name,
        owner: String(owner),
        url,
        visibility: String(visibility).toUpperCase(),
        defaultBranch,
        status: "CONNECTED",
      },
    });

    const updatedUserProject = await prisma.userProject.update({
      where: { id: userProject.id },
      data: {
        status: "REPOSITORY_CONNECTED",
      },
    });

    return jsonResponse({
      id: repository.id,
      userProjectId: updatedUserProject.id,
      status: updatedUserProject.status,
      repository: {
        githubId: repository.githubId,
        name: repository.name,
        owner: repository.owner,
        url: repository.url,
        visibility: repository.visibility,
        defaultBranch: repository.defaultBranch,
      },
    });
  } catch (error) {
    console.error("REPOSITORY_CONNECT_FAILED", error);
    return jsonError("REPOSITORY_CONNECT_FAILED", "Failed to connect repository.", 500);
  }
}
