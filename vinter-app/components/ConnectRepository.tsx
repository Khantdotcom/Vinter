"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GitBranch, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Repo = {
  id: string;
  githubId: string;
  name: string;
  owner: string;
  url: string;
  visibility: string;
  default_branch: string;
  defaultBranch: string;
};

type Props = {
  userProjectId: string;
};

export default function ConnectRepository({ userProjectId }: Props) {
  const router = useRouter();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepos() {
      setLoadingRepos(true);
      setError(null);
      try {
        const res = await fetch("/api/github/repositories");
        const payload = await res.json();
        if (!res.ok || payload.error) {
          setError(payload.error?.message ?? "Failed to load repositories.");
          return;
        }
        const list: Repo[] = Array.isArray(payload.data) ? payload.data : [];
        setRepos(list);
        if (list.length > 0) setSelectedId(list[0].id);
      } catch {
        setError("Failed to load repositories.");
      } finally {
        setLoadingRepos(false);
      }
    }
    fetchRepos();
  }, []);

  async function handleConnect() {
    const repo = repos.find((r) => r.id === selectedId);
    if (!repo) return;

    setConnecting(true);
    setError(null);
    try {
      const res = await fetch(`/api/user-projects/${userProjectId}/repository`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubId: repo.githubId,
          name: repo.name,
          owner: repo.owner,
          url: repo.url,
          visibility: repo.visibility,
          defaultBranch: repo.defaultBranch ?? repo.default_branch,
        }),
      });
      const payload = await res.json();
      if (!res.ok || payload.error) {
        setError(payload.error?.message ?? "Failed to connect repository.");
        return;
      }
      router.refresh();
    } catch {
      setError("Failed to connect repository.");
    } finally {
      setConnecting(false);
    }
  }

  if (loadingRepos) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading repositories…
      </div>
    );
  }

  if (repos.length === 0 && !error) {
    return (
      <p className="text-sm text-neutral-500">We could not find repos yet. Push your project to GitHub and come back to connect it.</p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="flex-1 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
        >
          {repos.map((repo) => (
            <option key={repo.id} value={repo.id}>
              {repo.owner}/{repo.name}
              {repo.visibility === "PRIVATE" ? " (private)" : ""}
            </option>
          ))}
        </select>
        <Button
          onClick={handleConnect}
          disabled={!selectedId || connecting}
          className="gap-2"
        >
          {connecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GitBranch className="h-4 w-4" />
          )}
          {connecting ? "Connecting…" : "Connect"}
        </Button>
      </div>
    </div>
  );
}
