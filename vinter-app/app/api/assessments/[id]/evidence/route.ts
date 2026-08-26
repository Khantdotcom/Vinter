import { jsonResponse } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return jsonResponse([
    {
      competency: "Code Understanding",
      source: {
        type: "MENTOR_ANSWER",
        reference_id: `message_${id}`,
      },
      question: "Why did you choose JWT?",
      answer: "I chose a stateless token pattern to keep the API portable across environments.",
      assessment: "The answer demonstrates a clear design rationale and trade-off awareness.",
    },
    {
      competency: "Design",
      source: {
        type: "REPOSITORY_FILE",
        reference: "src/auth/AuthService.ts",
      },
      assessment: "The repository structure supports the architecture described in the design decisions.",
    },
  ]);
}
