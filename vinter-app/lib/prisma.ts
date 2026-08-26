import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function parseJsonString(value: string | null | undefined): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
  } catch {
    return [];
  }
}

export function normalizeProject(project: any) {
  return {
    id: project.id,
    code: project.code,
    title: project.title,
    category: project.category,
    difficulty: project.difficulty,
    description: project.description,
    estimated_scope: project.estimatedScope,
    business_context: project.businessContext,
    role: project.role,
    requirements: parseJsonString(project.requirements),
    constraints: parseJsonString(project.constraints),
    acceptance_criteria: parseJsonString(project.acceptanceCriteria),
    competencies: parseJsonString(project.competencies),
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };
}
