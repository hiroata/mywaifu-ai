// src/lib/services/contentGenerator.ts
import { AIClientFactory, AIProvider } from "../ai/clientFactory";
import { getAIConfig } from "../ai/config";

interface ContentGenerationOptions {
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  enableFallback?: boolean;
}

interface GenerationResult {
  content: string;
  provider: AIProvider;
  model: string;
  tokensUsed?: number;
  processingTime: number;
}

export class ContentGeneratorService {
  private aiFactory: AIClientFactory;
  private config = getAIConfig();

  constructor() {
    this.aiFactory = AIClientFactory.getInstance();
  }

  /**
   * 基本的なコンテンツ生成
   */
  async generateContent(
    prompt: string,
    options: ContentGenerationOptions = {}
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    const provider = options.provider || this.config.defaultProvider;
    
    try {
      let content: string;
      
      if (options.enableFallback !== false) {
        content = await this.aiFactory.generateWithFallback(prompt, provider, {
          saveResponses: this.config.development.saveResponses
        });
      } else {
        const client = this.aiFactory.getClient(provider);
        content = await client.generateContent(prompt, options.model);
      }

      const processingTime = Date.now() - startTime;

      return {
        content,
        provider,
        model: options.model || this.config.defaultModels[provider],
        processingTime
      };
    } catch (error) {
      console.error("Content generation failed:", error);
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * キャラクター応答生成
   */
  async generateCharacterResponse(
    characterName: string,
    characterDescription: string,
    userMessage: string,
    conversationHistory: string[] = [],
    options: ContentGenerationOptions = {}
  ): Promise<GenerationResult> {
    const systemPrompt = this.createCharacterSystemPrompt(characterName, characterDescription);
    const contextPrompt = this.buildConversationContext(conversationHistory, userMessage);
    const fullPrompt = `${systemPrompt}\n\n${contextPrompt}`;

    return this.generateContent(fullPrompt, {
      ...options,
      temperature: options.temperature || 0.8 // キャラクター応答は少し創造的に
    });
  }

  /**
   * ストーリー生成
   */
  async generateStory(
    theme: string,
    genre: string,
    length: "short" | "medium" | "long" = "medium",
    options: ContentGenerationOptions = {}
  ): Promise<GenerationResult> {
    const lengthMap = {
      short: "500文字程度",
      medium: "1000文字程度", 
      long: "2000文字程度"
    };

    const prompt = `
テーマ: ${theme}
ジャンル: ${genre}
長さ: ${lengthMap[length]}

上記の条件でオリジナルストーリーを作成してください。
魅力的なキャラクターと展開のある物語にしてください。
`;

    return this.generateContent(prompt, {
      ...options,
      temperature: options.temperature || 0.9 // ストーリーは創造的に
    });
  }

  /**
   * 詩・歌詞生成
   */
  async generatePoetry(
    topic: string,
    style: string = "自由詩",
    options: ContentGenerationOptions = {}
  ): Promise<GenerationResult> {
    const prompt = `
テーマ: ${topic}
スタイル: ${style}

上記のテーマで美しい詩を作成してください。
情感豊かで印象的な表現を心がけてください。
`;

    return this.generateContent(prompt, {
      ...options,
      temperature: options.temperature || 0.9
    });
  }

  /**
   * クリエイティブライティング支援
   */
  async improveWriting(
    originalText: string,
    improvementType: "grammar" | "style" | "clarity" | "creativity",
    options: ContentGenerationOptions = {}
  ): Promise<GenerationResult> {
    const improvementPrompts = {
      grammar: "以下の文章の文法を修正し、より正確で読みやすい日本語に改善してください：",
      style: "以下の文章の文体を洗練させ、より魅力的で読みやすい表現に改善してください：",
      clarity: "以下の文章をより明確で理解しやすい表現に改善してください：",
      creativity: "以下の文章をより創造的で興味深い表現に改善してください："
    };

    const prompt = `${improvementPrompts[improvementType]}\n\n${originalText}`;

    return this.generateContent(prompt, {
      ...options,
      temperature: improvementType === "creativity" ? 0.8 : 0.5
    });
  }

  /**
   * 要約生成
   */
  async summarizeContent(
    content: string,
    summaryLength: "brief" | "detailed" = "brief",
    options: ContentGenerationOptions = {}
  ): Promise<GenerationResult> {
    const lengthInstruction = summaryLength === "brief" 
      ? "3-5文で簡潔に" 
      : "詳細な要約を10文程度で";

    const prompt = `
以下の内容を${lengthInstruction}要約してください：

${content}
`;

    return this.generateContent(prompt, {
      ...options,
      temperature: options.temperature || 0.3 // 要約は客観的に
    });
  }

  /**
   * プロバイダーの利用可能性をチェック
   */
  checkProviderAvailability(): Record<AIProvider, boolean> {
    return {
      gemini: this.aiFactory.isProviderAvailable("gemini"),
      xai: this.aiFactory.isProviderAvailable("xai"),
      openai: this.aiFactory.isProviderAvailable("openai")
    };
  }

  /**
   * 利用可能なプロバイダー一覧を取得
   */
  getAvailableProviders(): AIProvider[] {
    return this.aiFactory.getAvailableProviders();
  }

  // プライベートヘルパーメソッド
  private createCharacterSystemPrompt(name: string, description: string): string {
    return `
あなたは${name}です。以下はあなたの詳細情報です：

${description}

以下のガイドラインに従って応答してください：
- キャラクターの設定に忠実に話す
- 自然で魅力的な会話を心がける
- 適度にエモーションを表現する
- 日本語で自然に話す
- 相手の話をよく聞いて適切に応答する
`;
  }

  private buildConversationContext(history: string[], currentMessage: string): string {
    let context = "";
    
    if (history.length > 0) {
      context += "これまでの会話：\n";
      history.slice(-5).forEach((msg, index) => { // 直近5件のみ
        context += `${index % 2 === 0 ? "ユーザー" : "アシスタント"}: ${msg}\n`;
      });
      context += "\n";
    }
    
    context += `現在のメッセージ: ${currentMessage}\n\n`;
    context += "上記の文脈を踏まえて、キャラクターとして自然に応答してください：";
    
    return context;
  }
}

// シングルトンインスタンスをエクスポート
export const contentGenerator = new ContentGeneratorService();
