import { jsonResponse } from "@/lib/api";
import { listProjects } from "@/lib/domain";

export async function GET() {
  return jsonResponse(listProjects());
}
