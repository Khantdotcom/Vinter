import { auth } from "@/lib/auth";
import { jsonError, jsonResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
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

  if (!id) {
    return jsonError("INVALID_SUBMISSION", "A valid user project id is required.", 400);
  }

  try {
    const userProject = await prisma.userProject.findUnique({
      where: { id },
      include: { user: true, project: true },
    });

    if (!userProject) {
      return jsonError("USER_PROJECT_NOT_FOUND", "User project not found.", 404);
    }

    if (userProject.userId !== userId && userProject.user?.id !== userId) {
      return jsonError("FORBIDDEN", "You do not have access to this project.", 403);
    }

    const repository = await prisma.repository.findUnique({
      where: { userProjectId: userProject.id },
    });

    if (!repository) {
      return jsonError("REPOSITORY_NOT_FOUND", "Repository has not been connected for this project yet.", 400);
    }

    const branch = repository.defaultBranch || "main";
    const githubUrl = `https://api.github.com/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/commits/${encodeURIComponent(branch)}`;

    const githubResponse = await fetch(githubUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "vinter-app",
      },
      cache: "no-store",
    });

    if (!githubResponse.ok) {
      const body = await githubResponse.text();
      return jsonError("GITHUB_COMMIT_FETCH_FAILED", body || "Failed to fetch the latest GitHub commit.", githubResponse.status);
    }

    const githubPayload = await githubResponse.json();
    const commitSha = githubPayload?.sha;

    if (!commitSha) {
      return jsonError("GITHUB_COMMIT_FETCH_FAILED", "GitHub commit response did not include a SHA.", 502);
    }

    const snapshot = await prisma.repositorySnapshot.create({
      data: {
        repositoryId: repository.id,
        commitSha,
        branch,
        fetchedAt: new Date(),
      },
    });

    await prisma.userProject.update({
      where: { id: userProject.id },
      data: {
        status: "SUBMITTED",
      },
    });

    return jsonResponse({
      id: snapshot.id,
      userProjectId: userProject.id,
      repositoryId: repository.id,
      commitSha: snapshot.commitSha,
      branch: snapshot.branch,
      status: "SUBMITTED",
      submittedAt: snapshot.fetchedAt,
    });
  } catch (error) {
    console.error("PROJECT_SUBMISSION_FAILED", error);
    return jsonError("PROJECT_SUBMISSION_FAILED", "Failed to submit project.", 500);
  }
}
