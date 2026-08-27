"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, SendHorizonal } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  userProjectId: string;
};

export default function SubmitProjectButton({ userProjectId }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/user-projects/${userProjectId}/submissions`, {
        method: "POST",
      });
      const payload = await res.json();
      if (!res.ok || payload.error) {
        setError(payload.error?.message ?? "Submission failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SendHorizonal className="h-4 w-4" />
        )}
        {submitting ? "Submitting…" : "Submit for Review"}
      </Button>
    </div>
  );
}
