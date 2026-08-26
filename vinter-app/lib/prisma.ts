const globalForPrisma = globalThis as unknown as {
  prisma?: any;
};

export const prisma =
  globalForPrisma.prisma ??
  ({
    user: {},
    project: {},
    userProject: {},
    repository: {},
    mentorSession: {},
    assessment: {},
    proof: {},
  } as any);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
