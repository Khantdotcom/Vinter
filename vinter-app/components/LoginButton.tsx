"use client";

import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("github", { callbackUrl: "/" })}
      className="rounded-lg bg-[#5CD4DF] px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 dark:bg-[#7DE8F2]"
    >
      Continue with GitHub
    </button>
  );
}
