import { jsonResponse } from "@/lib/api";
import { getHomeState } from "@/lib/domain";

export async function GET() {
  return jsonResponse(getHomeState());
}
