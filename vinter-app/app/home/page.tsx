"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomeDashboardPage() {
  const [home, setHome] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/home").then((res) => res.json()),
      fetch("/api/profile").then((res) => res.json()),
    ]).then(([homeResponse, profileResponse]) => {
      setHome(homeResponse.data);
      setProfile(profileResponse.data);
    });
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Home</p>
            <h1 className="mt-2 text-2xl font-semibold">{profile?.username ?? "alex"}</h1>
          </div>
          <Link href="/">
            <Button variant="outline">Back to briefs</Button>
          </Link>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Current project</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{home?.current_project?.title ?? "Authentication API"}</p>
              <p className="mt-2 text-sm text-neutral-600">{home?.current_project?.category ?? "Backend"}</p>
              <Badge className="mt-4" variant="success">{home?.current_project?.progress ?? 80}% progress</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next action</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{home?.next_action?.label ?? "Submit for Mentor Review"}</p>
              <Button className="mt-4" asChild>
                <Link href="/user-projects/up_123">Open project</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proof count</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{home?.proof_count ?? 0}</p>
              <CardDescription>Shared evidence records</CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {(home?.recent_activity ?? []).map((item: any, index: number) => (
                  <li key={`${item.type}-${index}`} className="rounded border border-neutral-200 p-3 text-sm text-neutral-700">
                    {item.description}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-neutral-700">
                <p>GitHub: {profile?.github_username ?? "alex"}</p>
                <p>Projects started: {profile?.stats?.projects_started ?? 1}</p>
                <p>Projects completed: {profile?.stats?.projects_completed ?? 0}</p>
                <p>Proofs earned: {profile?.stats?.proofs_earned ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
