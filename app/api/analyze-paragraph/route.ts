import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const PROCESS_KEYWORDS =
  /\b(if|else|then|after|before|when|retry|loop|process|step|first|next|finally|check|verify|submit|approve|reject|send|receive|trigger|start|end|complete|fail|success|decide|route|redirect)\b/i;

function fallbackCheck(text: string): boolean {
  const cleaned = text.toLowerCase().replace(/\s+/g, " ").trim();
  const keywordMatches = (cleaned.match(PROCESS_KEYWORDS) ?? []).length;
  return keywordMatches >= 2;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { text?: string };
    const text = body?.text?.trim();

    if (!text || text.length < 30) {
      return NextResponse.json({ isProcess: false });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ isProcess: fallbackCheck(text) });
    }

    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0,
      max_tokens: 20,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'You analyze text snippets. Return {"isProcess":true} if the text describes a process, workflow, sequential steps, or decision logic. Return {"isProcess":false} otherwise. Output JSON only.',
        },
        { role: "user", content: text },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as { isProcess?: boolean };
    return NextResponse.json({ isProcess: Boolean(parsed.isProcess) });
  } catch {
    return NextResponse.json({ isProcess: false });
  }
}
