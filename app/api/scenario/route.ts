import { NextRequest, NextResponse } from "next/server";
import { loadStudyPrompts } from "@/lib/config";
import { completeJson } from "@/lib/llm";
import { scenarioToText } from "@/lib/scenarioFormat";

interface ScenarioResponse {
  output_scenario: unknown;
}

export async function POST(req: NextRequest) {
  const { study, personaIndex, summaryAnswers, languageLevel } = (await req.json()) as {
    study: string;
    personaIndex: number;
    summaryAnswers: Record<string, string>;
    languageLevel: string;
  };

  if (!study) {
    return NextResponse.json({ error: "A study is required." }, { status: 400 });
  }

  try {
    const prompts = loadStudyPrompts(study);
    const persona = prompts.personas[personaIndex];
    if (!persona) {
      return NextResponse.json({ error: `No persona at index ${personaIndex}.` }, { status: 400 });
    }

    const prompt = prompts.buildScenarioPrompt(
      persona,
      languageLevel || "intermediate",
      summaryAnswers ?? {}
    );

    const response = await completeJson<ScenarioResponse>(prompt, prompts.modelName, 0.7);

    let scenarioObject: unknown = response?.output_scenario;
    if (typeof scenarioObject === "string") {
      try {
        scenarioObject = JSON.parse(scenarioObject);
      } catch {
        // leave as string -- scenarioToText handles that case too
      }
    }
    if (!scenarioObject) {
      throw new Error(`Unexpected response format: ${JSON.stringify(response)}`);
    }

    const text = scenarioToText(scenarioObject as Record<string, unknown>);
    return NextResponse.json({ index: personaIndex, text });
  } catch (err) {
    console.error(`Error generating scenario ${personaIndex}:`, err);
    return NextResponse.json({
      index: personaIndex,
      text: "Sorry, something went wrong while generating this scenario.",
      failed: true,
    });
  }
}
