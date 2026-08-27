import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  return (
    <header className="border-b border-neutral-300 dark:border-neutral-800">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <div className="font-brand text-lg text-neutral-900 dark:text-neutral-100">Vinter</div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="inline-flex items-center rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 dark:border-neutral-800 dark:text-neutral-300">
            Auth
          </div>
        </div>
      </div>
    </header>
  );
}
