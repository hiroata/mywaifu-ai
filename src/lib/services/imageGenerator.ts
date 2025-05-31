// src/lib/services/imageGenerator.ts - 画像生成サービス（無効化済み）

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  style?: 'anime' | 'realistic';
  size?: string;
  quality?: string;
  userId: string;
  characterId?: string;
}

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  generationTime?: number;
  generationId?: string; // 追加
}

export interface UserGenerationStatus {
  dailyLimit: number;
  dailyUsed: number;
  remainingGenerations: number;
  nextResetTime: Date;
  isPremium: boolean;
  canGenerate: boolean; // 追加
}

export class ImageGenerationService {
  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    return {
      success: false,
      error: '画像生成機能は現在利用できません。データベースが削除されました。',
      generationId: 'dummy-generation-id' // 仮のIDを設定
    };
  }

  async getUserGenerationStatus(userId: string): Promise<UserGenerationStatus> {
    return {
      dailyLimit: 0,
      dailyUsed: 0,
      remainingGenerations: 0,
      nextResetTime: new Date(),
      isPremium: false,
      canGenerate: false // デフォルトでは生成不可とする
    };
  }

  async getGenerationHistory(userId: string, limit: number = 20): Promise<any[]> {
    return [];
  }
}

export const imageGenerator = new ImageGenerationService();