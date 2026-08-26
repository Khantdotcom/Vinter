"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MentorSessionPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/mentor-sessions/${params.id}`)
      .then((res) => res.json())
      .then((payload) => setSession(payload.data));
  }, [params.id]);

  if (!session) {
    return <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">Loading session...</main>;
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Mentor session</p>
            <h1 className="mt-2 text-3xl font-semibold">Question {session.question_number} / {session.max_questions}</h1>
          </div>
          <Badge>{session.status}</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {session.messages.map((message: any, index: number) => (
                <div key={`${message.role}-${index}`} className={`rounded border p-3 text-sm ${message.role === "MENTOR" ? "border-neutral-200 bg-neutral-100" : "border-neutral-200 bg-white"}`}>
                  <p className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">{message.role}</p>
                  <p className="text-neutral-700">{message.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline">Answer mentor</Button>
              <Button>Complete session</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
