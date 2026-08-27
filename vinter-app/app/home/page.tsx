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
  const sessionUser = session?.user as { id?: string } | undefined;
  const userId = sessionUser?.id;

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
    <main className="text-neutral-900 dark:text-neutral-100">
      <div className="space-y-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Home</p>
            <h1 className="mt-2 text-2xl font-semibold">Welcome back</h1>
          </div>
          <Link href="/projects">
            <Button variant="outline" className="gap-2 border-neutral-300 dark:border-neutral-800 dark:text-neutral-100">
              Browse projects
              <ArrowRight className="h-4 w-4 text-[#5CD4DF] dark:text-[#7DE8F2]" />
            </Button>
          </Link>
        </header>

        {nextActionType === "CONTINUE_PROJECT" && currentProject ? (
          <Card className="border border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200">
                <BriefcaseBusiness className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Current project</span>
              </div>
              <CardTitle className="mt-2 text-2xl">{currentProject.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{currentProject.category}</Badge>
                <Badge variant="secondary">{activeProject?.progress ?? 0}% complete</Badge>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
                  <span>Progress</span>
                  <span>{activeProject?.progress ?? 0}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-[#5CD4DF] dark:bg-[#7DE8F2]"
                    style={{ width: `${activeProject?.progress ?? 0}%` }}
                  />
                </div>
              </div>

              <Button asChild className="w-full bg-neutral-900 text-white sm:w-auto dark:bg-neutral-100 dark:text-neutral-900">
                <Link href={`/projects/${currentProject.id}/overview`}>
                  Continue Working
                  <ArrowRight className="h-4 w-4 text-[#5CD4DF] dark:text-[#7DE8F2]" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200">
                <FolderOpen className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Start a build</span>
              </div>
              <CardTitle className="mt-2 text-2xl">Ready to build something real?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="max-w-xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                Pick a brief, explore the requirements, and start shipping your next proof of skill step by step.
              </p>
              <Button asChild className="w-full bg-neutral-900 text-white sm:w-auto dark:bg-neutral-100 dark:text-neutral-900">
                <Link href="/projects">
                  Choose a Project
                  <ArrowRight className="h-4 w-4 text-[#5CD4DF] dark:text-[#7DE8F2]" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
