"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function UserProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [userProject, setUserProject] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/user-projects/${resolvedParams.id}`)
      .then((res) => res.json())
      .then((payload) => setUserProject(payload.data));
  }, [resolvedParams.id]);

  if (!userProject) {
    return <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">Loading project...</main>;
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Project overview</p>
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
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                <div className="h-full rounded-full bg-neutral-900" style={{ width: `${userProject.progress.percentage}%` }} />
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
                {userProject.requirements.map((requirement: any) => (
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
                <div className="space-y-2 text-sm text-neutral-700">
                  <p>{userProject.repository.owner}/{userProject.repository.name}</p>
                  <p>Default branch: {userProject.repository.default_branch}</p>
                  <p>Visibility: {userProject.repository.visibility}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-neutral-600">No repository connected yet.</p>
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
