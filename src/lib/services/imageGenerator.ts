// src/lib/services/imageGenerator.ts - 統合画像生成サービス

import { generateImageStableDiffusion } from '@/lib/stable-diffusion';
import { security } from '@/lib/security';
import { prisma } from '@/lib/database';

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
  generationId?: string;
}

export class ImageGenerationService {
  private static instance: ImageGenerationService;
  
  static getInstance(): ImageGenerationService {
    if (!ImageGenerationService.instance) {
      ImageGenerationService.instance = new ImageGenerationService();
    }
    return ImageGenerationService.instance;
  }

  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    
    try {
      // セキュリティ検証
      await this.validateRequest(options);
      
      // ユーザーの生成制限チェック
      await this.checkUserLimits(options.userId);
      
      // 生成ログを作成
      const generationLog = await this.createGenerationLog(options);
      
      // 画像生成実行
      const result = await this.executeGeneration(options);
      
      const generationTime = Math.floor((Date.now() - startTime) / 1000);
      
      // ログ更新
      await this.updateGenerationLog(generationLog.id, {
        status: result.success ? 'completed' : 'failed',
        imageUrl: result.imageUrl,
        errorMessage: result.error,
        generationTime,
      });
      
      // ユーザーの生成回数を更新
      if (result.success) {
        await this.updateUserGenerationCount(options.userId);
      }
      
      return {
        ...result,
        generationTime,
        generationId: generationLog.id,
      };
      
    } catch (error) {
      console.error('Image generation error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        generationTime: Math.floor((Date.now() - startTime) / 1000),
      };
    }
  }

  private async validateRequest(options: ImageGenerationOptions): Promise<void> {
    // プロンプトの安全性検証
    if (!options.prompt || options.prompt.trim().length === 0) {
      throw new Error('プロンプトは必須です');
    }
    
    if (options.prompt.length > 1000) {
      throw new Error('プロンプトが長すぎます（最大1000文字）');
    }
    
    // 不適切コンテンツフィルタリング
    const inappropriateTerms = [
      'nude', 'naked', 'nsfw', 'explicit', 'sexual',
      'violence', 'blood', 'gore', 'weapon', 'drug'
    ];
    
    const lowercasePrompt = options.prompt.toLowerCase();
    for (const term of inappropriateTerms) {
      if (lowercasePrompt.includes(term)) {
        throw new Error('不適切なコンテンツが検出されました');
      }
    }
  }

  private async checkUserLimits(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptions: true }
    });
    
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 最後の生成日をチェックし、日付が変わっていたらリセット
    if (!user.lastGeneratedAt || user.lastGeneratedAt < today) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          dailyGenerations: 0,
          lastGeneratedAt: now
        }
      });
      user.dailyGenerations = 0;
    }
    
    // プラン別制限チェック
    const activeSubscription = user.subscriptions.find(s => s.status === 'active');
    const plan = activeSubscription?.plan || 'free';
    
    let dailyLimit: number;
    switch (plan) {
      case 'premium':
        dailyLimit = 50;
        break;
      case 'ultimate':
        dailyLimit = -1; // 無制限
        break;
      default:
        dailyLimit = 5;
    }
    
    if (dailyLimit > 0 && user.dailyGenerations >= dailyLimit) {
      throw new Error(`1日の生成制限（${dailyLimit}回）に達しました`);
    }
  }

  private async createGenerationLog(options: ImageGenerationOptions) {
    return await prisma.generationLog.create({
      data: {
        userId: options.userId,
        prompt: options.prompt,
        negativePrompt: options.negativePrompt,
        style: options.style || 'anime',
        sdModel: 'stable-diffusion-xl',
        status: 'pending',
        characterId: options.characterId,
        parameters: {
          size: options.size || '512x512',
          quality: options.quality || 'standard'
        }
      }
    });
  }

  private async executeGeneration(options: ImageGenerationOptions): Promise<Omit<ImageGenerationResult, 'generationTime' | 'generationId'>> {
    try {
      // Stable Diffusion APIを使用
      const result = await generateImageStableDiffusion({
        prompt: this.enhancePrompt(options.prompt, options.style),
        negative_prompt: options.negativePrompt || this.getDefaultNegativePrompt(),
        width: 512,
        height: 512,
        steps: 20,
        cfg_scale: 7,
        sampler_name: 'DPM++ 2M Karras'
      });
      
      if (result.success && result.imageUrl) {
        return {
          success: true,
          imageUrl: result.imageUrl
        };
      } else {
        return {
          success: false,
          error: result.error || '画像生成に失敗しました'
        };
      }
    } catch (error) {
      console.error('Stable Diffusion API error:', error);
      return {
        success: false,
        error: '画像生成サービスでエラーが発生しました'
      };
    }
  }

  private enhancePrompt(prompt: string, style?: 'anime' | 'realistic'): string {
    let enhancedPrompt = prompt;
    
    if (style === 'anime') {
      enhancedPrompt += ', anime style, high quality, detailed, masterpiece, best quality';
    } else if (style === 'realistic') {
      enhancedPrompt += ', photorealistic, high quality, detailed, professional photography';
    }
    
    return enhancedPrompt;
  }

  private getDefaultNegativePrompt(): string {
    return 'low quality, blurry, distorted, deformed, ugly, bad anatomy, extra limbs, missing limbs, watermark, signature, text, nude, nsfw, explicit content';
  }

  private async updateGenerationLog(
    logId: string, 
    updates: {
      status: string;
      imageUrl?: string;
      errorMessage?: string;
      generationTime: number;
    }
  ) {
    await prisma.generationLog.update({
      where: { id: logId },
      data: updates
    });
  }

  private async updateUserGenerationCount(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyGenerations: {
          increment: 1
        },
        lastGeneratedAt: new Date()
      }
    });
  }

  // ユーザーの残り生成回数を取得
  async getUserGenerationStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptions: true }
    });
    
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let dailyGenerations = user.dailyGenerations;
    if (!user.lastGeneratedAt || user.lastGeneratedAt < today) {
      dailyGenerations = 0;
    }
    
    const activeSubscription = user.subscriptions.find(s => s.status === 'active');
    const plan = activeSubscription?.plan || 'free';
    
    let dailyLimit: number;
    switch (plan) {
      case 'premium':
        dailyLimit = 50;
        break;
      case 'ultimate':
        dailyLimit = -1;
        break;
      default:
        dailyLimit = 5;
    }
    
    return {
      plan,
      dailyGenerations,
      dailyLimit,
      remaining: dailyLimit === -1 ? -1 : Math.max(0, dailyLimit - dailyGenerations),
      canGenerate: dailyLimit === -1 || dailyGenerations < dailyLimit
    };
  }
}

export const imageGenerationService = ImageGenerationService.getInstance();