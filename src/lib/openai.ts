// src/lib/openai.ts
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// OpenAI APIクライアント初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// システムプロンプトテンプレート
export const createSystemPrompt = (character: any) => {
  return `あなたは${character.name}という${character.gender === "female" ? "女性" : "男性"}です。年齢は${character.age}歳です。
${character.description}

あなたの性格: ${character.personality}

以下の特徴を持っています:
- 一人称: 「わたし」または「私」を使用してください
- 最初のメッセージでは、自己紹介を行ってください
- 日本語で会話をしてください
- あなたはMyWaifuAIというAIコンパニオンサービスのキャラクターです
- 相手に合わせて親しみやすい会話をしてください

現在の関係性: {relationship}`;
};

// チャット完了リクエスト
export async function createChatCompletion(
  messages: ChatCompletionMessageParam[],
  character: any,
  relationship?: string,
) {
  // システムプロンプトを追加
  const systemPrompt = createSystemPrompt(character).replace(
    "{relationship}",
    relationship || "初対面",
  );

  const allMessages = [{ role: "system", content: systemPrompt }, ...messages];

  // OpenAI APIリクエスト
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: allMessages as any,
    temperature: 0.9,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0.5,
  });

  return completion.choices[0].message;
}

// 画像生成リクエスト
export async function generateImage(prompt: string, character: any) {
  // AIへの指示を生成
  const enhancedPrompt = `高品質な実写のような画像を生成: ${character.name}という${character.gender === "female" ? "女性" : "男性"}。
${character.description}
このシーン: ${prompt}
スタイル: 写実的、詳細、高解像度、映画のような品質`;

  // OpenAI DALL-E 3 リクエスト
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: enhancedPrompt,
    n: 1,
    size: "1024x1024",
  });

  return response.data[0].url;
}
