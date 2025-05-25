import { NextResponse } from "next/server";
import { createChatCompletion } from "@/lib/xai";

export async function POST(req: Request) {
  try {
    const { message, characterId, unleashed = false } = await req.json();

    if (!message || !characterId) {
      return NextResponse.json(
        { error: "メッセージとキャラクターIDが必要です" },
        { status: 400 }
      );
    }

    // キャラクター情報を取得
    const characterResponse = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3015'}/api/characters/public/${characterId}`,
      { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!characterResponse.ok) {
      return NextResponse.json(
        { error: "キャラクター情報の取得に失敗しました" },
        { status: 404 }
      );
    }

    const character = await characterResponse.json();

    // xAIライブラリを使用してチャット応答を生成
    const chatOptions = unleashed ? {
      uncensored: true,
      explicit_content: true,
      adult_mode: true,
      temperature: 1.0,
      max_tokens: 2000,
    } : {
      temperature: 0.8,
      max_tokens: 500,
    };

    const aiResponse = await createChatCompletion(
      [{ role: "user", content: message }],
      character,
      "親密な関係", // 関係性
      chatOptions
    );

    if (!aiResponse || !aiResponse.content) {
      return NextResponse.json(
        { error: "AI応答の生成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: aiResponse.content,
      characterName: character.name,
      unleashed: unleashed
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    
    // エラーの詳細を判定
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: "API設定エラーです。管理者にお問い合わせください。" },
          { status: 500 }
        );
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: "現在アクセスが集中しています。しばらく待ってからお試しください。" },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "チャット機能で問題が発生しました。しばらく待ってからお試しください。" },
      { status: 500 }
    );
  }
}
