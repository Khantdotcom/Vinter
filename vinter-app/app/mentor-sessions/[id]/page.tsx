import Link from "next/link";
import { use } from "react";
import { ArrowLeft, GitBranch } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { normalizeProject, prisma } from "@/lib/prisma";
import MentorChat from "@/components/MentorChat";

export default function MentorSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return <MentorSessionPageContent sessionId={resolvedParams.id} />;
}

async function MentorSessionPageContent({ sessionId }: { sessionId: string }) {
  const mentorSession = await prisma.mentorSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      userProject: {
        include: {
          project: true,
          repository: {
            include: { snapshots: { orderBy: { fetchedAt: "desc" }, take: 1 } },
          },
        },
      },
    },
  });

  if (!mentorSession) {
    return (
      <main className="text-neutral-900 dark:text-neutral-100">
        <div className="rounded-lg border border-neutral-300 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Mentor session</p>
          <h1 className="mt-3 text-2xl font-semibold">We could not find that mentor session.</h1>
        </div>
      </main>
    );
  }

  const project = mentorSession.userProject?.project
    ? normalizeProject(mentorSession.userProject.project)
    : null;
  const repository = mentorSession.userProject?.repository ?? null;
  const snapshot = repository?.snapshots?.[0] ?? null;
  const isCompleted = mentorSession.status === "COMPLETED";
  const userProjectId = mentorSession.userProjectId;
  const projectId = mentorSession.userProject?.projectId;

  const initialMessages = mentorSession.messages.map((m) => ({
    id: m.id,
    role: m.role as "MENTOR" | "USER",
    content: m.content,
  }));

  return (
    <main className="text-neutral-900 dark:text-neutral-100">
      <div className="space-y-8">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Mentor session</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {project?.title ?? "Technical Review"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{mentorSession.status}</Badge>
            {projectId && (
              <Link href={`/projects/${projectId}/overview`}>
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to workspace
                </Button>
              </Link>
            )}
          </div>
        </header>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left panel – static context */}
          <aside className="space-y-4">
            {project && (
              <div className="rounded-lg border border-neutral-300 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Project</p>
                <h2 className="mt-2 text-base font-semibold">{project.title}</h2>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{project.category}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{project.difficulty}</Badge>
                  <Badge variant="secondary">{project.role}</Badge>
                </div>
              </div>
            )}

            {repository ? (
              <div className="rounded-lg border border-neutral-300 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
                <div className="mb-2 flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-[#5CD4DF] dark:text-[#7DE8F2]" />
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Repository</p>
                </div>
                <a
                  href={repository.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-neutral-900 underline-offset-2 hover:underline dark:text-neutral-100"
                >
                  {repository.owner}/{repository.name}
                </a>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {repository.visibility?.toLowerCase()} · {repository.defaultBranch}
                </p>
                {snapshot && (
                  <p className="mt-2 break-all font-mono text-xs text-neutral-400 dark:text-neutral-500">
                    {snapshot.commitSha}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-neutral-300 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">No repository connected yet. Link one to unlock deeper code-level feedback.</p>
              </div>
            )}
          </aside>

          {/* Right panel – chat */}
          <div className="flex min-h-[600px] flex-col rounded-lg border border-neutral-300 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
            <h2 className="mb-4 text-base font-semibold">Conversation</h2>
            <MentorChat
              sessionId={sessionId}
              userProjectId={userProjectId}
              initialMessages={initialMessages}
              isCompleted={isCompleted}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
