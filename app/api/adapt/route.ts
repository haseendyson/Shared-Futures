import { NextRequest, NextResponse } from "next/server";
import { loadStudyPrompts } from "@/lib/config";
import { completeJson } from "@/lib/llm";

interface AdaptResponse {
  new_scenario: unknown;
}

function coerceToStr(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export async function POST(req: NextRequest) {
  const { study, scenario, input, languageLevel } = (await req.json()) as {
    study: string;
    scenario: string;
    input: string;
    languageLevel?: string;
  };

  if (!study) {
    return NextResponse.json({ error: "A study is required." }, { status: 400 });
  }

  try {
    const prompts = loadStudyPrompts(study);
    const prompt = prompts.buildAdaptationPrompt(languageLevel || "intermediate", scenario, input);
    const response = await completeJson<AdaptResponse>(prompt, prompts.modelName, 0.5);

    if (!response || !("new_scenario" in response)) {
      return NextResponse.json({
        newScenario:
          "Sorry, I couldn't generate an adaptation. Please try again with different wording.",
      });
    }

    return NextResponse.json({ newScenario: coerceToStr(response.new_scenario) });
  } catch (err) {
    console.error("Adaptation failed:", err);
    return NextResponse.json({
      newScenario: "Sorry, something went wrong while adapting the scenario. Please try again.",
    });
  }
}
