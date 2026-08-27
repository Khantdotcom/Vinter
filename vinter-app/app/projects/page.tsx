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
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Projects</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Choose a brief</h1>
          </div>
          <Link href="/home">
            <Button variant="outline" className="gap-2">
              Home
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </header>

        {normalizedProjects.length === 0 ? (
          <Card className="border-neutral-200 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to build something real?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                New project briefs are on the way. Check back soon and we will get you into your next challenge.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {normalizedProjects.map((project: any) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="group block h-full">
                <Card className="h-full border-neutral-200 bg-white transition-colors duration-150 group-hover:border-neutral-300 group-hover:shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{project.category}</p>
                        <CardTitle className="mt-2 text-2xl leading-tight">{project.title}</CardTitle>
                      </div>
                      <Badge variant="secondary">{project.difficulty}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-6 text-neutral-600">{project.description}</p>
                    <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-xs uppercase tracking-[0.2em] text-neutral-500">
                      <span>Open</span>
                      <ArrowRight className="h-4 w-4" />
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
