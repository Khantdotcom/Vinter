export type ProjectRequirement = {
  id: string;
  title: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING";
};

export type Project = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  estimated_scope: string;
  business_context: string;
  role: string;
  requirements: string[];
  constraints: string[];
  acceptance_criteria: string[];
  competencies: string[];
};

export type CurrentUser = {
  id: string;
  username: string;
  github: {
    username: string;
    connected: boolean;
  };
};

export type GithubRepository = {
  id: string;
  name: string;
  owner: string;
  url: string;
  visibility: "PUBLIC" | "PRIVATE";
  default_branch: string;
  updated_at: string;
};

export type UserProjectState = {
  id: string;
  status: string;
  project: { title: string; category: string };
  progress: { percentage: number };
  requirements: ProjectRequirement[];
  repository: GithubRepository | null;
  next_action: { type: string; label: string };
};

export type HomeState = {
  current_project: {
    id: string;
    title: string;
    category: string;
    progress: number;
  } | null;
  next_action: { type: string; label: string };
  recent_activity: { type: string; description: string }[];
  proof_count: number;
};

export type MentorSessionMessage = {
  role: "MENTOR" | "USER";
  content: string;
};

export type MentorSessionView = {
  id: string;
  status: string;
  question_number: number;
  max_questions: number;
  messages: MentorSessionMessage[];
};

const projectCatalog: Project[] = [
  {
    id: "project_auth_api",
    title: "Authentication API",
    category: "Backend",
    difficulty: "Foundation",
    description: "Build an auth service with secure registration, login, password hashing, and protected routes.",
    estimated_scope: "1–2 weeks",
    business_context:
      "An internal product is about to onboard early customers and needs a trustworthy identity layer before launch.",
    role: "Junior Backend Engineer",
    requirements: [
      "User registration",
      "Password hashing",
      "User login flow",
      "Protected route guard",
      "Automated tests",
    ],
    constraints: [
      "Use secure password storage",
      "Keep the API stateless",
      "No third-party auth provider",
    ],
    acceptance_criteria: [
      "Users can register with a username and password",
      "Passwords are never stored in plain text",
      "Authenticated requests carry a valid token",
      "Protected routes reject unauthenticated access",
    ],
    competencies: [
      "Implementation",
      "Code Understanding",
      "Design",
      "Testing & Debugging",
      "Engineering Judgment",
    ],
  },
  {
    id: "project_task_board",
    title: "Task Board",
    category: "Full Stack",
    difficulty: "Foundation",
    description: "Build a compact Kanban board with task creation, updates, filters, and persistence.",
    estimated_scope: "1 week",
    business_context:
      "A small team needs a lightweight work-tracking tool they can operate without heavy platform overhead.",
    role: "Junior Full-Stack Engineer",
    requirements: [
      "Create tasks",
      "Update task status",
      "Filter by status",
      "Persist data",
    ],
    constraints: [
      "UI must stay lightweight and fast",
      "No external SaaS dependency",
    ],
    acceptance_criteria: [
      "Users can create tasks and move them across columns",
      "The UI reflects persisted state",
      "Task status changes are visible without refresh",
    ],
    competencies: [
      "Implementation",
      "Design",
      "Testing & Debugging",
    ],
  },
];

const userProjectState: UserProjectState = {
  id: "up_123",
  status: "ACTIVE",
  project: {
    title: "Authentication API",
    category: "Backend",
  },
  progress: {
    percentage: 80,
  },
  requirements: [
    { id: "req_1", title: "User registration", status: "COMPLETED" },
    { id: "req_2", title: "Automated tests", status: "IN_PROGRESS" },
    { id: "req_3", title: "Protected routes", status: "PENDING" },
  ],
  repository: null,
  next_action: {
    type: "CONNECT_REPOSITORY",
    label: "Connect Repository",
  },
};

const repositories: GithubRepository[] = [
  {
    id: "github_123",
    name: "authentication-api",
    owner: "alex",
    url: "https://github.com/alex/authentication-api",
    visibility: "PRIVATE",
    default_branch: "main",
    updated_at: "2026-08-26T10:00:00Z",
  },
  {
    id: "github_456",
    name: "task-board",
    owner: "alex",
    url: "https://github.com/alex/task-board",
    visibility: "PUBLIC",
    default_branch: "main",
    updated_at: "2026-08-20T12:00:00Z",
  },
];

export function getCurrentUser(): CurrentUser {
  return {
    id: "user_123",
    username: "alex",
    github: {
      username: "alex",
      connected: true,
    },
  };
}

export function listProjects(): Project[] {
  return projectCatalog;
}

export function getProjectById(projectId: string): Project | undefined {
  return projectCatalog.find((project) => project.id === projectId);
}

export function listUserProjects() {
  return {
    active: [
      {
        id: "up_123",
        title: "Authentication API",
        progress: 80,
        status: "ACTIVE",
      },
    ],
    completed: [],
  };
}

export function getUserProjectOverview(id: string): UserProjectState {
  return {
    ...userProjectState,
    id,
    repository: repositories[0],
    next_action: { type: "SUBMIT_PROJECT", label: "Submit for Mentor Review" },
  };
}

export function startProject(projectId: string) {
  const project = getProjectById(projectId);
  return {
    user_project_id: "up_123",
    project_id: project?.id ?? projectId,
    status: "ACTIVE",
  };
}

export function listGithubRepositories(): GithubRepository[] {
  return repositories;
}

export function connectRepository(projectId: string, githubRepositoryId: string) {
  const repo = repositories.find((repository) => repository.id === githubRepositoryId) ?? repositories[0];
  return {
    id: "repo_123",
    name: repo.name,
    owner: repo.owner,
    default_branch: repo.default_branch,
    status: "CONNECTED",
    project_id: projectId,
  };
}

export function getHomeState(): HomeState {
  return {
    current_project: {
      id: "up_123",
      title: "Authentication API",
      category: "Backend",
      progress: 80,
    },
    next_action: {
      type: "SUBMIT_PROJECT",
      label: "Submit for Mentor Review",
    },
    recent_activity: [
      { type: "REPOSITORY_SYNC", description: "Repository metadata synced" },
      { type: "SUBMISSION", description: "Project started" },
    ],
    proof_count: 0,
  };
}

export function getProfile() {
  return {
    username: "alex",
    github_username: "alex",
    stats: {
      projects_started: 1,
      projects_completed: 0,
      proofs_earned: 0,
    },
  };
}

export function createRepositorySyncJob(): { job_id: string; status: "QUEUED" } {
  return {
    job_id: "job_123",
    status: "QUEUED",
  };
}

export function getJobStatus(jobId: string) {
  return {
    status: jobId === "job_123" ? "PROCESSING" : "COMPLETED",
    steps: [
      { name: "Repository metadata", status: "COMPLETED" },
      { name: "Commit history", status: "COMPLETED" },
      { name: "Source files", status: "PROCESSING" },
      { name: "Mentor context", status: "PENDING" },
    ],
  };
}

export function submitProject(userProjectId: string) {
  return {
    submission_id: "submission_123",
    status: "PROCESSING",
    user_project_id: userProjectId,
  };
}

export function getMentorReviewStatus() {
  return {
    status: "COMPLETED",
    review: {
      requirements: "COMPLETED",
      architecture: "COMPLETED",
      code: "COMPLETED",
      testing: "COMPLETED",
    },
  };
}

export function createMentorSession() {
  return {
    session_id: "session_123",
    status: "ACTIVE",
  };
}

export function getMentorSession(id: string): MentorSessionView {
  return {
    id,
    status: "ACTIVE",
    question_number: 2,
    max_questions: 4,
    messages: [
      {
        role: "MENTOR",
        content: "Why did you choose a stateless authentication flow for the API?",
      },
      {
        role: "USER",
        content: "I prioritized stateless tokens because it makes session handling simpler across services.",
      },
    ],
  };
}

export function answerMentorQuestion(sessionId: string, content: string) {
  return {
    message: {
      role: "MENTOR",
      content: "What happens when a token expires and the client retries without renewal?",
    },
    question_number: 3,
    status: "ACTIVE",
    session_id: sessionId,
    user_answer: content,
  };
}

export function completeMentorSession(sessionId: string) {
  return {
    session_id: sessionId,
    status: "ASSESSING",
  };
}

export function getAssessment() {
  return {
    status: "COMPLETED",
    result: "PASSED",
    competencies: [
      {
        name: "Implementation",
        result: "PASSED",
        summary: "Core authentication flows are in place and match the accepted scope.",
      },
      {
        name: "Code Understanding",
        result: "PASSED",
        summary: "The implementation explains its security decisions and trade-offs clearly.",
      },
      {
        name: "Engineering Judgment",
        result: "DEVELOPING",
        summary: "The solution is solid, but more explicit failure handling would improve resilience.",
      },
    ],
  };
}

export function getProof() {
  return {
    id: "proof_123",
    project: {
      title: "Authentication API",
    },
    result: "PASSED",
    competencies: [
      "Implementation",
      "Code Understanding",
      "Design",
    ],
    verified_through: [
      "Repository Review",
      "Mentor Technical Discussion",
      "Assessment Evidence",
    ],
    generated_at: "2026-08-26T15:00:00Z",
  };
}
