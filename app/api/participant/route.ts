import { NextRequest, NextResponse } from "next/server";
import { getPreviousScenario } from "@/lib/dynamo";

export async function POST(req: NextRequest) {
  const { participantId, previousRequired } = await req.json();

  if (!participantId || typeof participantId !== "string" || !participantId.trim()) {
    return NextResponse.json({ error: "A participant ID is required." }, { status: 400 });
  }

  const cleanId = participantId.trim();

  if (!previousRequired) {
    return NextResponse.json({ participantId: cleanId, previousScenario: null });
  }

  const previousScenario = await getPreviousScenario(
    process.env.DYNAMODB_TABLE_NAME_READ,
    cleanId
  );

  if (!previousScenario) {
    return NextResponse.json(
      {
        error: `We weren't able to find a previous response for participant ID "${cleanId}". Please check your participant ID or contact your study administrator.`,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ participantId: cleanId, previousScenario });
}
