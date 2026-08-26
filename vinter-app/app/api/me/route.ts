import { jsonResponse } from "@/lib/api";
import { getCurrentUser } from "@/lib/domain";

export async function GET() {
  return jsonResponse(getCurrentUser());
}
