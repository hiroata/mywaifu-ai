// src/lib/ai/xaiClient.ts
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";

interface XAIClientOptions {
  apiKey?: string;
  baseUrl?: string;
  saveResponses?: boolean;
}

interface XAIGenerationOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export class XAIClient {
  private apiKey: string;
  private baseUrl: string;
  private saveResponses: boolean;

  constructor(options: XAIClientOptions = {}) {
    this.apiKey = options.apiKey || process.env.XAI_API_KEY || "";
    this.baseUrl = options.baseUrl || process.env.XAI_API_URL || "https://api.x.ai/v1";
    this.saveResponses = options.saveResponses || false;

    if (!this.apiKey) {
      console.warn(
        "xAI API key is not set. Please set XAI_API_KEY in your environment variables.",
      );
    }
  }

  async generateContent(
    prompt: string, 
    model?: string, 
    options: XAIGenerationOptions = {}
  ): Promise<string> {
    const selectedModel = model || process.env.GROK_MODEL || "grok-3";
    
    try {
      const requestBody = {
        model: selectedModel,
        messages: [{ role: "user", content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2048,
        top_p: options.top_p || 0.8,
        frequency_penalty: options.frequency_penalty || 0,
        presence_penalty: options.presence_penalty || 0,
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "User-Agent": "MyWaifuAI/1.0"
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`xAI API error (${response.status}): ${errorData}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      // レスポンスを保存（開発環境の場合）
      if (this.saveResponses && process.env.NODE_ENV === "development") {
        this.saveResponseToFile(prompt, data, selectedModel, requestBody);
      }

      return content;
    } catch (error) {
      console.error("xAI API Error:", error);
      throw error;
    }
  }

  // 文法修正機能
  async correctGrammar(text: string): Promise<string> {
    const prompt = `以下の文章の文法を修正してください。元の意味を保ちながら、自然で正しい日本語に修正してください：\n\n${text}`;
    return this.generateContent(prompt);
  }

  // 要約機能
  async summarize(text: string, maxLength = 100): Promise<string> {
    const prompt = `以下の文章を${maxLength}文字以内で要約してください：\n\n${text}`;
    return this.generateContent(prompt);
  }

  // 詳細化機能
  async elaborate(text: string): Promise<string> {
    const prompt = `以下の文章をより詳細で具体的な内容に拡張してください：\n\n${text}`;
    return this.generateContent(prompt);
  }

  // 応答をファイルに保存
  private saveResponseToFile(
    prompt: string,
    response: any,
    model: string,
    requestBody: any,
  ): void {
    try {
      const responseDir = path.join(process.cwd(), "responses", "xai");
      if (!fs.existsSync(responseDir)) {
        fs.mkdirSync(responseDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `xai-${timestamp}-${uuidv4().slice(0, 8)}.json`;
      const filepath = path.join(responseDir, filename);

      const logData = {
        timestamp: new Date().toISOString(),
        model,
        prompt,
        requestBody,
        response,
      };

      fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    } catch (error) {
      console.warn("Failed to save xAI response:", error);
    }
  }
}
