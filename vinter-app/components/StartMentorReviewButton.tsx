"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  userProjectId: string;
};

export default function StartMentorReviewButton({ userProjectId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mentor-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProjectId }),
      });
      const payload = await res.json();
      if (!res.ok || payload.error) {
        setError(payload.error?.message ?? "Failed to start mentor review.");
        return;
      }
      const sessionId: string = payload.data.sessionId;
      router.push(`/mentor-sessions/${sessionId}`);
    } catch {
      setError("Failed to start mentor review.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <Button onClick={handleStart} disabled={loading} className="gap-2">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageSquare className="h-4 w-4" />
        )}
        {loading ? "Starting…" : "Start Mentor Review"}
      </Button>
    </div>
  );
}
