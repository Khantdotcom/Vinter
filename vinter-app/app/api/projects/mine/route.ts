import { jsonResponse } from "@/lib/api";
import { listUserProjects } from "@/lib/domain";

export async function GET() {
  return jsonResponse(listUserProjects());
}
