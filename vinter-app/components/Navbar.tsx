import Link from "next/link";

import LoginButton from "@/components/LoginButton";
import SignOutButton from "@/components/SignOutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function Navbar() {
  const session = authOptions ? await getServerSession(authOptions) : null;
  const user = session?.user as { name?: string; email?: string; image?: string } | undefined;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-black/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-brand text-lg text-neutral-900 dark:text-neutral-100">
            Vinter
          </Link>

          <nav className="flex items-center gap-4 text-sm font-medium text-neutral-600 dark:text-neutral-300">
            <Link href="/projects" className="transition-colors hover:text-[#5CD4DF] dark:hover:text-[#7DE8F2]">
              Projects
            </Link>
            <Link href="/proofs" className="transition-colors hover:text-[#5CD4DF] dark:hover:text-[#7DE8F2]">
              Proofs
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="group relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-label="Open user menu"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-600"
              >
                {(user.name ?? user.email ?? "U").slice(0, 1).toUpperCase()}
              </button>

              <div className="invisible absolute right-0 top-10 z-50 w-44 translate-y-1 rounded-lg border border-neutral-200 bg-white/90 p-1.5 opacity-0 shadow-xl backdrop-blur-md transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 dark:border-neutral-800 dark:bg-black/90">
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-md px-3 py-2 text-left text-sm text-neutral-400 dark:text-neutral-500"
                >
                  Profile
                </button>

                <Link
                  href="/proofs"
                  className="block rounded-md px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
                >
                  My Proofs
                </Link>

                <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />

                <SignOutButton className="w-full rounded-md border-0 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40" />
              </div>
            </div>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </header>
  );
}
