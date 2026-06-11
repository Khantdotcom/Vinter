# Executive Product Specification: Build & Defend (Working Title)

---

## ## Executive Overview

The modern EdTech and coding bootcamp landscape is suffering from an **AI-dependency epidemic**. Learners are generating entire full-stack repositories with a single prompt, resulting in portfolios filled with complex applications they cannot explain, modify, or defend. They possess "ghost portfolios"—impressive codebases with zero foundational comprehension.

**Vinter** is a Gen-Z-focused, highly immersive simulated internship platform that leverages a multi-agent AI ecosystem to force active learning through **building** and **explaining** (The Feynman Technique). Instead of sitting through passive video lectures or blindly copying AI-generated code, users are placed into a dynamic corporate simulation where they must build real-world products and verbally/textually defend their technical and architectural decisions to an automated, opinionated C-suite and dev team.

---

## ## Core Philosophy & Brand Identity

- **The Golden Rule:** *Your explanation proves your competency.* If you can't explain it to the CEO or the Mentor Agent, you didn't build it.

- **Vibe:** Gen-Z, sleek, exploratory, Gamified-Corporate (think *Cyberpunk meets Silicon Valley startup culture*).

- **Design Tokens:**

- **Typography:** `Capriola Semi Bold` (Headings/Brand), `Inter Semi Bold` (UI Body).

- **Dark Mode Palette:** `#5CD4DF` (Electric Cyan) + `#000000` (Deep Black).

- **Light Mode Palette:** `#7DE8F2` (Soft Cyan) + `#EFEFEF` (Off-White).

- **Voice & Tone:** Helpful yet disruptive, progressive, deeply human, unapologetically user-centered, and conversational (Gen-Z-esque, avoiding sterile academic jargon).

---

## ## The User Journey

```
[Onboarding: Skill Assessment AI] 
       │
       ▼
[Dynamic Storyline / Career Path Selection] 
       │
       ▼
[Enrolling in the Simulated Internship Program]
       │
       ▼
[Project Assigned: Senior-Crafted Guidelines] 
       │
       ▼
[Development & Continuous Git Commit Scanning] 
       │
       ▼
[The Gauntlet: Meeting AI Agents & Defending Code (Feynman Loop)] 
       │
       ▼
[Human-in-the-Loop SQM Audit] 
       │
       ▼
[Deployment & Verifiable Portfolio Generation]
```

---

## ## System Architecture (MVP Focus: Backend Developer Path)

To avoid over-engineering the MVP, the multi-agent system is divided into two operational layers: **The Code Pipeline** (background processing) and **The Character Layer** (user-facing interactions).

### 1. Core Evaluation & Intelligence Systems

- **Central Intelligence System:** The data backbone. It tracks every single repository commit, pull request, and state change to fuel the entire multi-agent pipeline.
- **Skill Assessment AI:** Runs during onboarding. It administers a targeted, interactive diagnostic test to evaluate baseline competency, adjusting the entry point of the project briefs.

### 2. The Code Pipeline Agents

- **Repo Scanner Agent:** Scans branches, open/closed issues, and PR logs to output a clean, unified JSON layer mapping user velocity and structural hygiene.
- **Code Scanner Agent:** Automatically parses the code to flag critical security flaws, data leaks, hardcoded `.env` variables, and breaking runtime errors before the user can "ship."

### 3. The Character & World Building Layer (The Feynman Loop)

- **Mentor Agent:** A senior dev persona delivering prioritized feedback step-by-step using **Socratic questioning**. It never hands over code snippets; it asks guiding questions to help the junior figure it out.
- **Business Thinker Agent (CEO):** Interjects to challenge the developer on the product concept, user flow, and feature prioritization.
- **Financial Thinker Agent (CFO):** Forces the user to look at API compute optimizations, hosting costs, and resource management.
- **Writer Agent:** Reviews the technical documentation, README markdown quality, and professional PR commentary.

```
                  ┌─────────────────────────────────┐
                  │   Central Intelligence System   │
                  └────────────────┬────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     The Code Pipeline           │       │      The Character Layer        │
├─────────────────────────────────┤       ├─────────────────────────────────┤
│ • Repo Scanner Agent (JSON)     │       │ • Mentor Agent (Socratic)       │
│ • Code Scanner Agent (Security) │       │ • Business Thinker Agent (CEO)  │
│                                 │       │ • Financial Thinker Agent (CFO) │
│                                 │       │ • Writer Agent (Docs)           │
└─────────────────────────────────┘       └─────────────────────────────────┘
```

---

## ## The MVP Build Plan (Backend Developer Track)

### Phase 1: The Human-in-the-Loop Niche

Rather than building an infinite curriculum, we partner with **Senior Developers (Mentors)**. Their time commitment is intentionally minimized:

- They **do not** grade code.
- They **do not** host live sessions.
- They provide structural blueprints, system design constraints, and curriculum guardrails.
- **Our Platform** acts as their infinite force multiplier via AI agents executing their intent.

### Phase 2: System Consolidation (The Dev Reality)

While 9+ agents provide an incredible narrative experience, the MVP will compress them into two highly coherent LLM configurations to save token costs and prevent latency issues:

| Conceptual Agent | MVP Implementation Layer |
| --- | --- |
| **Repo Scanner / Code Scanner** | **Automated Script + Prompt Context:** Feeds structural JSON reports directly into the LLM context. |
| **Mentor / Scheduler / Writer** | **The Feedback Agent:** A single chat interface configured with Socratic protocols and markdown validation rules. |
| **CEO / CFO / Storyline** | **The Character Agent:** Handles progress tracking, asynchronous standalone milestones, and corporate roleplay events. |

### Phase 3: The SQM (Software Quality Management) System

To separate us from purely theoretical AI tools, the final project verification requires passing the **SQM System**.

1. The user's app must be fully deployed.
2. The AI SQM agent attempts to break the application via automated unit/integration tests.
3. **Human Interns** (more advanced peers inside our platform earning real ecosystem credit) perform manual end-to-end user-acceptance testing to review the UX and final deployment layer.

---

## ## Key Pain Points Addressed vs. Product Solutions

### The AI Copilot Trap

> **Pain Point:** Learners copy-paste from ChatGPT/Claude, building monolithic apps they don't comprehend, setting themselves up for immediate failure during live technical interviews.

- **Our Solution: Progress Tracking Meetings.** Users must hop on interactive text/voice check-ins with the *Scheduler* and *CEO Agents*. They are prompted with variants like: *"Explain why you chose this specific SQL index over NoSQL for this data architecture,"* or *"Walk me through the data lifecycle on line 42 of your controller."*

### The Isolation Vector

> **Pain Point:** Self-paced learning is lonely; project roadmaps feel sterile and detached from market realities.

- **Our Solution: Adaptive Storyline & Multi-Agent Workspace.** The user isn't just staring at an issue tracker. They are dropped into an active simulated workplace slack/teams alternative where AI peers talk, argue over feature creeps, change requirements midway through a sprint (simulating real corporate chaos), and celebrate successful deployments.

---