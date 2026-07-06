import { NextRequest, NextResponse } from "next/server";
import { loadStudyPrompts } from "@/lib/config";
import { completeJson } from "@/lib/llm";
import { ChatMessage, formatHistory } from "@/lib/chatTypes";

export async function POST(req: NextRequest) {
  const { study, messages } = (await req.json()) as { study: string; messages: ChatMessage[] };

  if (!study) {
    return NextResponse.json({ error: "A study is required." }, { status: 400 });
  }

  try {
    const prompts = loadStudyPrompts(study);
    const prompt = prompts.buildExtractionPrompt(formatHistory(messages ?? []));
    const raw = await completeJson<Record<string, string>>(prompt, prompts.modelName, 0);

    const summaryAnswers: Record<string, string> = {};
    for (const key of prompts.summaryKeys) {
      summaryAnswers[key] = raw?.[key] ?? "";
    }

    return NextResponse.json({ summaryAnswers });
  } catch (err) {
    console.error("Summarisation failed:", err);
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
