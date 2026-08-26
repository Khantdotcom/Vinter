import { jsonError, jsonResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { normalizeProject } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "asc" },
    });

    return jsonResponse(projects.map(normalizeProject));
  } catch (error) {
    console.error("PROJECT_LIST_FAILED", error);
    return jsonError("PROJECT_LIST_FAILED", "Failed to load projects.", 500);
  }
}
