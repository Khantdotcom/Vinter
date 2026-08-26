# Change Log

## 2026-08-26

### Auth integration fix
- Fixed the NextAuth compatibility issue in the app by aligning the exported auth handler with the installed version (`next-auth@^4.24.15`).
- Updated [vinter-app/lib/auth.ts](vinter-app/lib/auth.ts) to provide a v4-compatible `handlers` export while keeping a safe fallback redirect when GitHub credentials are unavailable.
- Kept the route entrypoint at [vinter-app/app/api/auth/[...nextauth]/route.ts](vinter-app/app/api/auth/[...nextauth]/route.ts) consistent with the app’s actual dependency version.

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
- Added App Router project endpoints in [vinter-app/app/api/projects/route.ts](vinter-app/app/api/projects/route.ts), [vinter-app/app/api/projects/[projectId]/route.ts](vinter-app/app/api/projects/[projectId]/route.ts), [vinter-app/app/api/projects/[projectId]/start/route.ts](vinter-app/app/api/projects/[projectId]/start/route.ts), and [vinter-app/app/api/home/route.ts](vinter-app/app/api/home/route.ts).
- Wired the API layer to Prisma SQLite for real reads and writes instead of the previous in-memory domain stub.
- Normalized the project payloads by parsing stringified SQLite fields back into JSON arrays before returning them to the client.
- Enforced authenticated access on the project start and home endpoints.
- Verified type safety with `cd /Users/khant.h/Vinter_V1/vinter-app && npx tsc --noEmit`.
