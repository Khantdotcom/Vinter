# Change Log

## 2026-08-27

### Assessment trigger UI and public Proof of Competence page

- Updated [vinter-app/components/MentorChat.tsx](vinter-app/components/MentorChat.tsx):
  - Added `userProjectId: string` prop.
  - Replaced the static "Review Complete" locked state with an actionable "Generate Final Assessment" button.
  - Button POSTs to `POST /api/user-projects/[userProjectId]/assessments` and shows a `Loader2` spinner during the AI round-trip.
  - On success: if `passed && proofPublicId`, routes to `/proofs/[proofPublicId]`; otherwise routes back to the user-project overview.
  - Assessment errors are displayed inline without disrupting the conversation view.
- Updated [vinter-app/app/mentor-sessions/\[id\]/page.tsx](vinter-app/app/mentor-sessions/%5Bid%5D/page.tsx) to pass the new `userProjectId` prop to `<MentorChat>`.
- Created [vinter-app/app/proofs/\[publicId\]/page.tsx](vinter-app/app/proofs/%5BpublicId%5D/page.tsx) — a public server component (no auth required):
  - Fetches `Proof` by `publicId` from Prisma, including `userProject.user`, `userProject.project`, and `userProject.repository.snapshots`.
  - Parses `proof.competencies` and `proof.verifiedThrough` from SQLite-serialised JSON strings back into typed objects.
  - Renders a dark "Certificate of Competence" UI with:
    - Emerald shield icon and gradient accent bar.
    - Recipient name (falls back through `name` → `githubUsername` → `email`).
    - Project title, role, difficulty, and category badges.
    - Verified competency list with `CheckCircle` icons.
    - "Verified Through" panel with a linked repository name and a linked commit SHA pointing to the exact `github.com/.../commit/SHA` URL.
    - Issue date and public proof ID in the footer.
- Verified with `cd /Users/khant.h/Vinter_V1/vinter-app && npm run build`; `/proofs/[publicId]` confirmed in the route table.

### Final Assessment and Proof Generation (Phase 5)

- Created [vinter-app/lib/assessment.ts](vinter-app/lib/assessment.ts) with a `generateFinalAssessment(userProjectId)` service:
  - Defines a Zod schema enforcing a structured response: `summary` (string), `passed` (boolean), and `evidences` (array of `{ competency, question, answer, note }`).
  - Fetches `UserProject` with `Project`, latest `RepositorySnapshot`, and most-recent `MentorSession.messages` directly from Prisma.
  - Builds a prompt including project title, role, required competencies, repo/snapshot context, and the full conversation transcript.
  - Calls `generateObject` from the Vercel AI SDK with the Zod schema to force a validated structured JSON response from `gemini-3.6-flash`.
- Created [vinter-app/app/api/user-projects/\[id\]/assessments/route.ts](vinter-app/app/api/user-projects/%5Bid%5D/assessments/route.ts) (`POST /api/user-projects/:id/assessments`):
  - Authenticates via `auth()` and verifies the requesting user owns the `UserProject`.
  - Calls `generateFinalAssessment(userProjectId)` to obtain the structured AI result.
  - Executes a single Prisma transaction:
    - Creates an `Assessment` record (`status: "COMPLETED"`, `summary`) with nested `AssessmentEvidence` rows for each extracted competency.
    - If `passed` is true, creates a `Proof` record using `crypto.randomUUID()` for `publicId`; serialises `competencies` and `verifiedThrough` (snapshot details) as `JSON.stringify` strings per the SQLite schema requirement.
    - Updates `UserProject.status` to `"COMPLETED"`.
  - Returns `{ data: { passed, proofPublicId, assessmentId }, error: null }`.
- Verified with `cd /Users/khant.h/Vinter_V1/vinter-app && npm run build`.

## 2026-08-26

### Auth integration fix

- Fixed the NextAuth compatibility issue in the app by aligning the exported auth handler with the installed version (`next-auth@^4.24.15`).
- Updated [vinter-app/lib/auth.ts](vinter-app/lib/auth.ts) to provide a v4-compatible `handlers` export while keeping a safe fallback redirect when GitHub credentials are unavailable.
- Kept the route entrypoint at [vinter-app/app/api/auth/\[...nextauth\]/route.ts](vinter-app/app/api/auth/%5B...nextauth%5D/route.ts) consistent with the app’s actual dependency version.

### Verification

- Confirmed the app builds successfully via `cd /Users/khant.h/Vinter_V1/vinter-app && npm run build`.
- Evidence: Next.js reported “Compiled successfully” and generated the app routes, including `/api/auth/[...nextauth]`.

### Persistence schema setup

- Added the Vinter MVP persistence model in [vinter-app/prisma/schema.prisma](vinter-app/prisma/schema.prisma), preserving the existing NextAuth `User`, `Account`, `Session`, and `VerificationToken` models.
- Added the MVP domain models for `Project`, `UserProject`, `Repository`, `RepositorySnapshot`, `MentorSession`, `MentorMessage`, `Assessment`, `AssessmentEvidence`, and `Proof`.
- Attempted to run the classic Prisma format/generate commands requested for review, but the installed Prisma CLI in this workspace is the newer platform wrapper, which returns `CLI.UNKNOWN_COMMAND` for `format` and `generate`.

### Current project state

- The app is in the Foundation MVP implementation stage.
- Core app scaffolding and auth wiring are in place and compiling.
- Full mentor/repository-assessment workflow remains to be implemented beyond the current foundation layer.

## 2026-08-27

### SQLite migration for local development

- Switched the app from PostgreSQL to SQLite by updating [vinter-app/.env](vinter-app/.env) to use `DATABASE_URL="file:./dev.db"`.
- Reworked [vinter-app/prisma/schema.prisma](vinter-app/prisma/schema.prisma) to be SQLite-compatible by:
  - changing the datasource provider to `sqlite`
  - preserving the existing NextAuth models exactly as-is
  - removing all Prisma `enum` blocks and replacing them with `String` fields using default string values
  - replacing all `Json` fields with `String` storage for SQLite compatibility
  - storing stringified JSON payloads in the project-level JSON-style fields
- Ran Prisma schema format and migration successfully using `npx prisma@5.22.0 format --schema prisma/schema.prisma && npx prisma@5.22.0 migrate dev --name init_sqlite_domain`.
- Result: the local SQLite database file [vinter-app/dev.db](vinter-app/dev.db) was created and the schema is now in sync.

### Core project REST API implementation

- Added App Router project endpoints in [vinter-app/app/api/projects/route.ts](vinter-app/app/api/projects/route.ts), [vinter-app/app/api/projects/\[projectId\]/route.ts](vinter-app/app/api/projects/%5BprojectId%5D/route.ts), [vinter-app/app/api/projects/\[projectId\]/start/route.ts](vinter-app/app/api/projects/%5BprojectId%5D/start/route.ts), and [vinter-app/app/api/home/route.ts](vinter-app/app/api/home/route.ts).
- Wired the API layer to Prisma SQLite for real reads and writes instead of the previous in-memory domain stub.
- Normalized the project payloads by parsing stringified SQLite fields back into JSON arrays before returning them to the client.
- Enforced authenticated access on the project start and home endpoints.
- Verified type safety with `cd /Users/khant.h/Vinter_V1/vinter-app && npx tsc --noEmit`.

### App Router server-component data fix

- Refactored the server-rendered UI pages to stop calling internal API routes via relative fetches from App Router server components.
- Updated [vinter-app/app/home/page.tsx](vinter-app/app/home/page.tsx), [vinter-app/app/projects/page.tsx](vinter-app/app/projects/page.tsx), [vinter-app/app/projects/\[projectId\]/page.tsx](vinter-app/app/projects/%5BprojectId%5D/page.tsx), and [vinter-app/app/projects/\[projectId\]/overview/page.tsx](vinter-app/app/projects/%5BprojectId%5D/overview/page.tsx) to read data directly from Prisma and the authenticated session.
- Reused the existing normalization helpers in [vinter-app/lib/prisma.ts](vinter-app/lib/prisma.ts) so SQLite JSON strings are parsed back into arrays/objects before they reach the UI components.
- Verified the app still builds successfully using `cd /Users/khant.h/Vinter_V1/vinter-app && npm run build`.

### GitHub integration backend

- Added the GitHub repository API in [vinter-app/app/api/github/repositories/route.ts](vinter-app/app/api/github/repositories/route.ts), which requires a valid NextAuth session, reads the GitHub access token, and returns the user’s repositories in the app’s minimal UI contract.
- Added the repository connection route in [vinter-app/app/api/user-projects/\[id\]/repository/route.ts](vinter-app/app/api/user-projects/%5Bid%5D/repository/route.ts), which persists the selected repository to the `Repository` table and updates the user project status to `REPOSITORY_CONNECTED`.
- Added the submission route in [vinter-app/app/api/user-projects/\[id\]/submissions/route.ts](vinter-app/app/api/user-projects/%5Bid%5D/submissions/route.ts), which fetches the latest commit SHA from GitHub, stores it as a `RepositorySnapshot`, and updates the project status to `SUBMITTED`.
- Updated [vinter-app/lib/auth.ts](vinter-app/lib/auth.ts) so the session includes the GitHub `accessToken` used by these backend routes.
- Verified the routes compile cleanly with the app build command.

### GitHub OAuth sign-in fix

- Removed the custom `pages.signIn` override in [vinter-app/lib/auth.ts](vinter-app/lib/auth.ts) so NextAuth uses its default sign-in flow and no longer masks the underlying GitHub OAuth failure state.
- Updated the landing page GitHub button in [vinter-app/app/page.tsx](vinter-app/app/page.tsx) to be a client component and call `signIn("github", { callbackUrl: "/home" })` directly using `next-auth/react`.
- This addresses the immediate CSRF/client-side invocation issue that was redirecting to `/?error=github` before the OAuth exchange could complete.
- Verified the fix with `cd /Users/khant.h/Vinter_V1/vinter-app && npm run build`.

### Repository connection and project submission UI

- Created [vinter-app/components/ConnectRepository.tsx](vinter-app/components/ConnectRepository.tsx), a client component that fetches the user's GitHub repos from `GET /api/github/repositories`, renders a dropdown, and POSTs the selected repo to `POST /api/user-projects/[userProjectId]/repository`. Calls `router.refresh()` on success to sync server state.
- Created [vinter-app/components/SubmitProjectButton.tsx](vinter-app/components/SubmitProjectButton.tsx), a client component that POSTs to `POST /api/user-projects/[userProjectId]/submissions` and calls `router.refresh()` on success.
- Updated [vinter-app/app/projects/\[projectId\]/overview/page.tsx](vinter-app/app/projects/%5BprojectId%5D/overview/page.tsx) to query the linked `Repository` via Prisma `include`, read `userProject.status`, and render conditionally:
  - `ACTIVE`: renders `<ConnectRepository>`
  - `REPOSITORY_CONNECTED`: shows connected repo name and URL, renders `<SubmitProjectButton>`
  - `SUBMITTED` and post-submit states: locked "Under Review" panel with repo link
- Verified with `cd /Users/khant.h/Vinter_V1/vinter-app && npm run build`.

### AI Mentor loop (Vercel AI SDK + Google Gemini)

- Installed `ai` and `@ai-sdk/google` packages.
- Created [vinter-app/lib/mentor.ts](vinter-app/lib/mentor.ts) with two service functions:
  - `generateMentorReview(userProjectId)`: fetches the project brief and locked repository snapshot from Prisma, prompts `gemini-2.5-flash` to produce an opening technical analysis and a single focused question for the candidate.
  - `generateMentorResponse(sessionId, userMessage)`: loads the full conversation history from `MentorMessage` records, tracks user turn count, enforces a hard stop after 4 user turns by instructing the model to close with a `SESSION_COMPLETE:` summary on the final turn, and returns `{ text, sessionComplete }`.
- Created [vinter-app/app/api/mentor-sessions/route.ts](vinter-app/app/api/mentor-sessions/route.ts) (`POST`): requires auth and `userProjectId`, calls `generateMentorReview`, creates the `MentorSession` and opening `MentorMessage`, and updates `UserProject.status` to `"MENTOR_SESSION"` — all in a single Prisma transaction.
- Replaced the stubbed [vinter-app/app/api/mentor-sessions/\[id\]/messages/route.ts](vinter-app/app/api/mentor-sessions/%5Bid%5D/messages/route.ts) (`POST`) with a live implementation: saves the user message, calls `generateMentorResponse`, saves the AI reply, and atomically marks the session `"COMPLETED"` when `sessionComplete` is true.
- Verified with `cd /Users/khant.h/Vinter_V1/vinter-app && npm run build`.

### Mentor session UI

- Created [vinter-app/components/MentorChat.tsx](vinter-app/components/MentorChat.tsx), a client component that renders the full mentor conversation:
  - Accepts `sessionId`, `initialMessages`, and `isCompleted` props.
  - Appends an optimistic user message before the API responds, then replaces it with the confirmed server echo on success (or rolls back on error).
  - Shows an animated "Mentor is typing…" indicator during the `POST /api/mentor-sessions/[id]/messages` request.
  - On `sessionComplete: true` in the response, hides the input area and renders a locked "Review Complete" state.
  - Supports `Enter` to submit and `Shift+Enter` for a newline; auto-scrolls to the latest message.
- Created [vinter-app/components/StartMentorReviewButton.tsx](vinter-app/components/StartMentorReviewButton.tsx), a client component that POSTs to `POST /api/mentor-sessions` with `userProjectId`, extracts `data.sessionId` from the response envelope, and redirects to `/mentor-sessions/[sessionId]`.
- Rewrote [vinter-app/app/mentor-sessions/\[id\]/page.tsx](vinter-app/app/mentor-sessions/%5Bid%5D/page.tsx) as a server component:
  - Queries `MentorSession` (with `messages`, `userProject.project`, `userProject.repository.snapshots`) directly from Prisma.
  - Two-column layout (`lg:grid-cols-[320px_1fr]`): left sidebar shows project title, role, difficulty badge, repository URL and visibility, and the locked commit SHA; right panel renders `<MentorChat>` with server-fetched initial messages.
- Updated [vinter-app/app/projects/\[projectId\]/overview/page.tsx](vinter-app/app/projects/%5BprojectId%5D/overview/page.tsx) with two new status branches:
  - `SUBMITTED`: shows the locked repo panel and renders `<StartMentorReviewButton>`.
  - `MENTOR_SESSION`: resolves the active `MentorSession` from Prisma and renders a "Continue Mentor Session" link; falls back to `<StartMentorReviewButton>` if no active session is found.
- Verified with `cd /Users/khant.h/Vinter_V1/vinter-app && npm run build`.