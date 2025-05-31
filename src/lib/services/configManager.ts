// src/lib/services/configManager.ts
import { getAIConfig, getProviderConfig, AIProvider } from "../ai/config";

interface UserAIPreferences {
  preferredProvider: AIProvider;
  fallbackProvider: AIProvider;
  defaultModel?: string;
  temperature?: number;
  maxTokens?: number;
  enableAutoFallback: boolean;
  saveResponses: boolean;
}

interface SystemAIStatus {
  availableProviders: AIProvider[];
  providerStatus: Record<AIProvider, {
    available: boolean;
    lastChecked: Date;
    errorMessage?: string;
  }>;
  rateLimit: Record<AIProvider, {
    remaining: number;
    resetTime: Date;
  }>;
}

export class ConfigManagerService {
  private config = getAIConfig();
  private userPreferences: Map<string, UserAIPreferences> = new Map();
  private systemStatus: SystemAIStatus;

  constructor() {
    this.systemStatus = {
      availableProviders: [],
      providerStatus: {
        gemini: { available: false, lastChecked: new Date() },
        xai: { available: false, lastChecked: new Date() },
        openai: { available: false, lastChecked: new Date() }
      },
      rateLimit: {
        gemini: { remaining: 0, resetTime: new Date() },
        xai: { remaining: 0, resetTime: new Date() },
        openai: { remaining: 0, resetTime: new Date() }
      }
    };
    
    this.initializeSystem();
  }

  /**
   * システム初期化
   */
  private async initializeSystem(): Promise<void> {
    await this.checkProviderAvailability();
    this.loadDefaultPreferences();
  }

  /**
   * プロバイダーの可用性をチェック
   */
  async checkProviderAvailability(): Promise<void> {
    const providers: AIProvider[] = ["gemini", "xai", "openai"];
    
    for (const provider of providers) {
      try {
        const isAvailable = await this.testProviderConnection(provider);
        this.systemStatus.providerStatus[provider] = {
          available: isAvailable,
          lastChecked: new Date(),
          errorMessage: isAvailable ? undefined : "Connection failed"
        };
        
        if (isAvailable && !this.systemStatus.availableProviders.includes(provider)) {
          this.systemStatus.availableProviders.push(provider);
        }
      } catch (error) {
        this.systemStatus.providerStatus[provider] = {
          available: false,
          lastChecked: new Date(),
          errorMessage: error instanceof Error ? error.message : "Unknown error"
        };
      }
    }
  }

  /**
   * プロバイダー接続テスト
   */
  private async testProviderConnection(provider: AIProvider): Promise<boolean> {
    try {
      // 環境変数の確認
      const requiredEnvVars = {
        gemini: "GOOGLE_API_KEY",
        xai: "XAI_API_KEY",
        openai: "OPENAI_API_KEY"
      };

      const envVar = requiredEnvVars[provider];
      if (!process.env[envVar]) {
        return false;
      }

      // 実際のAPI接続テスト（簡単なリクエスト）
      // 本番環境では実装が必要
      return true;
    } catch {
      return false;
    }
  }

  /**
   * ユーザー設定の取得
   */
  getUserPreferences(userId: string): UserAIPreferences {
    return this.userPreferences.get(userId) || this.getDefaultPreferences();
  }

  /**
   * ユーザー設定の保存
   */
  saveUserPreferences(userId: string, preferences: Partial<UserAIPreferences>): void {
    const current = this.getUserPreferences(userId);
    const updated = { ...current, ...preferences };
    
    // バリデーション
    if (!this.systemStatus.availableProviders.includes(updated.preferredProvider)) {
      throw new Error(`Provider ${updated.preferredProvider} is not available`);
    }
    
    this.userPreferences.set(userId, updated);
    
    // 永続化（実際の実装では データベースに保存）
    this.persistUserPreferences(userId, updated);
  }

  /**
   * デフォルト設定の取得
   */
  private getDefaultPreferences(): UserAIPreferences {
    return {
      preferredProvider: this.config.defaultProvider,
      fallbackProvider: this.config.fallbackProvider,
      defaultModel: undefined, // プロバイダーのデフォルトを使用
      temperature: 0.7,
      maxTokens: 2048,
      enableAutoFallback: true,
      saveResponses: this.config.development.saveResponses
    };
  }

  /**
   * デフォルト設定の読み込み
   */
  private loadDefaultPreferences(): void {
    // 実際の実装では、データベースから既存のユーザー設定を読み込み
    console.log("Default AI preferences loaded");
  }

  /**
   * ユーザー設定の永続化
   */
  private persistUserPreferences(userId: string, preferences: UserAIPreferences): void {
    // 実際の実装では、データベースに保存
    console.log(`AI preferences saved for user ${userId}:`, preferences);
  }

  /**
   * システム設定の取得
   */
  getSystemConfig() {
    return {
      ...this.config,
      status: this.systemStatus
    };
  }

  /**
   * プロバイダー別設定の取得
   */
  getProviderSettings(provider: AIProvider) {
    return getProviderConfig(provider);
  }
  /**
   * 利用可能なモデル一覧の取得
   */
  getAvailableModels(provider?: AIProvider): Record<AIProvider, string[]> {
    if (provider) {
      return {
        gemini: provider === "gemini" ? this.config.models[provider] : [],
        xai: provider === "xai" ? this.config.models[provider] : [],
        openai: provider === "openai" ? this.config.models[provider] : []
      };
    }
    
    const availableModels: Record<AIProvider, string[]> = {
      gemini: [],
      xai: [],
      openai: []
    };
    
    for (const p of this.systemStatus.availableProviders) {
      availableModels[p] = this.config.models[p];
    }
    
    return availableModels;
  }

  /**
   * レート制限情報の更新
   */
  updateRateLimit(provider: AIProvider, remaining: number, resetTime: Date): void {
    this.systemStatus.rateLimit[provider] = { remaining, resetTime };
  }

  /**
   * レート制限情報の取得
   */
  getRateLimit(provider: AIProvider): { remaining: number; resetTime: Date } {
    return this.systemStatus.rateLimit[provider];
  }

  /**
   * 最適なプロバイダーの選択
   */
  selectOptimalProvider(userId?: string): AIProvider {
    const preferences = userId ? this.getUserPreferences(userId) : this.getDefaultPreferences();
    
    // 優先プロバイダーが利用可能かチェック
    if (this.systemStatus.providerStatus[preferences.preferredProvider]?.available) {
      // レート制限もチェック
      const rateLimit = this.getRateLimit(preferences.preferredProvider);
      if (rateLimit.remaining > 0 || new Date() > rateLimit.resetTime) {
        return preferences.preferredProvider;
      }
    }
    
    // フォールバックプロバイダーをチェック
    if (preferences.enableAutoFallback) {
      if (this.systemStatus.providerStatus[preferences.fallbackProvider]?.available) {
        const rateLimit = this.getRateLimit(preferences.fallbackProvider);
        if (rateLimit.remaining > 0 || new Date() > rateLimit.resetTime) {
          return preferences.fallbackProvider;
        }
      }
      
      // 他の利用可能なプロバイダーを探す
      for (const provider of this.systemStatus.availableProviders) {
        if (provider !== preferences.preferredProvider && provider !== preferences.fallbackProvider) {
          const rateLimit = this.getRateLimit(provider);
          if (rateLimit.remaining > 0 || new Date() > rateLimit.resetTime) {
            return provider;
          }
        }
      }
    }
    
    // 最後の手段として優先プロバイダーを返す
    return preferences.preferredProvider;
  }

  /**
   * プロバイダーの健全性レポート
   */  getHealthReport(): {
    overall: "healthy" | "degraded" | "critical";
    providers: Record<AIProvider, {
      status: "healthy" | "degraded" | "down";
      responseTime?: number;
      errorRate?: number;
      lastError?: string;
    }>;
    recommendations: string[];
  } {
    const report: {
      overall: "healthy" | "degraded" | "critical";
      providers: Record<string, any>;
      recommendations: string[];
    } = {
      overall: "healthy",
      providers: {},
      recommendations: []
    };

    let healthyCount = 0;
    const totalProviders = Object.keys(this.systemStatus.providerStatus).length;

    for (const [provider, status] of Object.entries(this.systemStatus.providerStatus)) {
      if (status.available) {
        report.providers[provider] = { status: "healthy" };
        healthyCount++;
      } else {
        report.providers[provider] = { 
          status: "down", 
          lastError: status.errorMessage 
        };
        report.recommendations.push(`Check ${provider} API configuration`);
      }
    }

    // 全体の健全性を判定
    if (healthyCount === 0) {
      report.overall = "critical";
      report.recommendations.push("All AI providers are down. Check API keys and network connectivity.");
    } else if (healthyCount < totalProviders) {
      report.overall = "degraded";
      report.recommendations.push("Some AI providers are unavailable. Consider checking configuration.");
    }

    return report;
  }

  /**
   * 設定のエクスポート（バックアップ用）
   */
  exportSettings(userId?: string): string {
    const data = {
      systemConfig: this.getSystemConfig(),
      userPreferences: userId ? this.getUserPreferences(userId) : null,
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * 設定のインポート（復元用）
   */
  importSettings(settingsJson: string, userId?: string): void {
    try {
      const data = JSON.parse(settingsJson);
      
      if (userId && data.userPreferences) {
        this.saveUserPreferences(userId, data.userPreferences);
      }
      
      console.log("Settings imported successfully");
    } catch (error) {
      throw new Error(`Failed to import settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// シングルトンインスタンスをエクスポート
export const configManager = new ConfigManagerService();
