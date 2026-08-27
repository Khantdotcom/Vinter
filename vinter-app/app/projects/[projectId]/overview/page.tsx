import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowLeft, Check, GitBranch, Lock, MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { normalizeProject, prisma } from "@/lib/prisma";
import ConnectRepository from "@/components/ConnectRepository";
import SubmitProjectButton from "@/components/SubmitProjectButton";
import StartMentorReviewButton from "@/components/StartMentorReviewButton";

export default async function ProjectOverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const session = authOptions ? await getServerSession(authOptions) : null;
  const userId = (session?.user as any)?.id;

  const [project, activeUserProject] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    userId
      ? prisma.userProject.findFirst({
          where: { userId: userId, projectId },
          include: { repository: true },
        })
      : null,
  ]);

  if (!project) {
    return (
      <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">
        <div className="mx-auto max-w-3xl rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Workspace</p>
          <h1 className="mt-3 text-2xl font-semibold">Project not found</h1>
        </div>
      </main>
    );
  }

  const normalizedProject = normalizeProject(project);
  const progress = activeUserProject?.projectId === projectId ? activeUserProject.progress ?? 0 : 0;
  const requirements = normalizedProject.requirements ?? [];
  const status = activeUserProject?.status ?? "ACTIVE";
  const repository = activeUserProject?.repository ?? null;

  const SUBMITTED_STATES = new Set(["SUBMITTED", "UNDER_REVIEW", "ASSESSED", "COMPLETED"]);
  const isSubmitted = SUBMITTED_STATES.has(status);

  // Resolve active mentor session id for MENTOR_SESSION status
  const activeMentorSession =
    status === "MENTOR_SESSION" && activeUserProject
      ? await prisma.mentorSession.findFirst({
          where: { userProjectId: activeUserProject.id, status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        })
      : null;

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Workspace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{normalizedProject.title}</h1>
          </div>
          <Link href={`/projects/${projectId}`}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to brief
            </Button>
          </Link>
        </header>

        <Card className="border-neutral-200 bg-white">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{normalizedProject.category}</Badge>
              <Badge variant="secondary">{normalizedProject.role}</Badge>
              <Badge variant="secondary">{status}</Badge>
            </div>
            <CardTitle className="mt-2 text-2xl">Project overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-neutral-600">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                <div className="h-full rounded-full bg-neutral-900" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200 p-5">
              <h2 className="text-base font-semibold">Requirements checklist</h2>
              <ul className="mt-4 space-y-3">
                {requirements.map((requirement: string) => (
                  <li key={requirement} className="flex items-center gap-3 rounded border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                    <span className="flex h-5 w-5 items-center justify-center rounded border border-neutral-300 bg-white">
                      <Check className="h-3.5 w-3.5 text-neutral-900" />
                    </span>
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Repository / submission section */}
            <div className="rounded-lg border border-neutral-200 p-5">
              <div className="mb-4 flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-neutral-500" />
                <h2 className="text-base font-semibold">Repository</h2>
              </div>

              {status === "MENTOR_SESSION" ? (
                <div className="space-y-4">
                  {repository && (
                    <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                      <Lock className="h-4 w-4 text-neutral-500" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Snapshot locked</p>
                        <a
                          href={repository.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-neutral-500 underline-offset-2 hover:underline"
                        >
                          {repository.owner}/{repository.name}
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-neutral-500" />
                    <h2 className="text-base font-semibold">Mentor session active</h2>
                  </div>
                  {activeMentorSession ? (
                    <Link href={`/mentor-sessions/${activeMentorSession.id}`}>
                      <Button className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Continue Mentor Session
                      </Button>
                    </Link>
                  ) : (
                    activeUserProject && <StartMentorReviewButton userProjectId={activeUserProject.id} />
                  )}
                </div>
              ) : isSubmitted ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                    <Lock className="h-4 w-4 text-neutral-500" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Under Review</p>
                      {repository && (
                        <a
                          href={repository.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-neutral-500 underline-offset-2 hover:underline"
                        >
                          {repository.owner}/{repository.name}
                        </a>
                      )}
                      <p className="mt-0.5 text-xs text-neutral-500">
                        Repository snapshot captured. Awaiting mentor assessment.
                      </p>
                    </div>
                  </div>
                  {activeUserProject && <StartMentorReviewButton userProjectId={activeUserProject.id} />}
                </div>
              ) : status === "REPOSITORY_CONNECTED" && repository ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                    <GitBranch className="h-4 w-4 text-neutral-500" />
                    <div>
                      <a
                        href={repository.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-neutral-900 underline-offset-2 hover:underline"
                      >
                        {repository.owner}/{repository.name}
                      </a>
                      <p className="text-xs text-neutral-500">
                        {repository.visibility?.toLowerCase()} · {repository.defaultBranch}
                      </p>
                    </div>
                  </div>
                  {activeUserProject && (
                    <SubmitProjectButton userProjectId={activeUserProject.id} />
                  )}
                </div>
              ) : (
                activeUserProject ? (
                  <ConnectRepository userProjectId={activeUserProject.id} />
                ) : (
                  <p className="text-sm text-neutral-500">Start the project to connect a repository.</p>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
