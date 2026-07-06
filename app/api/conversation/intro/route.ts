import { NextRequest, NextResponse } from "next/server";
import { loadStudyPrompts } from "@/lib/config";

export async function POST(req: NextRequest) {
  const { study, previousScenario } = await req.json();

  if (!study || typeof study !== "string") {
    return NextResponse.json({ error: "A study is required." }, { status: 400 });
  }

  try {
    const prompts = loadStudyPrompts(study);

    if (prompts.requirePreviousFinalScenario && !previousScenario) {
      return NextResponse.json(
        {
          error:
            "This study requires your previous scenario, but we couldn't find one associated with your participant ID. Please contact the researcher.",
        },
        { status: 400 }
      );
    }

    const introText = prompts.buildQuestionsIntro(previousScenario ?? "");
    return NextResponse.json({ introText });
  } catch (err) {
    console.error("Failed to build intro message:", err);
    return NextResponse.json({ error: "Unable to load this study's configuration." }, { status: 500 });
  }
}
