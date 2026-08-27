import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { normalizeProject, prisma } from "@/lib/prisma";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "asc" } });
  const normalizedProjects = projects.map(normalizeProject);

  return (
    <main className="text-neutral-900 dark:text-neutral-100">
      <div className="space-y-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Projects</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Choose a brief</h1>
          </div>
          <Link href="/">
            <Button variant="outline" className="gap-2 border-neutral-300 dark:border-neutral-800 dark:text-neutral-100">
              Dashboard
              <ArrowRight className="h-4 w-4 text-[#5CD4DF] dark:text-[#7DE8F2]" />
            </Button>
          </Link>
        </header>

        {normalizedProjects.length === 0 ? (
          <Card className="border border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to build something real?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                New project briefs are on the way. Check back soon and we will get you into your next challenge.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {normalizedProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="group block h-full">
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-vinter-cyan-light/10 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">{project.category}</p>
                        <CardTitle className="mt-2 text-2xl leading-tight">{project.title}</CardTitle>
                      </div>
                      <Badge variant="secondary">{project.difficulty}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">{project.description}</p>
                    <div className="flex items-center justify-between border-t border-neutral-300 pt-4 text-xs uppercase tracking-[0.2em] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                      <span className="text-[#5CD4DF] dark:text-[#7DE8F2]">Open</span>
                      <span className="inline-flex items-center gap-2 rounded-lg bg-[#5CD4DF] px-3 py-1.5 text-black font-semibold hover:opacity-90 transition-opacity dark:bg-[#7DE8F2]">
                        View
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
