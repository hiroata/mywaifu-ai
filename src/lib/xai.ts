// src/lib/xai.ts
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { v4 as uuidv4 } from "uuid";
import { config } from "./config";
import { saveFile, createApiError } from "./utils/index";
import * as fs from "fs";
import * as path from "path";

const { apiKey, baseUrl } = config.api.xai;
const { defaultModel, models } = config.models.xai;

// xAIのChatクライアント初期化用の設定
interface XAIClientOptions {
  apiKey?: string;
  apiUrl?: string;
  saveResponses?: boolean;
}

// xAI ChatCompletionのオプション
interface XAIChatCompletionOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

// xAIクライアントクラス
export class XAIClient {
  private apiKey: string;
  private apiUrl: string;
  private saveResponses: boolean;

  constructor(options: XAIClientOptions = {}) {
    this.apiKey = options.apiKey || apiKey || "";
    this.apiUrl = options.apiUrl || baseUrl;
    this.saveResponses = options.saveResponses || false;

    if (!this.apiKey) {
      console.warn(
        "xAI API key is not set. Please set XAI_API_KEY in your environment variables.",
      );
    }
  }

  // チャット完了リクエスト
  async createChatCompletion(
    messages: ChatCompletionMessageParam[],
    model = defaultModel,
    options: XAIChatCompletionOptions = {},
  ) {
    if (!this.apiKey) {
      throw new Error("xAI API key is not set");
    }

    // デフォルトのパラメータを設定
    const params = {
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1.0,
      frequency_penalty: 0,
      presence_penalty: 0,
      ...options,
    };

    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          ...params,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "API request failed");
      }

      const data = await response.json();
      let assistantMessage = data.choices[0].message;

      // 応答の保存（オプション）
      if (this.saveResponses) {
        this.saveResponseToFile(messages, assistantMessage, model, params);
      }

      return assistantMessage;
    } catch (error) {
      console.error("xAI API Error:", error);
      throw error;
    }
  }

  // 応答をファイルに保存する
  private saveResponseToFile(
    messages: ChatCompletionMessageParam[],
    response: any,
    model: string,
    params: any,
  ) {
    try {
      // データディレクトリの確認と作成
      const dataDir = path.join(process.cwd(), "data", "xai-responses");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const responseObj = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        model,
        params,
        messages,
        response,
      };

      // JSONファイルに保存
      fs.writeFileSync(
        path.join(dataDir, `${responseObj.id}.json`),
        JSON.stringify(responseObj, null, 2),
      );
    } catch (error) {
      console.error("Failed to save xAI response:", error);
      // エラーを抑制し、メイン機能に影響しないようにする
    }
  }
}

// シングルトンインスタンス
const xaiClient = new XAIClient();

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
- ユーザーのリクエストに最大限応えるようにしてください

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

  const allMessages = [
    { role: "system", content: systemPrompt } as ChatCompletionMessageParam,
    ...messages,
  ];

  // xAI APIリクエスト
  return await xaiClient.createChatCompletion(allMessages, defaultModel, {
    temperature: 0.9,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0.5,
  });
}

// 画像生成プロンプト作成（xAIは画像生成に対応していないため、プロンプト生成のみ）
export async function generateImagePrompt(prompt: string, character: any) {
  // AIへの指示を生成
  const enhancedPrompt = `高品質な${character.type === "anime" ? "アニメ風" : "実写のような"}画像を生成するためのプロンプトを作成: 
${character.name}という${character.gender === "female" ? "女性" : "男性"}。
${character.description}
このシーン: ${prompt}
スタイル: ${character.type === "anime" ? "アニメ調、鮮やかな色彩、細部まで描き込まれた" : "写実的、詳細、高解像度、映画のような品質"}

画像生成用の詳細なプロンプトのみを返してください。`;

  // xAI APIリクエスト
  const response = await xaiClient.createChatCompletion(
    [{ role: "user", content: enhancedPrompt } as ChatCompletionMessageParam],
    defaultModel,
    {
      temperature: 0.7,
      max_tokens: 500,
    },
  );

  return response.content;
}

// 一般的なテキスト生成（シンプルなプロンプトから応答を生成）
export async function generateContent(
  prompt: string,
  model = defaultModel,
  options: XAIChatCompletionOptions = {},
) {
  // xAI APIリクエスト
  const response = await xaiClient.createChatCompletion(
    [{ role: "user", content: prompt } as ChatCompletionMessageParam],
    model,
    options,
  );

  return response.content;
}
