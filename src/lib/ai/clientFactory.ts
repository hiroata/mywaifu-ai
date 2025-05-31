// src/lib/ai/clientFactory.ts
import { XAIClient } from "./xaiClient";
import { GeminiClient } from "./geminiClient";

export type AIProvider = "gemini" | "xai" | "openai";

interface ClientFactoryOptions {
  provider?: AIProvider;
  fallbackProvider?: AIProvider;
  apiKeys?: Record<string, string>;
  saveResponses?: boolean;
}

export class AIClientFactory {
  private static instance: AIClientFactory;
  private clients: Map<AIProvider, any> = new Map();
  private defaultProvider: AIProvider;
  private fallbackProvider: AIProvider;

  private constructor() {
    this.defaultProvider = (process.env.AI_DEFAULT_PROVIDER as AIProvider) || "gemini";
    this.fallbackProvider = (process.env.AI_FALLBACK_PROVIDER as AIProvider) || "xai";
  }

  public static getInstance(): AIClientFactory {
    if (!AIClientFactory.instance) {
      AIClientFactory.instance = new AIClientFactory();
    }
    return AIClientFactory.instance;
  }

  public getClient(provider?: AIProvider, options: ClientFactoryOptions = {}): any {
    const selectedProvider = provider || this.defaultProvider;
    
    if (!this.clients.has(selectedProvider)) {
      this.clients.set(selectedProvider, this.createClient(selectedProvider, options));
    }
    
    return this.clients.get(selectedProvider);
  }

  public async generateWithFallback(
    prompt: string,
    provider?: AIProvider,
    options: ClientFactoryOptions = {}
  ): Promise<string> {
    const primaryProvider = provider || this.defaultProvider;
    
    try {
      const client = this.getClient(primaryProvider, options);
      return await client.generateContent(prompt);
    } catch (error) {
      console.warn(`Primary AI provider ${primaryProvider} failed:`, error);
      
      if (primaryProvider !== this.fallbackProvider) {
        try {
          console.log(`Falling back to ${this.fallbackProvider}`);
          const fallbackClient = this.getClient(this.fallbackProvider, options);
          return await fallbackClient.generateContent(prompt);
        } catch (fallbackError) {
          console.error(`Fallback provider ${this.fallbackProvider} also failed:`, fallbackError);
          throw new Error(`Both primary (${primaryProvider}) and fallback (${this.fallbackProvider}) providers failed`);
        }
      } else {
        throw error;
      }
    }
  }

  private createClient(provider: AIProvider, options: ClientFactoryOptions = {}): any {
    const apiKeys = options.apiKeys || this.getApiKeys();
    
    switch (provider) {
      case "gemini":
        return new GeminiClient({
          apiKey: apiKeys.GOOGLE_API_KEY,
          saveResponses: options.saveResponses
        });
      
      case "xai":
        return new XAIClient({
          apiKey: apiKeys.XAI_API_KEY,
          baseUrl: apiKeys.XAI_API_URL,
          saveResponses: options.saveResponses
        });
      
      case "openai":
        // OpenAIクライアントは既存のものを使用
        throw new Error("OpenAI client integration not implemented yet");
      
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  private getApiKeys(): Record<string, string> {
    return {
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "",
      XAI_API_KEY: process.env.XAI_API_KEY || "",
      XAI_API_URL: process.env.XAI_API_URL || "https://api.x.ai/v1",
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    };
  }

  public isProviderAvailable(provider: AIProvider): boolean {
    const apiKeys = this.getApiKeys();
    
    switch (provider) {
      case "gemini":
        return !!apiKeys.GOOGLE_API_KEY;
      case "xai":
        return !!apiKeys.XAI_API_KEY;
      case "openai":
        return !!apiKeys.OPENAI_API_KEY;
      default:
        return false;
    }
  }

  public getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = ["gemini", "xai", "openai"];
    return providers.filter(provider => this.isProviderAvailable(provider));
  }
}

// 便利な関数をエクスポート
export function getAIClient(provider?: AIProvider, options?: ClientFactoryOptions) {
  return AIClientFactory.getInstance().getClient(provider, options);
}

export function generateWithFallback(
  prompt: string,
  provider?: AIProvider,
  options?: ClientFactoryOptions
): Promise<string> {
  return AIClientFactory.getInstance().generateWithFallback(prompt, provider, options);
}
