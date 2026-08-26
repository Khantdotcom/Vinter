# Vinter MVP 1.0 — Backend ↔ UI/UX Specification

The backend should be designed around the **actual user journey**, not around the internal AI components.

The UI needs a stable API/domain contract:

```text
UI
 ↓
Vinter API
 ↓
Domain
 ├── Projects
 ├── User Projects
 ├── GitHub
 ├── Mentor
 ├── Assessment
 └── Proof
 ↓
PostgreSQL
```

The critical rule is:

> **The UI should never need to understand GitHub API responses, LLM responses, or internal agent state.**

The backend converts those into Vinter domain objects.

---

# 1. Backend MVP Boundary

```text
┌─────────────────────────────────────────────────────┐
│                    VINTER WEB APP                   │
└──────────────────────────┬──────────────────────────┘
                           │
                    REST / JSON API
                           │
┌──────────────────────────▼──────────────────────────┐
│                    VINTER BACKEND                   │
│                                                     │
│  Auth       Projects       GitHub       Mentor       │
│    │           │             │            │         │
│    │           │             │            │         │
│    └───────────┴─────────────┴────────────┘         │
│                         │                           │
│                    Assessment                      │
│                         │                           │
│                       Proof                         │
└──────────────────────────┬──────────────────────────┘
                           │
                    PostgreSQL
```

For MVP:

- REST API is sufficient.
- PostgreSQL is sufficient.
- One backend application is sufficient.
- One Mentor Agent is sufficient.
- GitHub API is the external repository source.
- Background jobs can be used for repository analysis.

Do **not** split this into microservices.

---

# 2. Domain Model

The backend should have these core domains:

```text
User
 │
 └── UserProject
       │
       ├── Project
       │
       ├── Repository
       │     ├── RepositorySnapshot
       │     ├── Commit
       │     └── PullRequest
       │
       ├── MentorSession
       │     └── MentorMessage
       │
       ├── Assessment
       │     └── AssessmentEvidence
       │
       └── Proof
```

This directly maps to the UI.

---

# 3. Global API Conventions

Use consistent JSON responses.

Example:

```json
{
  "data": {},
  "error": null
}
```

Error:

```json
{
  "data": null,
  "error": {
    "code": "REPOSITORY_ACCESS_DENIED",
    "message": "Vinter cannot access this repository."
  }
}
```

Use HTTP status codes appropriately.

### Common statuses

- `200` — successful read/update
- `201` — created
- `202` — accepted for asynchronous processing
- `400` — invalid request
- `401` — unauthenticated
- `403` — unauthorized
- `404` — resource not found
- `409` — invalid state/conflict
- `422` — validation failure
- `500` — unexpected server error

---

# 4. Authentication API

## `GET /api/auth/github`

Starts GitHub OAuth.

### UI

**Sign In**

```text
[ Continue with GitHub ]
```

### Backend

Redirect user to GitHub authorization.

---

## `GET /api/auth/github/callback`

GitHub redirects here.

Backend:

```text
GitHub
 ↓
callback
 ↓
validate OAuth state
 ↓
exchange authorization code
 ↓
retrieve GitHub user
 ↓
create/update Vinter user
 ↓
create session
 ↓
redirect → /home
```

### Failure

Redirect:

```text
/auth/error?reason=github_authorization_failed
```

The UI displays the appropriate error.

---

# 5. Current User

## `GET /api/me`

Used by the application after startup.

Response:

```json
{
  "data": {
    "id": "user_123",
    "username": "alex",
    "github": {
      "username": "alex",
      "connected": true
    }
  }
}
```

### UI usage

Used for:

- Profile
- Navbar
- Authentication state
- Settings

---

# 6. Project API

Projects are **predefined MVP content**.

## `GET /api/projects`

Used by:

**Choose Project**

Response:

```json
{
  "data": [
    {
      "id": "project_auth_api",
      "title": "Authentication API",
      "category": "Backend",
      "difficulty": "Foundation",
      "description": "Build an authentication API...",
      "estimated_scope": "1–2 weeks"
    }
  ]
}
```

---

## `GET /api/projects/:projectId`

Used by:

**Project Brief**

Returns:

```json
{
  "data": {
    "id": "project_auth_api",
    "title": "Authentication API",
    "description": "...",
    "business_context": "...",
    "role": "Junior Backend Engineer",
    "requirements": [],
    "constraints": [],
    "acceptance_criteria": [],
    "competencies": []
  }
}
```

---

# 7. Start Project

## `POST /api/projects/:projectId/start`

Called when the user presses:

**Start Project**

Backend creates:

```text
UserProject
status = ACTIVE
```

Response:

```json
{
  "data": {
    "user_project_id": "up_123",
    "project_id": "project_auth_api",
    "status": "ACTIVE"
  }
}
```

### Transition

```text
Project Brief
      ↓
POST /start
      ↓
Project Overview
```

---

# 8. User Project API

## `GET /api/user-projects`

Used by:

**Projects**

Returns active and completed projects.

```json
{
  "data": {
    "active": [],
    "completed": []
  }
}
```

---

## `GET /api/user-projects/:id`

Used by:

**Project Overview**

This should be the primary endpoint for the project page.

It should return the UI-ready project state:

```json
{
  "data": {
    "id": "up_123",
    "status": "ACTIVE",

    "project": {
      "title": "Authentication API",
      "category": "Backend"
    },

    "progress": {
      "percentage": 80
    },

    "requirements": [
      {
        "id": "req_1",
        "title": "User registration",
        "status": "COMPLETED"
      },
      {
        "id": "req_2",
        "title": "Automated tests",
        "status": "IN_PROGRESS"
      }
    ],

    "repository": null,

    "next_action": {
      "type": "CONNECT_REPOSITORY",
      "label": "Connect Repository"
    }
  }
}
```

This is important:

> **The backend should determine the user's next action.**

The frontend should not contain complicated business logic such as:

```text
if repo exists
and requirements complete
and mentor exists
...
```

The API returns the current state.

---

# 9. Project State Machine

Keep project states explicit.

```text
NOT_STARTED
     ↓
ACTIVE
     ↓
REPOSITORY_CONNECTED
     ↓
READY_FOR_SUBMISSION
     ↓
SUBMITTED
     ↓
MENTOR_REVIEWING
     ↓
MENTOR_SESSION
     ↓
ASSESSING
     ↓
PROOF_READY
     ↓
COMPLETED
```

Possible failure state:

```text
PROCESSING
     ↓
FAILED
     ↓
RETRY
```

This state machine should drive the UI.

---

# 10. GitHub Repository API

## `GET /api/github/repositories`

Used by:

**Connect Repository**

Backend calls GitHub API and transforms the response.

UI receives only:

```json
{
  "data": [
    {
      "id": "github_123",
      "name": "authentication-api",
      "owner": "alex",
      "url": "https://github.com/alex/authentication-api",
      "visibility": "PRIVATE",
      "default_branch": "main",
      "updated_at": "2026-08-26T10:00:00Z"
    }
  ]
}
```

The frontend doesn't care how GitHub's API represents repositories.

---

# 11. Connect Repository

## `POST /api/user-projects/:id/repository`

Request:

```json
{
  "github_repository_id": "github_123"
}
```

Backend:

```text
Validate ownership/access
        ↓
Fetch repository metadata
        ↓
Create Repository
        ↓
Return repository
```

Response:

```json
{
  "data": {
    "id": "repo_123",
    "name": "authentication-api",
    "owner": "alex",
    "default_branch": "main",
    "status": "CONNECTED"
  }
}
```

### UI transition

```text
Connect Repository
        ↓
Repository Sync
        ↓
Project Overview
```

---

# 12. Repository Sync

## `POST /api/repositories/:id/sync`

The frontend should trigger this when the user requests a sync or when submission begins.

Response:

```json
{
  "data": {
    "job_id": "job_123",
    "status": "QUEUED"
  }
}
```

Use asynchronous processing.

Do **not** make the browser wait for:

```text
GitHub → hundreds of files → AI analysis
```

---

# 13. Sync Status

## `GET /api/jobs/:jobId`

UI polls this endpoint during the MVP.

```json
{
  "data": {
    "status": "PROCESSING",
    "steps": [
      {
        "name": "Repository metadata",
        "status": "COMPLETED"
      },
      {
        "name": "Commit history",
        "status": "COMPLETED"
      },
      {
        "name": "Source files",
        "status": "PROCESSING"
      },
      {
        "name": "Mentor context",
        "status": "PENDING"
      }
    ]
  }
}
```

Later, WebSockets/SSE can replace polling if necessary.

Not needed for MVP.

---

# 14. Repository Snapshot

## `POST /api/user-projects/:id/submissions`

This is the main **Submit Project** endpoint.

Backend:

```text
Validate project
        ↓
Validate repository
        ↓
Fetch current repository state
        ↓
Create RepositorySnapshot
        ↓
Lock submission
        ↓
Queue Mentor Review
```

Response:

```json
{
  "data": {
    "submission_id": "submission_123",
    "status": "PROCESSING"
  }
}
```

### Important

The snapshot must identify the exact repository state being evaluated.

At minimum:

```text
repository_id
commit_sha
branch
fetched_at
```

---

# 15. Mentor Review API

## `GET /api/user-projects/:id/mentor-review`

Returns the current Mentor review status.

```json
{
  "data": {
    "status": "COMPLETED",
    "review": {
      "requirements": "COMPLETED",
      "architecture": "COMPLETED",
      "code": "COMPLETED",
      "testing": "COMPLETED"
    }
  }
}
```

Possible states:

```text
PENDING
ANALYZING
READY
FAILED
```

---

# 16. Mentor Session API

## `POST /api/user-projects/:id/mentor-sessions`

Creates the technical defense session.

Backend loads:

```text
Project requirements
+
Repository snapshot
+
Mentor review context
+
Previous questions
```

Then initializes Mentor.

Response:

```json
{
  "data": {
    "session_id": "session_123",
    "status": "ACTIVE"
  }
}
```

---

# 17. Get Mentor Session

## `GET /api/mentor-sessions/:id`

Used when opening:

**Mentor page**

```json
{
  "data": {
    "id": "session_123",
    "status": "ACTIVE",
    "question_number": 2,
    "max_questions": 4,
    "messages": [
      {
        "role": "MENTOR",
        "content": "Why did you choose..."
      },
      {
        "role": "USER",
        "content": "I chose..."
      }
    ]
  }
}
```

---

# 18. Send Mentor Answer

## `POST /api/mentor-sessions/:id/messages`

Request:

```json
{
  "content": "I chose this architecture because..."
}
```

Backend:

```text
Save user message
       ↓
Load Mentor context
       ↓
Run Mentor
       ↓
Generate next response
       ↓
Save Mentor message
       ↓
Return response
```

Response:

```json
{
  "data": {
    "message": {
      "role": "MENTOR",
      "content": "What would happen if..."
    },
    "question_number": 3,
    "status": "ACTIVE"
  }
}
```

The UI simply renders the response.

---

# 19. End Mentor Session

## `POST /api/mentor-sessions/:id/complete`

When the Mentor reaches the required number of questions or determines that the session is complete:

```text
ACTIVE
  ↓
COMPLETED
  ↓
Assessment Job
```

Response:

```json
{
  "data": {
    "session_id": "session_123",
    "status": "ASSESSING"
  }
}
```

---

# 20. Assessment API

## `GET /api/user-projects/:id/assessment`

Used by:

**Assessment page**

Response:

```json
{
  "data": {
    "status": "COMPLETED",
    "result": "PASSED",
    "competencies": [
      {
        "name": "Implementation",
        "result": "PASSED",
        "summary": "..."
      },
      {
        "name": "Code Understanding",
        "result": "PASSED",
        "summary": "..."
      },
      {
        "name": "Engineering Judgment",
        "result": "DEVELOPING",
        "summary": "..."
      }
    ]
  }
}
```

---

# 21. Assessment Evidence API

The assessment should expose evidence.

## `GET /api/assessments/:id/evidence`

Response:

```json
{
  "data": [
    {
      "competency": "Code Understanding",
      "source": {
        "type": "MENTOR_ANSWER",
        "reference_id": "message_123"
      },
      "question": "Why did you choose JWT?",
      "answer": "...",
      "assessment": "..."
    },
    {
      "competency": "Design",
      "source": {
        "type": "REPOSITORY_FILE",
        "reference": "src/auth/AuthService.ts"
      },
      "assessment": "..."
    }
  ]
}
```

This is the backend foundation for your future evidence graph.

---

# 22. Proof API

## `GET /api/user-projects/:id/proof`

Used by:

**Proof page**

Response:

```json
{
  "data": {
    "id": "proof_123",
    "project": {
      "title": "Authentication API"
    },
    "result": "PASSED",
    "competencies": [],
    "verified_through": [
      "Repository Review",
      "Mentor Technical Discussion",
      "Assessment Evidence"
    ],
    "generated_at": "2026-08-26T15:00:00Z"
  }
}
```

---

# 23. Shareable Proof

## `GET /proof/:publicId`

This should **not require authentication** if the user chooses to share the proof.

Example:

```text
vinter.dev/proof/abc123
```

The public page should expose only the information the learner has chosen to make public.

Do not expose:

- private repository contents
- GitHub access tokens
- private mentor context
- internal AI prompts
- sensitive personal information

---

# 24. Home API

The Home screen should not make five API calls just to determine what the user should do.

Create an aggregation endpoint.

## `GET /api/home`

Response:

```json
{
  "data": {
    "current_project": {
      "id": "up_123",
      "title": "Authentication API",
      "category": "Backend",
      "progress": 80
    },

    "next_action": {
      "type": "SUBMIT_PROJECT",
      "label": "Submit for Mentor Review"
    },

    "recent_activity": [],

    "proof_count": 0
  }
}
```

This endpoint is specifically for the UI.

---

# 25. Projects Page API

## `GET /api/projects/mine`

```json
{
  "data": {
    "active": [
      {
        "id": "up_123",
        "title": "Authentication API",
        "progress": 80,
        "status": "ACTIVE"
      }
    ],
    "completed": []
  }
}
```

---

# 26. Profile API

## `GET /api/profile`

```json
{
  "data": {
    "username": "alex",
    "github_username": "alex",
    "stats": {
      "projects_started": 1,
      "projects_completed": 0,
      "proofs_earned": 0
    }
  }
}
```

Keep stats derived from actual domain data.

Do not create a separate mutable "stats" table for MVP unless you have a performance reason.

---

# 27. Backend State → UI State

This is one of the most important contracts.

The UI should derive its state from backend project status.

| Backend state | UI |
| --- | --- |
| `NOT_STARTED` | Choose project |
| `ACTIVE` | Build project |
| `REPOSITORY_CONNECTED` | Show repository |
| `READY_FOR_SUBMISSION` | Submit button |
| `SUBMITTED` | Processing |
| `MENTOR_REVIEWING` | Mentor preparation |
| `MENTOR_SESSION` | Mentor chat |
| `ASSESSING` | Assessment processing |
| `PROOF_READY` | View proof |
| `COMPLETED` | Completed project |

This prevents the frontend and backend from developing contradictory states.

---

# 28. Mentor Agent Backend

The Mentor should be isolated behind a domain interface.

Conceptually:

```text
MentorService
    │
    ├── buildContext()
    ├── reviewSubmission()
    ├── generateQuestion()
    ├── respondToAnswer()
    ├── assessSession()
    └── generateProof()
```

The actual implementation can call an LLM provider.

The rest of Vinter should not care whether the underlying model is:

- OpenAI
- Anthropic
- Gemini
- local model

That is an infrastructure/provider concern.

---

# 29. Mentor Context

Mentor should receive a structured context, not arbitrary database dumps.

```text
MentorContext
├── Project
│   ├── Requirements
│   ├── Constraints
│   └── Acceptance Criteria
│
├── Repository
│   ├── Structure
│   ├── Files
│   ├── Dependencies
│   └── README
│
├── Development History
│   ├── Commits
│   └── Pull Requests
│
└── Review Context
    ├── Findings
    ├── Risk Areas
    └── Questions
```

This gives you a clean boundary between:

**data collection**

and

**AI reasoning**.

---

# 30. Background Jobs

Some backend operations should not happen inside normal HTTP requests.

Use background jobs for:

```text
Repository synchronization
        ↓
Repository normalization
        ↓
Mentor review
        ↓
Assessment
        ↓
Proof generation
```

For MVP, a single job system is enough.

Example:

```text
Job
├── id
├── type
├── status
├── attempts
├── error
├── created_at
├── started_at
└── completed_at
```

---

# 31. Job State Machine

```text
QUEUED
  ↓
PROCESSING
  ↓
COMPLETED

or

PROCESSING
  ↓
FAILED
  ↓
RETRY
```

The UI can query job status.

Later, this can evolve into an event-driven architecture without changing the UI contract.

---

# 32. Database Relationship

The backend should preserve this relationship:

```text
User
 │
 └── UserProject
       │
       ├── Project
       │
       ├── Repository
       │      │
       │      ├── Commits
       │      ├── PullRequests
       │      └── Snapshots
       │
       ├── MentorSessions
       │      └── Messages
       │
       ├── Assessment
       │      └── Evidence
       │
       └── Proof
```

This structure is deliberately future-compatible with Level 2.

Later you can add:

```text
Repository
   ↓
Webhook
   ↓
DevelopmentEvent
   ↓
OngoingMentorReview
```

without destroying the Foundation model.

---

# 33. What the UI Should NOT Know

Keep these completely backend-side:

- GitHub OAuth tokens
- GitHub API pagination
- GitHub API response structure
- Repository normalization
- LLM prompts
- Mentor system instructions
- Model selection
- Assessment calculation
- Evidence extraction
- Job orchestration
- Snapshot creation
- Retry logic

The UI should know:

> **What state is the project in?**

and:

> **What can the user do next?**

---

# 34. Final MVP Contract

The complete backend/UI interaction is:

```text
                         UI
                          │
                          ▼
                    ┌───────────┐
                    │   HOME    │
                    └─────┬─────┘
                          │
                    Choose Project
                          │
                          ▼
                  ┌───────────────┐
                  │ PROJECT BRIEF │
                  └───────┬───────┘
                          │
                     Start Project
                          │
                          ▼
                  ┌───────────────┐
                  │    PROJECT    │
                  │   OVERVIEW    │
                  └───────┬───────┘
                          │
                    Connect GitHub
                          │
                          ▼
                  ┌───────────────┐
                  │   REPOSITORY  │
                  │     FETCH     │
                  └───────┬───────┘
                          │
                     Build externally
                          │
                          ▼
                    Submit Project
                          │
                          ▼
                  ┌───────────────┐
                  │ MENTOR REVIEW │
                  │   AI AGENT    │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │ MENTOR CHAT   │
                  │ DEFEND CODE   │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  ASSESSMENT   │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │    PROOF      │
                  └───────────────┘
```

## The backend's actual responsibility

The MVP backend can be summarized as six responsibilities:

**1. Identity**Who is this learner?

**2. Project**What are they supposed to build?

**3. Evidence**What did they actually build?

**4. Mentor**Can the AI inspect and discuss that work?

**5. Assessment**What did the learner demonstrate?

**6. Proof**Can Vinter turn that evidence into a persistent, shareable result?

That is the backend contract the UI should be built against.