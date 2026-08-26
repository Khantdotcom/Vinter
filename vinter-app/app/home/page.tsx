import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowRight, BriefcaseBusiness, FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { normalizeProject, prisma } from "@/lib/prisma";

export default async function HomePage() {
  const session = authOptions ? await getServerSession(authOptions) : null;
  const userId = (session?.user as any)?.id;

  const activeProject = userId
    ? await prisma.userProject.findFirst({
        where: { userId, status: "ACTIVE" },
        include: { project: true },
        orderBy: { updatedAt: "desc" },
      })
    : null;

  const currentProject = activeProject?.project ? normalizeProject(activeProject.project) : null;
  const nextActionType = currentProject ? "CONTINUE_PROJECT" : "CHOOSE_PROJECT";

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Home</p>
            <h1 className="mt-2 text-2xl font-semibold">Welcome back</h1>
          </div>
          <Link href="/projects">
            <Button variant="outline" className="gap-2">
              Browse projects
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </header>

        {nextActionType === "CONTINUE_PROJECT" && currentProject ? (
          <Card className="border-neutral-200 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-neutral-700">
                <BriefcaseBusiness className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Current project</span>
              </div>
              <CardTitle className="mt-2 text-2xl">{currentProject.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{currentProject.category}</Badge>
                <Badge variant="secondary">{activeProject?.progress ?? 0}% complete</Badge>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-neutral-600">
                  <span>Progress</span>
                  <span>{activeProject?.progress ?? 0}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full rounded-full bg-neutral-900"
                    style={{ width: `${activeProject?.progress ?? 0}%` }}
                  />
                </div>
              </div>

              <Button asChild className="w-full sm:w-auto">
                <Link href={`/projects/${currentProject.id}/overview`}>
                  Continue Working
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-neutral-200 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-neutral-700">
                <FolderOpen className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Start a build</span>
              </div>
              <CardTitle className="mt-2 text-2xl">Choose your next project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="max-w-xl text-sm leading-6 text-neutral-600">
                Pick a brief, review the requirements, and start building with a focused, minimal workflow.
              </p>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/projects">
                  Choose a Project
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
