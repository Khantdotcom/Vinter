import { notFound } from "next/navigation";
import { CheckCircle, ExternalLink, GitCommit, GitBranch, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

// Publicly accessible — no auth required
export default async function ProofPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;

  const proof = await prisma.proof.findUnique({
    where: { publicId },
    include: {
      userProject: {
        include: {
          user: true,
          project: true,
          repository: {
            include: { snapshots: { orderBy: { fetchedAt: "desc" }, take: 1 } },
          },
        },
      },
    },
  });

  if (!proof) notFound();

  const { userProject } = proof;
  const user = userProject.user;
  const project = userProject.project;
  const repository = userProject.repository;
  const snapshot = repository?.snapshots?.[0] ?? null;

  const competencies: string[] = (() => {
    try {
      return JSON.parse(proof.competencies);
    } catch {
      return [proof.competencies];
    }
  })();

  const verifiedThrough: {
    repositoryId?: string;
    snapshotId?: string;
    commitSha?: string;
    branch?: string;
  } = (() => {
    try {
      return JSON.parse(proof.verifiedThrough);
    } catch {
      return {};
    }
  })();

  const displayName = user.name ?? user.githubUsername ?? user.email ?? "Anonymous";
  const generatedAt = new Date(proof.generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl">
        {/* Header badge */}
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
            <Shield className="h-8 w-8 text-emerald-400" />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Verified by Vinter</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Certificate of Competence
          </h1>
          <p className="text-sm text-neutral-400">
            Issued {generatedAt}
          </p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

          <div className="p-8 space-y-8">
            {/* Recipient */}
            <section>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Awarded to</p>
              <p className="mt-2 text-2xl font-semibold text-white">{displayName}</p>
            </section>

            <hr className="border-neutral-800" />

            {/* Project */}
            <section className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Project</p>
              <p className="text-xl font-semibold text-white">{project.title}</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="border border-neutral-700 bg-neutral-800 text-neutral-300">
                  {project.role}
                </Badge>
                <Badge className="border border-neutral-700 bg-neutral-800 text-neutral-300">
                  {project.difficulty}
                </Badge>
                <Badge className="border border-neutral-700 bg-neutral-800 text-neutral-300">
                  {project.category}
                </Badge>
              </div>
            </section>

            <hr className="border-neutral-800" />

            {/* Competencies */}
            <section className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Verified Competencies</p>
              <ul className="space-y-2">
                {competencies.map((c, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span className="text-sm text-neutral-200">{c}</span>
                  </li>
                ))}
              </ul>
            </section>

            <hr className="border-neutral-800" />

            {/* Verified Through */}
            <section className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Verified Through</p>
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-3">
                {repository && (
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-4 w-4 shrink-0 text-neutral-500" />
                    <div>
                      <p className="text-xs text-neutral-500">Repository</p>
                      <a
                        href={repository.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-medium text-cyan-400 underline-offset-2 hover:underline"
                      >
                        {repository.owner}/{repository.name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}

                {(verifiedThrough.commitSha ?? snapshot?.commitSha) && (
                  <div className="flex items-start gap-3">
                    <GitCommit className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                    <div>
                      <p className="text-xs text-neutral-500">Locked Commit</p>
                      {repository?.url && (verifiedThrough.commitSha ?? snapshot?.commitSha) ? (
                        <a
                          href={`${repository.url}/commit/${verifiedThrough.commitSha ?? snapshot?.commitSha}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 font-mono text-xs text-cyan-400 underline-offset-2 hover:underline"
                        >
                          {verifiedThrough.commitSha ?? snapshot?.commitSha}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <p className="font-mono text-xs text-neutral-300">
                          {verifiedThrough.commitSha ?? snapshot?.commitSha}
                        </p>
                      )}
                      {(verifiedThrough.branch ?? snapshot?.branch) && (
                        <p className="mt-0.5 text-xs text-neutral-500">
                          branch: {verifiedThrough.branch ?? snapshot?.branch}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-800 bg-neutral-950 px-8 py-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-600">
                Proof ID: <span className="font-mono">{publicId}</span>
              </p>
              <p className="text-xs text-neutral-600">vinter.dev</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
