import { jsonResponse } from "@/lib/api";
import { getProfile } from "@/lib/domain";

export async function GET() {
  return jsonResponse(getProfile());
}
