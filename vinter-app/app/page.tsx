import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowRight, GitBranch, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import LoginButton from "@/components/LoginButton";
import { authOptions } from "@/lib/auth";
import { normalizeProject, prisma } from "@/lib/prisma";

function LandingView() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-neutral-300 bg-white px-6 py-16 dark:border-neutral-800 dark:bg-neutral-950 md:px-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 300px at 20% -10%, rgba(92,212,223,0.2), transparent 70%), radial-gradient(700px 260px at 90% 10%, rgba(125,232,242,0.15), transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-neutral-500 dark:text-neutral-400">Virtual Internship Platform</p>
        <h1 className="font-brand mt-4 text-4xl leading-tight text-neutral-900 dark:text-neutral-100 md:text-5xl">
          Build. Explain. Prove.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300 md:text-base">
          Ship practical engineering work, defend your choices with an AI mentor, and publish verifiable proof of competence.
        </p>
        <div className="mt-8 flex items-center justify-center">
          <LoginButton />
        </div>
      </div>
    </section>
  );
}

function getNextAction(status: string, projectId: string) {
  if (status === "REPOSITORY_CONNECTED") {
    return {
      label: "Submit Repository for Review",
      href: `/projects/${projectId}/overview`,
    };
  }

  if (status === "SUBMITTED") {
    return {
      label: "Start Mentor Session",
      href: `/projects/${projectId}/overview`,
    };
  }

  if (status === "MENTOR_SESSION") {
    return {
      label: "Continue Mentor Session",
      href: `/projects/${projectId}/overview`,
    };
  }

  return {
    label: "Connect Repository",
    href: `/projects/${projectId}/overview`,
  };
}

function KineticCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-vinter-cyan-light/10 dark:border-neutral-800 dark:bg-neutral-950">
      {children}
    </div>
  );
}

function DashboardView({
  user,
  activeProject,
}: {
  user: { name?: string | null; email?: string | null };
  activeProject: {
    id: string;
    status: string;
    progress: number;
    proof: { publicId: string } | null;
    project: ReturnType<typeof normalizeProject>;
  } | null;
}) {
  const displayName = user.name ?? user.email?.split("@")[0] ?? "Builder";

  return (
    <section className="space-y-8">
      <header className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Workspace</p>
        <h1 className="font-brand mt-3 text-3xl text-neutral-900 dark:text-neutral-100 md:text-4xl">
          Welcome back, {displayName}. Ready to build?
        </h1>
      </header>

      {activeProject ? (
        <KineticCard>
          <div className="space-y-5 p-6 md:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{activeProject.project.category}</Badge>
              <Badge variant="secondary">{activeProject.status}</Badge>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{activeProject.project.title}</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Current Project</p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
                <span>Progress</span>
                <span>{activeProject.progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                <div
                  className="h-full rounded-full bg-[#5CD4DF] dark:bg-[#7DE8F2]"
                  style={{ width: `${activeProject.progress}%` }}
                />
              </div>
            </div>

            {activeProject.status === "COMPLETED" ? (
              <div className="space-y-3 rounded-lg border border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Assessment cycle complete. Nice work finishing this project.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {activeProject.proof ? (
                    <Link
                      href={`/proofs/${activeProject.proof.publicId}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-vinter-cyan-light px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 dark:bg-vinter-cyan-dark"
                    >
                      View Certificate
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">
                      This attempt did not generate a certificate. Review feedback and keep improving.
                    </span>
                  )}
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900"
                  >
                    Browse New Challenges
                    <GitBranch className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={getNextAction(activeProject.status, activeProject.project.id).href}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#5CD4DF] px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 dark:bg-[#7DE8F2]"
                >
                  {getNextAction(activeProject.status, activeProject.project.id).label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/projects/${activeProject.project.id}/overview`}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900"
                >
                  Open Workspace
                  <GitBranch className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </KineticCard>
      ) : (
        <KineticCard>
          <div className="space-y-4 p-6 md:p-7">
            <div className="flex items-center gap-2 text-[#5CD4DF] dark:text-[#7DE8F2]">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Start your first project</span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              You haven&apos;t started a project yet. Choose a foundation project to begin your virtual internship.
            </p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-lg bg-[#5CD4DF] px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 dark:bg-[#7DE8F2]"
            >
              Explore Projects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </KineticCard>
      )}
    </section>
  );
}

export default async function RootPage() {
  const session = authOptions ? await getServerSession(authOptions) : null;

  if (!session?.user) {
    return <LandingView />;
  }

  const sessionUser = session.user as { id?: string; email?: string | null; name?: string | null };
  const userId = sessionUser.id ?? null;

  const activeUserProject = userId
    ? await prisma.userProject.findFirst({
        where: {
          userId,
          status: {
            in: ["ACTIVE", "REPOSITORY_CONNECTED", "SUBMITTED", "MENTOR_SESSION", "COMPLETED"],
          },
        },
        include: {
          project: true,
          proof: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      })
    : null;

  const activeProject =
    activeUserProject?.project
      ? {
          id: activeUserProject.id,
          status: activeUserProject.status,
          progress: activeUserProject.progress ?? 0,
          proof: activeUserProject.proof ? { publicId: activeUserProject.proof.publicId } : null,
          project: normalizeProject(activeUserProject.project),
        }
      : null;

  return <DashboardView user={sessionUser} activeProject={activeProject} />;
}
