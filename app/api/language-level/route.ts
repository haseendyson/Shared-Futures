import { NextRequest, NextResponse } from "next/server";
import { loadStudyPrompts } from "@/lib/config";
import { detectLanguageLevel } from "@/lib/languageLevel";
import { ChatMessage } from "@/lib/chatTypes";

export async function POST(req: NextRequest) {
  const { study, messages } = (await req.json()) as { study: string; messages: ChatMessage[] };

  if (!study) {
    return NextResponse.json({ error: "A study is required." }, { status: 400 });
  }

  try {
    const prompts = loadStudyPrompts(study);
    const languageLevel = await detectLanguageLevel(messages ?? [], prompts.modelName);
    return NextResponse.json({ languageLevel });
  } catch (err) {
    console.error("Language level detection failed:", err);
    return NextResponse.json({ languageLevel: "intermediate" });
  }
}
