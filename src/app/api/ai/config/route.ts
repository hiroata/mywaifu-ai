// src/app/api/ai/config/route.ts
import { NextRequest, NextResponse } from "next/server";
import { configManager } from "@/lib/services/configManager";
import { AIProvider } from "@/lib/ai/clientFactory";

interface ConfigUpdateRequest {
  preferredProvider?: AIProvider;
  fallbackProvider?: AIProvider;
  temperature?: number;
  maxTokens?: number;
  enableAutoFallback?: boolean;
  saveResponses?: boolean;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // ユーザーIDの取得（実際の実装では認証から取得）
    const userId = request.headers.get("x-user-id") || "anonymous";
    
    // ユーザー設定を取得
    const userPreferences = configManager.getUserPreferences(userId);
    const systemConfig = configManager.getSystemConfig();
    const availableModels = configManager.getAvailableModels();
    const healthReport = configManager.getHealthReport();

    return NextResponse.json({
      success: true,
      data: {
        userPreferences,
        systemConfig: {
          availableProviders: systemConfig.status.availableProviders,
          defaultProvider: systemConfig.defaultProvider,
          fallbackProvider: systemConfig.fallbackProvider
        },
        availableModels,
        healthReport,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("AI Config GET Error:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ConfigUpdateRequest = await request.json();
    
    // ユーザーIDの取得（実際の実装では認証から取得）
    const userId = request.headers.get("x-user-id") || "anonymous";
    
    // ユーザー設定を更新
    configManager.saveUserPreferences(userId, body);
    
    // 更新された設定を取得
    const updatedPreferences = configManager.getUserPreferences(userId);

    return NextResponse.json({
      success: true,
      data: {
        preferences: updatedPreferences,
        message: "Configuration updated successfully"
      }
    });

  } catch (error) {
    console.error("AI Config POST Error:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update configuration"
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // プロバイダーの可用性を再チェック
    await configManager.checkProviderAvailability();
    
    const healthReport = configManager.getHealthReport();
    const systemConfig = configManager.getSystemConfig();

    return NextResponse.json({
      success: true,
      data: {
        message: "Provider availability updated",
        healthReport,
        availableProviders: systemConfig.status.availableProviders,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("AI Config PUT Error:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update provider status"
    }, { status: 500 });
  }
}
