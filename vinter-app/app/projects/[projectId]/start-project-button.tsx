"use client";

import { Play } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function StartProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();

  const handleStartProject = async () => {
    const response = await fetch(`/api/projects/${projectId}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const payload = await response.json();

    if (response.ok || payload?.data) {
      router.push(`/projects/${projectId}/overview`);
      return;
    }

    router.push(`/projects/${projectId}/overview`);
  };

  return (
    <Button onClick={handleStartProject} className="gap-2">
      Start Project
      <Play className="h-4 w-4" />
    </Button>
  );
}
