"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const projectId = params.projectId;
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((payload) => setProject(payload.data))
      .catch(() => undefined);
  }, [projectId]);

  const startProject = async () => {
    const response = await fetch(`/api/projects/${projectId}/start`, { method: "POST" });
    const payload = await response.json();

    if (payload.data?.user_project_id) {
      router.push(`/user-projects/${payload.data.user_project_id}`);
    }
  };

  if (!project) {
    return <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Project brief</p>
            <h1 className="mt-2 text-3xl font-semibold">{project.title}</h1>
          </div>
          <Button onClick={startProject}>Start Project</Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge>{project.role}</Badge>
              <Badge variant="secondary">{project.category}</Badge>
              <Badge variant="secondary">{project.difficulty}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base text-neutral-700">{project.description}</CardDescription>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="mb-3 text-lg font-semibold">Business context</h2>
                <p className="text-sm text-neutral-700">{project.business_context}</p>
              </div>

              <div>
                <h2 className="mb-3 text-lg font-semibold">Requirements</h2>
                <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-700">
                  {project.requirements.map((item: string) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="mb-3 text-lg font-semibold">Constraints</h2>
                <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-700">
                  {project.constraints.map((item: string) => <li key={item}>{item}</li>)}
                </ul>
              </div>

              <div>
                <h2 className="mb-3 text-lg font-semibold">Acceptance criteria</h2>
                <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-700">
                  {project.acceptance_criteria.map((item: string) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
