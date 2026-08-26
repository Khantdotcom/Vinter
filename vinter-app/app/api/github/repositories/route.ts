import { jsonResponse } from "@/lib/api";
import { listGithubRepositories } from "@/lib/domain";

export async function GET() {
  return jsonResponse(listGithubRepositories());
}
