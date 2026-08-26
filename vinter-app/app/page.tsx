"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listProjects } from "@/lib/domain";

export default function HomePage() {
  const projects = listProjects();

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-10 flex items-center justify-between gap-4 border-b border-neutral-200 pb-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">Vinter</p>
            <h1 className="mt-2 text-2xl font-semibold">Build. Explain. Contribute. Earn.</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/home">
              <Button variant="secondary">Dashboard</Button>
            </Link>
            <Button onClick={() => signIn("github", { callbackUrl: "/home" })}>Continue with GitHub</Button>
          </div>
        </header>

        <section className="mb-10 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Badge variant="secondary">Foundation Level</Badge>
            </CardHeader>
            <CardContent>
              <CardTitle>Project Brief</CardTitle>
              <CardDescription>Start from a defined engineering task with requirements and constraints.</CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Badge variant="secondary">Repository</Badge>
            </CardHeader>
            <CardContent>
              <CardTitle>Submit GitHub Repo</CardTitle>
              <CardDescription>Use GitHub as the evidence source while Vinter owns the domain model.</CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Badge variant="secondary">Mentor</Badge>
            </CardHeader>
            <CardContent>
              <CardTitle>Technical Defense</CardTitle>
              <CardDescription>Discuss architecture, trade-offs, and failure handling with an AI mentor.</CardDescription>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Available projects</h2>
            <p className="text-sm text-neutral-500">Predefined MVP briefs</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <Card key={project.id} className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>{project.title}</CardTitle>
                    <Badge>{project.category}</Badge>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{project.difficulty}</Badge>
                    <Badge variant="secondary">{project.estimated_scope}</Badge>
                  </div>
                  <div className="mt-4">
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="outline" className="w-full">View brief</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
