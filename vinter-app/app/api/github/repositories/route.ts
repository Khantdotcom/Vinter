import { auth } from "@/lib/auth";
import { jsonError, jsonResponse } from "@/lib/api";

export async function GET() {
  const session = await auth();
  const accessToken = (session as any)?.accessToken ?? (session as any)?.user?.accessToken ?? null;

  if (!session || !accessToken) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  try {
    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=30", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "vinter-app",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text();
      return jsonError("GITHUB_REPOS_FETCH_FAILED", body || "Failed to load GitHub repositories.", response.status);
    }

    const payload = await response.json();
    const repositories = Array.isArray(payload) ? payload : [];

    const mapped = repositories.map((repo: any) => ({
      id: String(repo.id),
      githubId: String(repo.id),
      name: repo.name,
      owner: repo.owner?.login ?? "",
      ownerLogin: repo.owner?.login ?? "",
      url: repo.html_url ?? "",
      html_url: repo.html_url ?? "",
      visibility: repo.private ? "PRIVATE" : "PUBLIC",
      default_branch: repo.default_branch ?? "main",
      defaultBranch: repo.default_branch ?? "main",
    }));

    return jsonResponse(mapped);
  } catch (error) {
    console.error("GITHUB_REPOS_FETCH_FAILED", error);
    return jsonError("GITHUB_REPOS_FETCH_FAILED", "Failed to load GitHub repositories.", 500);
  }
}
