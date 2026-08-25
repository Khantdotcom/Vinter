# Vinter MVP 1.0 — Foundation Level

**Product Goal:** A deliberately narrow MVP to prove one core concept: Can Vinter turn "I built this project" into credible evidence that the learner actually understands it?

**Motto:** *"You built it. Now explain it."*

---

### 🔄 The Foundation Learning Loop

`Project Brief` → `Build` → `Submit GitHub Repo` → `Mentor AI Review` → `Mentor Discussion` → `Assessment` → `Foundation Proof`

---

### 📦 Core Features

- **1. Project Brief:** Predefined projects (not dynamically generated). Includes Role, Context, Requirements, Constraints, and Target Competencies.
- **2. Simple Workspace:** UI tracks requirements, repo link, and progress. Actual development happens externally using the learner's preferred tools (VS Code, Cursor, Copilot, etc.).
- **3. GitHub API Integration:** Learner submits a repo. Vinter fetches metadata, default branch, commits, PRs, and raw source code.
- **4. Repository Snapshot:** Creates an immutable snapshot of the repo and history at the time of submission to ensure the Mentor evaluates the exact state submitted.
- **5. Mentor Agent:** A single AI acting as a Senior Engineer. It does not just grade; it evaluates understanding through contextual dialogue.
- **6. The Foundation Proof:** The final output. Not a numerical score (e.g., 82%), but a detailed artifact showing *Passed / Needs Improvement* with specific evidence of the learner's understanding and engineering judgment.

---

### 🧠 Mentor Agent Lifecycle

The central intelligence of the Foundation Level. It operates in three phases:

1. **Review:** Analyzes requirements, architecture, code quality, testing, error handling, and trade-offs.
2. **Discuss:** Conducts a dynamic, repository-grounded technical discussion. Generates questions from code, architecture, and hypothetical failure/change scenarios.
3. **Assess:** Evaluates understanding (not memorization) against a strict competency model.

**Competency Model:**

| Competency | What it measures |
| --- | --- |
| **Implementation** | Did they build the required functionality? |
| **Code Understanding** | Can they explain their own code? |
| **Design** | Can they explain their architectural choices? |
| **Testing & Debugging** | Can they reason about correctness and failure? |
| **Engineering Judgment** | Can they explain trade-offs and decisions? |
| **Communication** | Can they clearly explain technical concepts? |

---

### 🏗️ Architecture & Infrastructure

**Key Principle:** The Mentor should never directly depend on the GitHub API. GitHub is a data source; Vinter owns the engineering evidence model.

- **Authentication:** GitHub OAuth only.
- **Data Pipeline:** `GitHub API` → `Fetcher` → `Normalizer` → `Vinter DB` → `Mentor Context`
- **Agent Pipeline:** `Repo Analysis` → `Review Context` → `Generate Questions` → `Conversation` → `Assessment` → `Proof`
- **Tech Stack:** Frontend, Backend API, PostgreSQL, LLM Provider, GitHub API.

---

### User flow

1. Start a project with their repo
2. Submit PR to get reviewed. Mentor agent reviews commits, PR after each milestone and review the whole repo after learners finished)
3. Have coaching sessions with mentor agent (Defend your code/ architecture choices)
4. Mentor agent analyze and assess your understanding and suggest next steps or area of improvements
5. Logs the status of each knowledge/skill as proof (Understand the software requirements - Passed, Understand the codebase - Passed, Can submmit PR - Passed)

### 🗄️ Minimal Data Model

Keep the domain structured for future expansion (Evidence Graph).

```text
User
 └── UserProject
      ├── Project
      ├── Repository
      │    ├── RepositorySnapshot
      │    ├── Commit
      │    └── PullRequest
      ├── MentorSession
      │    └── MentorMessage
      ├── Assessment
      │    └── AssessmentEvidence (Links to commits, files, PRs, Q&A)
      └── Proof
```

---

### 🚫 Out of Scope for MVP 1

To keep the MVP strictly focused on the Foundation Level, the following are **excluded**:

- GitHub Webhooks (polling/snapshots are sufficient).
- Continuous repository tracking / event streaming.
- Multi-agent orchestration (No CEO/HR/Storyline agents).
- Open-source marketplace or client projects.
- Payment systems.
- Complex gamification.