import Link from "next/link";
import { use } from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CheckCircle2, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { normalizeProject, prisma } from "@/lib/prisma";
import StartProjectButton from "./start-project-button";

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = use(params);

  return <ProjectDetailPageContent projectId={resolvedParams.projectId} />;
}

async function ProjectDetailPageContent({ projectId }: { projectId: string }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  const normalizedProject = project ? normalizeProject(project) : null;

  if (!normalizedProject) {
    return (
      <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">
        <div className="mx-auto max-w-3xl rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Project brief</p>
          <h1 className="mt-3 text-2xl font-semibold">This project brief is unavailable right now.</h1>
          <Link href="/projects" className="mt-6 inline-flex">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to projects
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Project brief</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{normalizedProject.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/projects">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Projects
              </Button>
            </Link>
            <StartProjectButton projectId={projectId} />
          </div>
        </header>

        <Card className="border-neutral-200 bg-white">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{normalizedProject.category}</Badge>
              <Badge variant="secondary">{normalizedProject.difficulty}</Badge>
              <Badge>{normalizedProject.role}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-5">
              <div className="mb-2 flex items-center gap-2 text-neutral-700">
                <BriefcaseBusiness className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Context</span>
              </div>
              <p className="text-sm leading-7 text-neutral-700">{normalizedProject.business_context}</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-neutral-200 p-5">
                <div className="mb-3 flex items-center gap-2 text-neutral-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <h2 className="text-base font-semibold">Requirements</h2>
                </div>
                <ul className="space-y-2 text-sm text-neutral-700">
                  {(normalizedProject.requirements ?? []).map((item: string) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-neutral-900" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-neutral-200 p-5">
                <div className="mb-3 flex items-center gap-2 text-neutral-700">
                  <ShieldCheck className="h-4 w-4" />
                  <h2 className="text-base font-semibold">Constraints</h2>
                </div>
                <ul className="space-y-2 text-sm text-neutral-700">
                  {(normalizedProject.constraints ?? []).map((item: string) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-neutral-900" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200 p-5">
              <div className="mb-3 flex items-center gap-2 text-neutral-700">
                <ArrowRight className="h-4 w-4" />
                <h2 className="text-base font-semibold">Role</h2>
              </div>
              <p className="text-sm leading-7 text-neutral-700">{normalizedProject.role}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
