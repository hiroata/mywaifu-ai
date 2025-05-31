// src/lib/ai/index.ts - 統合されたAIクライアントモジュール
export * from './config';
export * from './geminiClient';
export * from './xaiClient';
export { getAIClient } from './clientFactory';
export * from './contentService';
export * from './rateLimiter';

import { GeminiClient } from './geminiClient';
import { XAIClient } from './xaiClient';
import { AI_CONFIG, type AIProvider } from './config';

// 統合AIクライアントクラス
export class UnifiedAIClient {
  private geminiClient: GeminiClient;
  private xaiClient: XAIClient;

  constructor() {
    this.geminiClient = new GeminiClient();
    this.xaiClient = new XAIClient();
  }

  async generateResponse(
    prompt: string, 
    provider: AIProvider = 'gemini',
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) {
    try {
      switch(provider) {
        case 'gemini':
          return await this.geminiClient.generateContent(prompt);
        
        case 'xai':
          return await this.xaiClient.generateContent(prompt);
        
        case 'openai':
          // OpenAIクライアントの実装（将来的に追加）
          throw new Error('OpenAI プロバイダーは現在サポートされていません');
        
        default:
          throw new Error(`サポートされていないプロバイダー: ${provider}`);
      }
    } catch (error) {
      console.error(`AI生成エラー (${provider}):`, error);
      
      // フォールバック機能
      if (provider !== AI_CONFIG.fallbackProvider) {
        console.log(`フォールバックプロバイダー (${AI_CONFIG.fallbackProvider}) を試行中...`);
        return await this.generateResponse(prompt, AI_CONFIG.fallbackProvider, options);
      }
      
      throw error;
    }
  }

  async generateImage(
    prompt: string,
    options?: {
      provider?: AIProvider;
      size?: string;
      quality?: string;
    }
  ) {
    // 画像生成のロジック（Stable Diffusion等との統合）
    throw new Error('画像生成機能は現在開発中です');
  }

  // 利用可能なプロバイダーとモデルの取得
  getAvailableProviders(): AIProvider[] {
    return Object.keys(AI_CONFIG.models) as AIProvider[];
  }

  getAvailableModels(provider: AIProvider): string[] {
    return AI_CONFIG.models[provider] || [];
  }
}

// シングルトンインスタンス
export const unifiedAI = new UnifiedAIClient();
