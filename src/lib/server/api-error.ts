import { NextResponse } from "next/server";
import { z } from "zod";
import { GeminiConfigurationError, GeminiGenerationError } from "./gemini";

export function aiApiError(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Енгізілген мәліметтер жарамсыз", details: error.issues.map((issue) => issue.message) },
      { status: 400 },
    );
  }
  if (error instanceof GeminiConfigurationError) {
    return NextResponse.json({ error: error.message, code: "AI_NOT_CONFIGURED" }, { status: 503 });
  }
  if (error instanceof GeminiGenerationError) {
    return NextResponse.json({ error: error.message, code: "AI_GENERATION_FAILED" }, { status: 502 });
  }
  return NextResponse.json({ error: "Серверде күтпеген қате шықты" }, { status: 500 });
}
