import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProofsPage() {
  const session = authOptions ? await getServerSession(authOptions) : null;
  const sessionUser = session?.user as { id?: string } | undefined;
  const userId = sessionUser?.id;

  const proofs = userId
    ? await prisma.proof.findMany({
        where: {
          userProject: {
            userId,
          },
        },
        include: {
          userProject: {
            include: {
              project: true,
            },
          },
        },
        orderBy: {
          generatedAt: "desc",
        },
      })
    : [];

  return (
    <section className="space-y-6 text-neutral-900 dark:text-neutral-100">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Proofs</p>
        <h1 className="mt-2 text-3xl font-semibold">Your Public Proofs</h1>
      </header>

      {!session?.user ? (
        <div className="rounded-xl border border-neutral-300 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Sign in to view your proof history.</p>
        </div>
      ) : proofs.length === 0 ? (
        <div className="rounded-xl border border-neutral-300 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">No proofs yet. Complete a project assessment to generate your first public proof.</p>
          <Link
            href="/projects"
            className="mt-4 inline-flex rounded-lg bg-[#5CD4DF] px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 dark:bg-[#7DE8F2]"
          >
            Browse Projects
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {proofs.map((proof) => (
            <Link
              key={proof.id}
              href={`/proofs/${proof.publicId}`}
              className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-vinter-cyan-light/10 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl overflow-hidden p-5"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Proof</p>
              <h2 className="mt-2 text-lg font-semibold">{proof.userProject.project.title}</h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Issued {new Date(proof.generatedAt).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
