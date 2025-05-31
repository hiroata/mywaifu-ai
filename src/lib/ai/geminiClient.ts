// src/lib/ai/geminiClient.ts
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";

interface GeminiClientOptions {
  apiKey?: string;
  model?: string;
  saveResponses?: boolean;
}

interface GeminiGenerationOptions {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

export class GeminiClient {
  private apiKey: string;
  private defaultModel: string;
  private saveResponses: boolean;

  constructor(options: GeminiClientOptions = {}) {
    this.apiKey = options.apiKey || process.env.GOOGLE_API_KEY || "";
    this.defaultModel = options.model || process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";
    this.saveResponses = options.saveResponses || false;

    if (!this.apiKey) {
      console.warn(
        "Google API key is not set. Please set GOOGLE_API_KEY in your environment variables.",
      );
    }
  }

  async generateContent(
    prompt: string, 
    model?: string, 
    options: GeminiGenerationOptions = {}
  ): Promise<string> {
    const selectedModel = model || this.defaultModel;
    
    try {
      const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxOutputTokens || 2048,
          topP: options.topP || 0.8,
          topK: options.topK || 40,
        },
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "User-Agent": "MyWaifuAI/1.0"
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorData}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // レスポンスを保存（開発環境の場合）
      if (this.saveResponses && process.env.NODE_ENV === "development") {
        this.saveResponseToFile(prompt, data, selectedModel, requestBody);
      }

      return content;
    } catch (error) {
      console.error("Gemini API Error:", error);
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
      const responseDir = path.join(process.cwd(), "responses", "gemini");
      if (!fs.existsSync(responseDir)) {
        fs.mkdirSync(responseDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `gemini-${timestamp}-${uuidv4().slice(0, 8)}.json`;
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
      console.warn("Failed to save Gemini response:", error);
    }
  }
}
