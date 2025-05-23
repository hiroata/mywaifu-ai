import { NextRequest, NextResponse } from "next/server";
import { generateAIContent } from "@/lib/ai/contentService";

export async function POST(req: NextRequest) {
  const { prompt, model, provider } = await req.json();
  const apiKeys = {
    XAI_API_KEY: process.env.XAI_API_KEY!,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  };
  try {
    const result = await generateAIContent({ prompt, model, provider, apiKeys });
    return NextResponse.json({ result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
