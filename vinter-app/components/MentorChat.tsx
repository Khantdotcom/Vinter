"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, Lock, Send } from "lucide-react";

import { Button } from "@/components/ui/button";

type Message = {
  id: string;
  role: "MENTOR" | "USER";
  content: string;
};

type Props = {
  sessionId: string;
  userProjectId: string;
  initialMessages: Message[];
  isCompleted: boolean;
};

export default function MentorChat({ sessionId, userProjectId, initialMessages, isCompleted: initiallyCompleted }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [error, setError] = useState<string | null>(null);
  const [assessing, setAssessing] = useState(false);
  const [assessError, setAssessError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function handleGenerateAssessment() {
    setAssessing(true);
    setAssessError(null);
    try {
      const res = await fetch(`/api/user-projects/${userProjectId}/assessments`, {
        method: "POST",
      });
      const payload = await res.json();
      if (!res.ok || payload.error) {
        setAssessError(payload.error?.message ?? "Assessment failed. Please try again.");
        return;
      }
      const { passed, proofPublicId } = payload.data;
      if (passed && proofPublicId) {
        router.push(`/proofs/${proofPublicId}`);
      } else {
        router.push(`/user-projects/${userProjectId}`);
      }
    } catch {
      setAssessError("Assessment failed. Please try again.");
    } finally {
      setAssessing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || loading || completed) return;

    // Optimistic user message
    const optimisticId = `optimistic-${Date.now()}`;
    setMessages((prev) => [...prev, { id: optimisticId, role: "USER", content }]);
    setInput("");
    setLoading(true);
    setError(null);

    // Scroll after optimistic append
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      const res = await fetch(`/api/mentor-sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const payload = await res.json();

      if (!res.ok || payload.error) {
        setError(payload.error?.message ?? "Failed to send message.");
        // Roll back optimistic message
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        return;
      }

      const aiMessage: Message = {
        id: payload.data.messageId,
        role: "MENTOR",
        content: payload.data.content,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (payload.data.sessionComplete) {
        setCompleted(true);
      }
    } catch {
      setError("Failed to send message.");
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((message, idx) => {
          const isMentor = message.role === "MENTOR";
          return (
            <div
              key={message.id ?? idx}
              className={`rounded-lg border p-4 text-sm ${
                isMentor
                  ? "border-neutral-200 bg-neutral-50 text-neutral-800"
                  : "border-neutral-300 bg-white text-neutral-900"
              }`}
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
                {isMentor ? "Mentor" : "You"}
              </p>
              <p className="whitespace-pre-wrap leading-6">{message.content}</p>
            </div>
          );
        })}

        {loading && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">Mentor</p>
            <p className="animate-pulse text-neutral-400">Mentor is typing…</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <p className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Input or locked state */}
      {completed ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
            <Lock className="h-4 w-4 shrink-0 text-neutral-400" />
            <div>
              <p className="text-sm font-medium text-neutral-900">Review Complete</p>
              <p className="text-xs text-neutral-500">The mentor session has ended. Your responses have been recorded.</p>
            </div>
          </div>
          {assessError && (
            <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{assessError}</p>
          )}
          <Button
            onClick={handleGenerateAssessment}
            disabled={assessing}
            className="w-full gap-2"
          >
            {assessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Assessment…
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Generate Final Assessment
              </>
            )}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-neutral-200 pt-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            placeholder="Type your response…"
            rows={3}
            disabled={loading}
            className="flex-1 resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-50"
          />
          <Button type="submit" disabled={loading || !input.trim()} className="self-end gap-2">
            <Send className="h-4 w-4" />
            Send
          </Button>
        </form>
      )}
    </div>
  );
}
