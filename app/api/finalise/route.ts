import { NextRequest, NextResponse } from "next/server";
import { saveSessionData } from "@/lib/dynamo";

export async function POST(req: NextRequest) {
  const { package: sessionPackage } = (await req.json()) as { package: Record<string, unknown> };

  if (!sessionPackage) {
    return NextResponse.json({ error: "A session package is required." }, { status: 400 });
  }

  const tableName = process.env.DYNAMODB_TABLE_NAME_WRITE;

  try {
    await saveSessionData(tableName, sessionPackage);
    return NextResponse.json({ saved: Boolean(tableName) });
  } catch (err) {
    console.error("Unable to write session data:", err);
    return NextResponse.json({ saved: false });
  }
}
