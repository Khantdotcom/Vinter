import { notFound } from "next/navigation";
import { use } from "react";
import { CheckCircle, ExternalLink, GitCommit, GitBranch, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

// Publicly accessible — no auth required
export default function ProofPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = use(params);

  return <ProofPageContent publicId={resolvedParams.publicId} />;
}

async function ProofPageContent({ publicId }: { publicId: string }) {
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
    <main className="relative min-h-screen overflow-hidden bg-[#000000] px-6 py-16 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(1000px 500px at 50% -120px, rgba(92, 212, 223, 0.22), transparent 65%), radial-gradient(700px 420px at 90% 20%, rgba(92, 212, 223, 0.12), transparent 60%)",
        }}
      />

      <div className="relative mx-auto flex min-h-[78vh] w-full max-w-3xl items-center">
        <div className="w-full">
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#5CD4DF]/45 bg-[#5CD4DF]/10 shadow-[0_0_36px_rgba(92,212,223,0.35)]">
              <Shield className="h-8 w-8 text-[#5CD4DF]" />
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Verified by Vinter</p>
            <h1 className="font-brand text-4xl tracking-tight text-white sm:text-5xl">
              Foundation Proof
            </h1>
            <p className="text-sm text-neutral-400">Issued {generatedAt}</p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#5CD4DF]/30 bg-[#090c0f] shadow-[0_0_0_1px_rgba(92,212,223,0.08),0_24px_72px_rgba(0,0,0,0.75)]">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#5CD4DF]/90 via-[#7DE8F2] to-[#5CD4DF]/90" />

            <div className="space-y-8 p-8 sm:p-10">
              <section>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Awarded to</p>
                <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{displayName}</p>
              </section>

              <hr className="border-white/10" />

              <section className="space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Project</p>
                <p className="font-brand text-2xl text-white sm:text-3xl">{project.title}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="border border-[#5CD4DF]/35 bg-[#10171c] text-[#7DE8F2]">{project.role}</Badge>
                  <Badge className="border border-[#5CD4DF]/35 bg-[#10171c] text-[#7DE8F2]">{project.difficulty}</Badge>
                  <Badge className="border border-[#5CD4DF]/35 bg-[#10171c] text-[#7DE8F2]">{project.category}</Badge>
                </div>
              </section>

              <hr className="border-white/10" />

              <section className="space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Verified Competencies</p>
                <ul className="space-y-2.5">
                  {competencies.map((c, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#5CD4DF] drop-shadow-[0_0_8px_rgba(92,212,223,0.5)]" />
                      <span className="text-sm leading-6 text-neutral-200">{c}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <hr className="border-white/10" />

              <section className="space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                  Verified Through: GitHub Repository &amp; Commit SHA
                </p>
                <div className="space-y-4 rounded-xl border border-[#2b3339] bg-[#13171b] p-5 font-mono text-xs shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
                  {repository ? (
                    <div className="flex items-start gap-3">
                      <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-[#5CD4DF]" />
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">Repository</p>
                        <a
                          href={repository.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1.5 break-all text-[#7DE8F2] underline decoration-[#5CD4DF]/50 underline-offset-2"
                        >
                          {repository.owner}/{repository.name}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-neutral-400">Repository evidence is not available in this proof snapshot.</p>
                  )}

                  {(verifiedThrough.commitSha ?? snapshot?.commitSha) ? (
                    <div className="flex items-start gap-3">
                      <GitCommit className="mt-0.5 h-4 w-4 shrink-0 text-[#5CD4DF]" />
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">Commit SHA</p>
                        {repository?.url ? (
                          <a
                            href={`${repository.url}/commit/${verifiedThrough.commitSha ?? snapshot?.commitSha}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1.5 break-all text-[#7DE8F2] underline decoration-[#5CD4DF]/50 underline-offset-2"
                          >
                            {verifiedThrough.commitSha ?? snapshot?.commitSha}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <p className="mt-1 break-all text-neutral-200">{verifiedThrough.commitSha ?? snapshot?.commitSha}</p>
                        )}
                        {(verifiedThrough.branch ?? snapshot?.branch) && (
                          <p className="mt-1 text-neutral-400">branch: {verifiedThrough.branch ?? snapshot?.branch}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-neutral-400">Commit evidence is not available in this proof snapshot.</p>
                  )}
                </div>
              </section>
            </div>

            <div className="border-t border-white/10 bg-[#07090b] px-8 py-4 sm:px-10">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-neutral-500">
                  Proof ID: <span className="font-mono text-neutral-300">{publicId}</span>
                </p>
                <p className="text-xs text-neutral-500">vinter.dev</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
