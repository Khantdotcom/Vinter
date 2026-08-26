import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const requirements = [
    "User Registration",
    "User Login",
    "JWT Authentication",
    "Password Validation",
    "Protected Route Authorization",
  ];

  const constraints = [
    "Use Prisma ORM with SQLite for local development",
    "Validate all inputs before persistence",
    "Ensure secure token handling and protected endpoints",
  ];

  const competencies = [
    "Authentication flows",
    "Prisma persistence",
    "Input validation",
    "JWT security",
    "Testing and deployment",
  ];

  const acceptanceCriteria = [
    "Users can register with valid email and password",
    "Users can sign in and receive a JWT",
    "Protected endpoints reject invalid or missing tokens",
    "Application behavior is covered by automated tests",
  ];

  const projectData = {
    id: "project_auth_api",
    code: "auth-api",
    title: "Authentication API",
    category: "Backend",
    difficulty: "Foundation",
    description:
      "Build an authentication API with persistence, validation, tests and deployment.",
    estimatedScope: "MVP",
    businessContext:
      "Provide a secure, reliable authentication foundation for the Vinter platform.",
    role: "Junior Backend Engineer",
    requirements: JSON.stringify(requirements),
    constraints: JSON.stringify(constraints),
    acceptanceCriteria: JSON.stringify(acceptanceCriteria),
    competencies: JSON.stringify(competencies),
  };

  await prisma.project.upsert({
    where: { id: projectData.id },
    update: projectData,
    create: projectData,
  });

  console.log(`Seeded foundation project: ${projectData.title}`);
}

main()
  .catch((error) => {
    console.error("Error seeding foundation project:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
