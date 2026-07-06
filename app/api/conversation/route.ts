import { NextRequest, NextResponse } from "next/server";
import { loadStudyPrompts } from "@/lib/config";
import { completeChat } from "@/lib/llm";
import { ChatMessage, formatHistory } from "@/lib/chatTypes";

export async function POST(req: NextRequest) {
  const { study, history, input } = (await req.json()) as {
    study: string;
    history: ChatMessage[];
    input: string;
  };

  if (!study || typeof study !== "string") {
    return NextResponse.json({ error: "A study is required." }, { status: 400 });
  }
  if (!input || !input.trim()) {
    return NextResponse.json({ error: "A message is required." }, { status: 400 });
  }

  try {
    const prompts = loadStudyPrompts(study);
    const prompt = prompts.buildQuestionsPrompt(formatHistory(history ?? []), input);
    const response = await completeChat(prompt, prompts.modelName, 0.3);
    const finished = response.includes("FINISHED");

    return NextResponse.json({
      response,
      finished,
      questionsOutro: prompts.questionsOutro,
    });
  } catch (err) {
    console.error("Conversation turn failed:", err);
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
