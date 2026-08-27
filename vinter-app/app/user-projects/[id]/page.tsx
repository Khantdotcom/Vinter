"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type RequirementItem = {
  id: string;
  title: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING" | string;
};

type UserProjectView = {
  status: string;
  project: { title: string };
  progress: { percentage: number };
  next_action: { label: string; type: string };
  requirements: RequirementItem[];
  repository: {
    owner: string;
    name: string;
    default_branch: string;
    visibility: string;
  } | null;
};

export default function UserProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [userProject, setUserProject] = useState<UserProjectView | null>(null);

  useEffect(() => {
    fetch(`/api/user-projects/${resolvedParams.id}`)
      .then((res) => res.json())
      .then((payload) => setUserProject(payload.data));
  }, [resolvedParams.id]);

  if (!userProject) {
    return <main className="text-neutral-900 dark:text-neutral-100">Getting your project workspace ready...</main>;
  }

  return (
    <main className="text-neutral-900 dark:text-neutral-100">
      <div className="space-y-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Project overview</p>
            <h1 className="mt-2 text-3xl font-semibold">{userProject.project.title}</h1>
          </div>
          <Badge variant="success">{userProject.status}</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{userProject.progress.percentage}%</p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                <div className="h-full rounded-full bg-[#5CD4DF] dark:bg-[#7DE8F2]" style={{ width: `${userProject.progress.percentage}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next action</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{userProject.next_action.label}</p>
              <Button className="mt-4" variant="outline">{userProject.next_action.type}</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {userProject.requirements.map((requirement) => (
                  <li key={requirement.id} className="flex items-center justify-between rounded border border-neutral-200 p-3 text-sm">
                    <span>{requirement.title}</span>
                    <Badge variant={requirement.status === "COMPLETED" ? "success" : requirement.status === "IN_PROGRESS" ? "warning" : "secondary"}>{requirement.status}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Repository</CardTitle>
            </CardHeader>
            <CardContent>
              {userProject.repository ? (
                <div className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <p>{userProject.repository.owner}/{userProject.repository.name}</p>
                  <p>Default branch: {userProject.repository.default_branch}</p>
                  <p>Visibility: {userProject.repository.visibility}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">No repository connected yet. Connect one and let’s keep your momentum going.</p>
                  <Button onClick={() => fetch(`/api/repositories/repo_123/sync`, { method: "POST" })}>Sync repository</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
