# Vinter MVP 1.0 — UI/UX Flow Specification

**Purpose:** Define the minimum UI/UX required to support the Foundation Level backend.

The UI should feel like a **simple engineering workspace**, not a gamified learning platform. The primary user journey is:

> **Choose Project → Understand Requirements → Build Externally → Submit Repository → Mentor Reviews → Defend Your Code → Receive Proof**

The AI-generated UI should prioritize functional clarity over visual polish.

---

# 1. Global Navigation

After authentication, use a simple persistent sidebar/navbar:

```text
VINTER

Home
Projects
Mentor
Proof

────────────

Profile
Settings
```

For MVP, do **not** expose future features such as subscriptions, achievements, community, open-source projects, or client work.

### Navigation rules

- **Home** → current project + next action
- **Projects** → projects and project history
- **Mentor** → current/previous Mentor sessions
- **Proof** → completed Foundation assessments
- **Profile** → basic learner information
- **Settings** → account/GitHub connection

---

# 2. Authentication

## Page: Sign In

### Purpose

Allow the learner to enter Vinter.

### UI

```text
Vinter

Build. Explain. Prove.

[ Continue with GitHub ]

──────── OR ────────

Email
[________________]

Password
[________________]

[ Sign In ]

Don't have an account? Sign up
```

For MVP, GitHub OAuth should be the primary path because the entire product depends on GitHub.

### Transition

**Continue with GitHub**

→ GitHub authorization

→ OAuth callback

→ Home

### Error states

- GitHub authorization denied
- OAuth failure
- Session failure
- GitHub connection failure

Display a simple actionable error.

---

# 3. First-Time Onboarding

## Page: Welcome

After first authentication:

```text
Welcome to Vinter

Vinter is a project-based engineering environment.

You will:

1. Choose a project
2. Build it using your own tools
3. Submit your GitHub repository
4. Defend your implementation with an AI Mentor
5. Receive your Foundation Proof

[ Choose a Project ]
```

### Transition

`Choose a Project` → Project Selection

No lengthy onboarding questionnaire for MVP.

---

# 4. Project Selection

## Page: Choose Project

### Purpose

Let the learner select from predefined Foundation projects.

```text
Choose your project

Build a real software system from a defined
set of requirements.

┌─────────────────────┐
│ Authentication API  │
│ Backend             │
│                     │
│ Build an auth API   │
│ with persistence,   │
│ validation, tests   │
│ and deployment.     │
│                     │
│ [ View Project ]    │
└─────────────────────┘

┌─────────────────────┐
│ ...                 │
└─────────────────────┘
```

For MVP, **do not generate projects dynamically**.

### Project Card

Display:

- Project title
- Category
- Technology/domain
- Short description
- Difficulty
- Estimated scope

### Transition

`View Project` → Project Brief

---

# 5. Project Brief

## Page: Project Brief

This is where the learner understands what they are expected to build.

### Layout

```text
Authentication API

Backend Engineering

Business Context
────────────────────────
...

Your Role
────────────────────────
Junior Backend Engineer

Requirements
────────────────────────
□ User registration
□ Authentication
□ Password security
□ Persistence
□ Validation
□ Automated tests
□ API documentation

Constraints
────────────────────────
...

Acceptance Criteria
────────────────────────
...

Target Skills
────────────────────────
Backend
API Design
Database
Testing
Security

[ Start Project ]
```

### Important UX rule

Requirements should be **clear and fixed**.

The learner should not need to guess:

> "What exactly does Vinter expect me to build?"

### Transition

`Start Project`

→ Create `UserProject`

→ Project Overview

---

# 6. Project Overview

## Page: Current Project

This is the primary workspace after a project has started.

### Layout

```text
Authentication API
Backend Engineering

Progress
████████░░ 80%

Requirements
✓ Registration
✓ Authentication
✓ Database
✓ Validation
○ Testing
○ Documentation

Repository
github.com/user/auth-api

[ Sync Repository ]
[ Submit Project ]

────────────────────────

Next Action

Complete automated tests before
submitting your project.

[ Continue Working ]
```

The learner does **not** write code here.

Vinter is tracking the project.

---

# 7. Project Overview — Activity Section

Below the project summary:

```text
Project Activity

● Project started
● Repository connected
● Authentication implemented
● Database added
● Tests added
○ Project submitted
○ Mentor session
○ Foundation Proof
```

This is the beginning of Vinter's development history.

Keep it simple for MVP.

---

# 8. Add / Connect Repository

## Page: Connect GitHub Repository

```text
Connect your project

Vinter needs access to your GitHub repository
to review your implementation.

Repository

[ Select GitHub Repository ▼ ]

Selected:
username / authentication-api

Branch

[ main ▼ ]

[ Connect Repository ]
```

### Backend action

The frontend triggers:

```text
GitHub API
    ↓
Fetch repository
    ↓
Validate repository
    ↓
Store repository
```

### Error states

- Repository not found
- No access
- Empty repository
- Invalid repository
- GitHub API failure

### Transition

Successful connection → Project Overview

---

# 9. Repository Sync

## Page/Modal: Repository Sync

This can be a loading state rather than a separate page.

```text
Syncing repository...

✓ Repository metadata
✓ Branch information
✓ Commit history
✓ Pull requests
● Source files

Preparing your project for Mentor review...
```

Once complete:

→ Project Overview

---

# 10. Submit Project

## Page: Submit Project

This is the transition from **building** to **evaluation**.

```text
Submit Project

Before submitting:

✓ Requirements completed
✓ Repository connected
✓ Tests implemented
✓ README available

Repository
username/authentication-api

Branch
main

Submission snapshot
Current repository state

[ Submit for Review ]
```

Add a confirmation:

> After submission, Vinter will create a snapshot of your repository and use that version for your Mentor assessment.

### Transition

`Submit for Review`

→ Create Repository Snapshot

→ Mentor Review Processing

---

# 11. Mentor Review — Loading

## Page: Preparing Mentor

```text
Your project is being reviewed.

Mentor is analyzing:

✓ Project requirements
✓ Repository structure
✓ Architecture
✓ Source code
✓ Development history
✓ Tests

Preparing your technical discussion...

[ View Project ]
```

This is an important UX distinction:

**Mentor review happens before the conversation.**

---

# 12. Mentor Session

## Page: Mentor

This is the core Vinter experience.

### Layout

```text
MENTOR

Senior Engineering Review

Project:
Authentication API

────────────────────────

Mentor

I reviewed your authentication
implementation.

Let's start with the architecture.

Why did you separate your
authentication logic from the
user controller?

────────────────────────

You

[ Type your answer... ]

[ Send ]
```

The Mentor should reference actual code.

For example:

```text
Mentor

I noticed that `AuthService`
handles token generation.

Why did you choose to put this
responsibility there?
```

---

# 13. Mentor Session Rules

For MVP, keep the interaction deliberately constrained.

### Mentor can:

- Ask technical questions
- Reference repository files
- Reference project requirements
- Ask follow-up questions
- Challenge assumptions
- Present failure scenarios
- Ask about trade-offs
- Ask the learner to explain code

### Mentor should not:

- Rewrite the learner's code
- Give the learner the answer immediately
- Turn the session into generic tutoring
- Ask unrelated interview questions
- Evaluate technologies the project never required

The session is primarily:

> **Explain → Defend → Reason**

---

# 14. Mentor Session Progress

Display a small indicator:

```text
Mentor Session

Question 2 / 4
```

The existing UI concept specifies a maximum of four questions. Keep that for MVP.

At the end:

```text
Mentor discussion complete.

Mentor is preparing your assessment...

[ View Assessment ]
```

---

# 15. Assessment

## Page: Foundation Assessment

This is the result of the Mentor's evaluation.

```text
Foundation Assessment

Authentication API

Overall
FOUNDATION LEVEL — PASSED

────────────────────────

Implementation
✓ Passed

Code Understanding
✓ Passed

Design
✓ Passed

Testing & Debugging
△ Developing

Engineering Judgment
△ Developing

Communication
✓ Passed
```

Avoid turning this into a leaderboard or game score.

The important information is **what was demonstrated and what remains weak**.

---

# 16. Evidence Section

Under each competency:

```text
Code Understanding
✓ Passed

Evidence

You correctly explained:

• Authentication flow
• Password hashing
• Token generation
• Database interaction

Mentor Question

"Why did you choose JWT for
authentication?"

Your Answer

"..."

Mentor Assessment

"..."
```

This is where the product's core value becomes visible.

---

# 17. Foundation Proof

## Page: Proof

The Proof should be shareable.

```text
VINTER FOUNDATION PROOF

Authentication API

────────────────────────

RESULT

FOUNDATION LEVEL
PASSED

────────────────────────

PROJECT

Authentication API

Built with:
Node.js
PostgreSQL
REST API

────────────────────────

DEMONSTRATED

✓ Implementation
✓ Code Understanding
✓ Design
✓ Communication

Developing:
△ Testing & Debugging
△ Engineering Judgment

────────────────────────

VERIFIED THROUGH

Repository Review
+
AI Mentor Technical Discussion
+
Assessment Evidence
```

Add:

```text
[ Share Proof ]
```

For MVP, a shareable web page is enough.

PDF generation can come later.

---

# 18. Home

## Page: Home

Home should answer one question:

> **What should I do next?**

### Layout

```text
Good morning, Alex.

Current Project

Authentication API
Backend Engineering

Progress
████████░░ 80%

Next Action

Complete your project and submit
your repository for Mentor review.

[ Continue Project ]

────────────────────────

Recent Activity

✓ Repository connected
✓ Authentication implemented
✓ Database implemented
✓ Tests added
```

No need for complicated analytics.

---

# 19. Projects

## Page: Projects

```text
My Projects

Active

┌──────────────────────┐
│ Authentication API   │
│ Backend              │
│ 80% complete         │
│ [ Open Project ]     │
└──────────────────────┘

Completed

┌──────────────────────┐
│ ...                  │
└──────────────────────┘
```

The purpose is simply to manage current and completed Foundation projects.

---

# 20. Mentor History

## Page: Mentor

Show previous Mentor sessions.

```text
Mentor

Current Project
Authentication API

[ Continue Mentor Session ]

Previous Sessions

Aug 20
Architecture Review
Completed

Aug 23
Testing Discussion
Completed
```

For MVP, there may only be one final session.

The UI can support multiple sessions without requiring a complex system.

---

# 21. Proof History

## Page: Proof

```text
My Proofs

┌──────────────────────────┐
│ Authentication API       │
│ Foundation — Passed      │
│ Aug 26, 2026             │
│                          │
│ [ View Proof ]           │
└──────────────────────────┘
```

---

# 22. Profile

## Page: Profile

Keep this extremely simple.

```text
Profile

[ Profile Image ]

Alex
GitHub: @alex

Foundation Progress

Projects Started       1
Projects Completed     0
Proofs Earned          0

────────────────────────

Current Project
Authentication API
```

Don't build gamification yet.

---

# 23. Settings

## Page: Settings

```text
Settings

Account
────────────────
GitHub
Connected ✓

[ Reconnect GitHub ]

Session
────────────────
[ Log Out ]

Preferences
────────────────
Theme
○ Light
● Dark
```

Don't add subscription management to MVP 1.

---

# 24. Empty States

Every important page needs a useful empty state.

### No Project

```text
No active project.

Start your first Foundation project
and build something you can defend.

[ Choose a Project ]
```

### No Repository

```text
No repository connected.

Connect your GitHub repository
to begin your engineering review.

[ Connect Repository ]
```

### No Proof

```text
No Foundation Proof yet.

Complete a project and defend
your implementation with Mentor.

[ View Current Project ]
```

### No Mentor Session

```text
Your Mentor session will appear here
after you submit your project.
```

---

# 25. Overall Transition Map

This should be the **actual MVP navigation model**.

```text
                     ┌─────────────┐
                     │    Sign In  │
                     └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   Welcome   │
                     └──────┬──────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │ Choose Project    │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  Project Brief   │
                  └────────┬─────────┘
                           │ Start
                           ▼
                  ┌──────────────────┐
                  │ Project Overview │◄─────────────┐
                  └─────┬─────┬──────┘              │
                        │     │                     │
             Connect Repo     │                     │
                        │     │                     │
                        ▼     ▼                     │
                  ┌────────┐ Submit                 │
                  │ GitHub │                         │
                  │  Sync  │                         │
                  └───┬────┘                         │
                      │                              │
                      └──────────► Overview ─────────┘
                                      │
                                      │ Submit
                                      ▼
                              ┌────────────────┐
                              │ Mentor Review  │
                              └───────┬────────┘
                                      │
                                      ▼
                              ┌────────────────┐
                              │ Mentor Session │
                              └───────┬────────┘
                                      │
                                      ▼
                              ┌────────────────┐
                              │   Assessment   │
                              └───────┬────────┘
                                      │
                                      ▼
                              ┌────────────────┐
                              │ Foundation     │
                              │ Proof          │
                              └────────────────┘
```

---

# 26. AI UI Generation Prompt

For each screen, use this common instruction:

> **Generate a minimal functional UI for Vinter MVP 1.0 Foundation Level. Do not invent additional product features. Vinter is an engineering learning environment where the user builds a predefined software project, submits a GitHub repository, and has an AI Senior Engineer Mentor review and discuss the implementation. Prioritize clarity, information hierarchy, and functional states over visual complexity. Use a clean developer-tool aesthetic with generous whitespace, subtle borders, compact cards, and clear primary actions. Avoid excessive gamification, gradients, decorative illustrations, achievement badges, leaderboards, or unnecessary dashboards. The interface should make the user's current engineering task and next action obvious.**

Then append the specific page specification.

For example:

> **Generate the Project Overview page**.Show the project title, category, description, requirements checklist, GitHub repository connection, progress, recent activity, and one prominent next action. Include states for repository not connected and repository connected. The primary action should be "Submit for Mentor Review" once requirements are complete.

---

# 27. MVP UI Principle

The entire UI can be reduced to five meaningful states:

```text
1. CHOOSE
   Choose what to build.

2. BUILD
   Build outside Vinter.

3. SUBMIT
   Connect and submit GitHub repository.

4. DEFEND
   Explain your implementation to Mentor.

5. PROVE
   Receive Foundation Proof.
```

Everything in the MVP UI should support one of those five states.

The **Home, Project Overview, Mentor, Assessment, and Proof** pages are the core screens. Profile and Settings are supporting screens. The old concepts like Thinker Agents, weekly reviews, subscriptions, activity carousels, and multiple specialized agents should stay out of the Foundation MVP UI until the core loop proves itself.