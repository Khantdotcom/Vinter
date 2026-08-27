# Change Log

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
- Updated [vinter-app/app/projects/[projectId]/overview/page.tsx](vinter-app/app/projects/%5BprojectId%5D/overview/page.tsx) to query the linked `Repository` via Prisma `include`, read `userProject.status`, and render conditionally:
  - `ACTIVE`: renders `<ConnectRepository>`
  - `REPOSITORY_CONNECTED`: shows connected repo name and URL, renders `<SubmitProjectButton>`
  - `SUBMITTED` and post-submit states: locked "Under Review" panel with repo link
- Verified with `cd /Users/khant.h/Vinter_V1/vinter-app && npm run build`.