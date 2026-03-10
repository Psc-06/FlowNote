import { NextRequest, NextResponse } from "next/server";
import { parseTextToFlowchart } from "@/lib/aiParser";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { text?: string };
    const text = body?.text?.trim();

    if (!text) {
      return NextResponse.json(
        { error: "Unable to detect process steps in the selected text." },
        { status: 400 }
      );
    }

    const flowchart = await parseTextToFlowchart(text);
    return NextResponse.json(flowchart, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to detect process steps in the selected text.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
