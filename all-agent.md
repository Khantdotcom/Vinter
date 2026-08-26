# Vinter MVP — Software Requirements Specification

## 1. MVP Objective

Vinter MVP provides a continuous development record for learners working on software projects through GitHub.

The system connects to a learner's GitHub repositories and continuously collects development activity such as:

* Commits
* Pull requests
* Branch activity
* Code changes
* Repository metadata
* Webhook events

Vinter transforms these events into a chronological **Build History** that can be analyzed by AI agents.

The MVP should answer:

> **What has this learner been building, how has the project evolved, what engineering activity has taken place, and what should they work on next?**

---

# 2. Core User Flow

```text
Sign in
   ↓
Connect GitHub
   ↓
Select Repository
   ↓
Vinter verifies / creates webhook
   ↓
Developer works normally in GitHub
   ↓
GitHub sends events to Vinter
   ↓
Vinter stores development events
   ↓
RepoScanner interprets changes
   ↓
Build History is updated
   ↓
Mentor reviews progress
   ↓
Feedback is generated
   ↓
Progress / next milestone is updated
```

The developer does not need to work inside Vinter.

**GitHub remains the primary development environment.**

---

# 3. MVP Scope

## In Scope

### Authentication

* User authentication
* GitHub authentication
* OAuth callback handling
* Session management
* GitHub credential/token management

### Repository Integration

* Retrieve accessible repositories
* Display repositories
* Select a repository
* Verify webhook configuration
* Create webhook when required
* Receive GitHub webhook events

### Development Tracking

* Store webhook events
* Store commits
* Store pull requests
* Store relevant repository metadata
* Track code-change summaries
* Build chronological development history

### AI Analysis

* Analyze repository activity
* Generate development summaries
* Identify meaningful development milestones
* Generate feedback
* Identify potential next learning/building actions

### Dashboard

* Repository overview
* Development timeline
* Commit activity
* Pull request activity
* Code-change summaries
* Feedback
* Learning/building progress

---

# 4. Out of Scope for MVP

The following should not block the first release:

* Full open-source project marketplace
* Client contracts
* Contributor payments
* Recruitment marketplace
* Multi-user project management
* Real-time collaboration
* Full browser IDE
* Automated production deployment
* Continuous production monitoring
* Advanced gamification
* Certification
* Complex multi-agent orchestration
* Automated hiring decisions
* Advanced competency scoring
* Multiple Git providers

The MVP should first establish the **development evidence infrastructure**.

---

# 5. Functional Requirements

## FR-01 — User Authentication

The system SHALL allow a user to authenticate using GitHub OAuth.

### Requirements

* User can initiate GitHub login.
* System redirects the user to GitHub authorization.
* GitHub redirects the user back to Vinter's configured callback URL.
* System validates the OAuth response.
* System creates or retrieves the Vinter user.
* System creates an authenticated session.
* User can log out.

### Failure cases

The system SHALL handle:

* OAuth authorization denied.
* Invalid OAuth callback.
* Missing callback parameters.
* Expired/invalid authorization state.
* GitHub authentication failure.
* User closing or abandoning the authorization flow.

---

# 6. FR-02 — Session Management

The system SHALL maintain an authenticated Vinter session.

### Requirements

* Session must survive normal page navigation.
* Session must expire according to configured policy.
* User can explicitly log out.
* Unauthorized requests must be rejected.
* Multiple devices/sessions must be supported.

### Important case

A user may log into Vinter from:

```text
Device A
Device B
```

Both sessions must be independently valid.

Logging out of one session must not unintentionally invalidate all other sessions unless that behavior is explicitly designed.

---

# 7. FR-03 — GitHub Credential Management

The system SHALL securely maintain the authorization required to access the user's repositories.

The preferred MVP approach is to use GitHub OAuth rather than requiring users to manually paste personal access tokens.

If personal API tokens are supported as an alternative authentication mechanism, the system SHALL:

* Clearly explain the required permissions.
* Never expose the token after submission.
* Encrypt sensitive credentials at rest.
* Never store credentials in logs.
* Allow users to revoke/remove the credential.

### Principle

Vinter should request the **minimum GitHub permissions required** for the MVP.

Do not default to broad `admin:repo` access unless the webhook-management implementation genuinely requires it.

---

# 8. FR-04 — Repository Discovery

After GitHub authentication, the system SHALL retrieve repositories accessible to the user.

The dashboard SHALL display:

* Repository name
* Repository owner
* Repository URL
* Visibility
* Default branch
* Last activity
* Webhook status

The user SHALL be able to select a repository to connect to Vinter.

---

# 9. FR-05 — Repository Connection

When a user selects a repository, Vinter SHALL verify whether the required webhook exists.

### If webhook exists

Vinter SHALL:

* Verify the webhook configuration.
* Associate it with the Vinter repository record.
* Begin processing supported events.

### If webhook does not exist

Vinter SHALL:

* Create the required webhook if the user has sufficient permissions.
* Store the webhook identifier.
* Store the repository association.
* Display the connection status.

### If Vinter cannot create the webhook

The system SHALL provide a clear failure state explaining that manual configuration is required.

---

# 10. FR-06 — GitHub Webhook Receiver

Vinter SHALL expose a secure webhook endpoint capable of receiving supported GitHub events.

MVP-supported events:

* `push`
* `pull_request`
* `repository`

Additional events can be added later.

The webhook receiver SHALL:

* Verify webhook authenticity/signature.
* Identify the repository.
* Identify the event type.
* Validate the payload.
* Persist the event.
* Return an appropriate HTTP response.

The webhook endpoint SHALL be idempotent.

If GitHub sends the same event more than once, Vinter SHALL NOT create duplicate development records.

---

# 11. FR-07 — Development Event Storage

The system SHALL maintain a persistent record of development events.

Minimum event information:

```text
Event
├── event_id
├── repository_id
├── event_type
├── actor
├── timestamp
├── source
├── raw/reference metadata
└── processing_status
```

For commits:

```text
Commit
├── commit_id
├── repository_id
├── author
├── timestamp
├── message
├── branch
├── files_changed
├── additions
├── deletions
└── commit_url
```

For pull requests:

```text
Pull Request
├── id
├── repository_id
├── author
├── title
├── description
├── state
├── created_at
├── updated_at
├── merged_at
├── source_branch
├── target_branch
└── URL
```

The raw GitHub event should not be the only source of truth.

Vinter should maintain normalized records that can be queried efficiently.

---

# 12. FR-08 — Development Timeline

Vinter SHALL generate a chronological representation of project development.

The timeline SHALL allow a user to understand:

> **How did this project evolve?**

Example:

```text
Aug 20
│
├── Initial project structure
│
Aug 21
│
├── Added authentication
├── Added database layer
│
Aug 23
│
├── Fixed authentication bug
├── Added integration tests
│
Aug 25
│
├── PR #12 opened
├── Review feedback received
│
Aug 26
│
└── PR #12 merged
```

The timeline is the central representation of the MVP.

---

# 13. FR-09 — RepoScanner

The RepoScanner SHALL analyze repository development activity.

Its responsibilities include:

* Summarizing meaningful commits.
* Grouping related development activity.
* Interpreting project milestones.
* Summarizing pull requests.
* Identifying significant code changes.
* Producing a human-readable project timeline.

The RepoScanner should distinguish between:

**activity**

and

**meaningful progress**.

For example:

> 17 commits

is less useful than:

> "Implemented authentication flow and introduced JWT-based session handling."

The scanner SHALL preserve links back to the underlying GitHub activity so that generated interpretations remain traceable to actual evidence.

---

# 14. FR-10 — Scheduled Analysis

Vinter SHALL periodically analyze repository activity.

A low-cost scheduled execution mechanism may be used for MVP.

Example:

```text
Scheduler
   ↓
Find repositories with new activity
   ↓
Run RepoScanner
   ↓
Update development timeline
   ↓
Run Mentor analysis
   ↓
Store feedback
```

The scheduler SHALL avoid unnecessary processing when no new repository activity exists.

Webhook-driven processing should be preferred where possible.

Scheduled jobs should primarily act as:

* periodic analysis
* reconciliation
* recovery
* missed-event detection

rather than repeatedly scanning everything.

---

# 15. FR-11 — Mentor Agent

The Mentor Agent acts as the learner's engineering supervisor.

It SHALL use development history to provide contextual feedback.

The Mentor Agent should be able to identify:

* Recent progress
* Long periods of inactivity
* Repeated patterns
* Potential technical weaknesses
* Missing engineering practices
* Areas requiring deeper investigation
* Possible next steps

Feedback must reference observable development activity.

Example:

> "You added the authentication layer this week, but there is currently no evidence of integration testing around the authentication flow."

The agent should avoid generic motivational feedback that is unrelated to the user's actual work.

---

# 16. FR-12 — Feedback Storage

Feedback SHALL be persisted.

Minimum structure:

```text
Feedback
├── id
├── user_id
├── repository_id
├── category
├── content
├── evidence
├── created_at
└── status
```

Feedback should be linked to the underlying development activity whenever possible.

This allows the user to trace:

```text
Feedback
   ↓
Relevant development activity
   ↓
Commit / PR
   ↓
Actual code change
```

---

# 17. FR-13 — Project Requirements

Vinter SHALL support a project-level set of software requirements.

Example:

```text
Project
├── Requirements
│   ├── Authentication
│   ├── Database persistence
│   ├── API validation
│   ├── Automated tests
│   └── Deployment
│
├── Development History
├── Feedback
└── Progress
```

Requirements provide the context required for later QA evaluation.

For MVP, requirements can be manually defined rather than generated dynamically.

---

# 18. FR-14 — QA Tester

The QA Tester SHALL evaluate a submitted project against its defined software requirements.

For MVP, testing is **one-time project evaluation**.

The QA system should evaluate:

* Requirement coverage
* Functional correctness
* Test coverage where measurable
* Potential defects
* Basic code quality
* Basic security concerns
* Deployment status where available

The output SHALL identify:

```text
Requirement
    ↓
Expected behavior
    ↓
Observed implementation
    ↓
Pass / Fail / Needs Review
    ↓
Evidence
```

The QA Agent must distinguish between:

**verified**

and

**inferred**.

It should not claim that a requirement works merely because the code appears to implement it.

---

# 19. FR-15 — Progress / Build Plan Agent

The Progress Agent SHALL use project activity and feedback to maintain the learner's development progress.

It SHALL be able to:

* Record completed milestones.
* Identify incomplete milestones.
* Recommend the next milestone.
* Update learning/building progress.
* Reference previous work when recommending future work.

For MVP, the progress model should remain simple.

Example:

```text
Backend Project
│
├── Requirements      ✓
├── API               ✓
├── Database          ✓
├── Testing           ◐
├── Deployment        ✗
└── Documentation     ✗
```

The system should prioritize actionable next steps over gamification.

---

# 20. FR-16 — Dashboard

The dashboard SHALL provide a consolidated view of the user's development history.

Minimum sections:

### Repository

* Connected repositories
* Repository status
* Last activity

### Development Timeline

* Commits
* Pull requests
* Milestones
* Significant changes

### Progress

* Project requirements
* Completed milestones
* Current work

### Feedback

* Mentor feedback
* QA results
* Historical feedback

### Activity Graph

Visual representation of development activity over time.

The graph should allow users to understand:

> **When did I build, what did I build, and how did the project evolve?**

---

# 21. FR-17 — Repository Table

The system SHALL provide a table containing connected/available repositories.

Minimum fields:

| Field      | Description               |
| ---------- | ------------------------- |
| Repository | Repository name           |
| Owner      | GitHub owner              |
| Visibility | Public/private            |
| Activity   | Last activity             |
| Webhook    | Connected/not connected   |
| Status     | Active/error/disconnected |

The user SHALL be able to select a repository from the table.

---

# 22. FR-18 — Repository Activity Graph

The system SHALL provide a visual representation of development activity.

Possible dimensions:

* Commits over time
* Pull requests
* Lines changed
* Milestones
* Feedback events
* Project phases

The graph is primarily an **exploration tool**, not a performance score.

The objective is to visualize development history.

---

# 23. FR-19 — Event Processing

The system SHALL process incoming GitHub events asynchronously where appropriate.

Webhook ingestion should not depend on the completion of AI analysis.

Preferred architecture:

```text
GitHub
   ↓
Webhook API
   ↓
Persist Event
   ↓
Queue / Job
   ↓
Process Event
   ↓
Update Database
   ↓
AI Analysis
   ↓
Feedback
```

This prevents slow AI operations from blocking GitHub webhook requests.

---

# 24. FR-20 — Reliability

The system SHALL tolerate:

* Duplicate webhook delivery
* Temporary GitHub API failures
* AI processing failures
* Scheduler failures
* Network failures
* Partial event processing

Failed jobs should be retryable.

Processing status should be observable.

Example:

```text
RECEIVED
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

---

# 25. Non-Functional Requirements

## Security

* OAuth state must be protected against CSRF.
* Webhook signatures must be verified.
* GitHub credentials must not be logged.
* Sensitive credentials must be encrypted at rest.
* Authorization must be checked for every repository operation.
* Users must only access their own Vinter data.
* API secrets must never be returned to the frontend after initial storage.

## Performance

The webhook endpoint should acknowledge valid GitHub events quickly.

AI analysis should happen asynchronously.

Dashboard queries should not require re-fetching the GitHub API on every page load.

## Cost

MVP infrastructure should prioritize low fixed costs.

Use:

* Managed database
* Low-cost scheduler
* Serverless/background jobs where appropriate
* Event-driven processing
* Cached GitHub data

Avoid continuously running infrastructure unless required.

## Observability

The system SHALL record:

* Webhook processing status
* Job execution status
* GitHub API failures
* AI processing failures
* Authentication failures
* Repository synchronization failures

---

# 26. Core Data Model

Minimum entities:

```text
User
 │
 ├── GitHubConnection
 │
 └── Repository
       │
       ├── Webhook
       ├── Commit
       ├── PullRequest
       ├── DevelopmentEvent
       ├── Requirement
       ├── Feedback
       ├── Milestone
       └── Analysis
```

Potentially:

```text
Analysis
├── source_event_ids
├── summary
├── category
├── confidence
├── created_at
└── model_version
```

The `source_event_ids` relationship is important.

AI-generated interpretations should always be traceable to underlying engineering activity.

---

# 27. MVP Acceptance Criteria

The MVP is successful when a new user can complete this entire journey:

* [ ] Sign in with GitHub.
* [ ] Successfully return from the OAuth callback.
* [ ] View accessible repositories.
* [ ] Select a repository.
* [ ] Connect the repository to Vinter.
* [ ] Vinter creates a webhook when permitted.
* [ ] GitHub activity reaches Vinter.
* [ ] Webhook events are persisted.
* [ ] Commits and PRs are normalized and displayed.
* [ ] Development activity appears chronologically.
* [ ] RepoScanner generates a project/development summary.
* [ ] Mentor Agent generates feedback based on actual activity.
* [ ] Project requirements can be defined.
* [ ] QA Agent can evaluate the project against those requirements.
* [ ] Progress Agent can update milestones.
* [ ] User can see the development history, feedback, and progress from one dashboard.
* [ ] AI-generated feedback can be traced back to underlying repository activity.
* [ ] Duplicate webhook events do not create duplicate records.
* [ ] Failed background jobs can be retried.
* [ ] A user cannot access another user's repository data.

---

# 28. MVP Success Metric

The primary MVP question is not:

> "Did we build an AI agent?"

It is:

> **Can Vinter produce a useful, trustworthy representation of how a developer actually built a software project over time?**

A successful MVP should allow a learner to look at their project and answer:

1. **What did I build?**
2. **When did I build it?**
3. **How did the project evolve?**
4. **What decisions did I make?**
5. **What did I do well?**
6. **Where did I struggle?**
7. **What should I improve next?**

If those questions can be answered from real GitHub activity, Vinter has established the foundation for the next layer:

**Build → Open-source contribution → Competency verification → Paid client work.**
