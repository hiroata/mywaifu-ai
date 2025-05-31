// src/app/api/ai/integrated/route.ts
import { NextRequest, NextResponse } from "next/server";
import { contentGenerator } from "@/lib/services/contentGenerator";
import { contentEnhancer } from "@/lib/services/contentEnhancer";
import { configManager } from "@/lib/services/configManager";
import { AIProvider } from "@/lib/ai/clientFactory";

interface AIRequest {
  prompt: string;
  type: "generate" | "enhance" | "analyze";
  provider?: AIProvider;
  options?: {
    temperature?: number;
    maxTokens?: number;
    enhancementType?: string;
    targetStyle?: string;
    targetEmotion?: string;
  };
}

interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  provider?: AIProvider;
  model?: string;
  processingTime?: number;
}

export async function POST(request: NextRequest): Promise<NextResponse<AIResponse>> {
  try {
    const body: AIRequest = await request.json();
    const { prompt, type, provider, options = {} } = body;

    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: "Prompt is required"
      }, { status: 400 });
    }

    // ユーザーIDの取得（実際の実装では認証から取得）
    const userId = request.headers.get("x-user-id") || "anonymous";
    
    // 最適なプロバイダーを選択
    const selectedProvider = provider || configManager.selectOptimalProvider(userId);
    
    let result: any;

    switch (type) {
      case "generate":
        result = await contentGenerator.generateContent(prompt, {
          provider: selectedProvider,
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          enableFallback: true
        });
        break;

      case "enhance":
        const enhancementType = options.enhancementType || "grammar";
        
        switch (enhancementType) {
          case "grammar":
            result = await contentEnhancer.correctGrammar(prompt, {
              provider: selectedProvider,
              temperature: options.temperature
            });
            break;
          case "style":
            result = await contentEnhancer.improveStyle(prompt, options.targetStyle as any, {
              provider: selectedProvider,
              temperature: options.temperature
            });
            break;
          case "emotion":
            result = await contentEnhancer.enhanceEmotion(prompt, options.targetEmotion as any, {
              provider: selectedProvider,
              temperature: options.temperature
            });
            break;
          case "summarize":
            result = await contentEnhancer.summarize(prompt, 200, {
              provider: selectedProvider,
              temperature: options.temperature
            });
            break;
          case "elaborate":
            result = await contentEnhancer.elaborate(prompt, undefined, {
              provider: selectedProvider,
              temperature: options.temperature
            });
            break;
          default:
            throw new Error(`Unknown enhancement type: ${enhancementType}`);
        }
        break;

      case "analyze":
        result = await contentEnhancer.analyzeContent(prompt, {
          provider: selectedProvider
        });
        break;

      default:
        return NextResponse.json({
          success: false,
          error: "Invalid request type"
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
      provider: selectedProvider,
      model: result.model,
      processingTime: result.processingTime
    });

  } catch (error) {
    console.error("AI API Error:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // システム状態の取得
    const systemConfig = configManager.getSystemConfig();
    const healthReport = configManager.getHealthReport();
    const availableModels = configManager.getAvailableModels();

    return NextResponse.json({
      success: true,
      data: {
        config: systemConfig,
        health: healthReport,
        availableModels,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("AI Config API Error:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    }, { status: 500 });
  }
}
