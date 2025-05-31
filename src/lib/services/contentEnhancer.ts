// src/lib/services/contentEnhancer.ts
import { AIClientFactory, AIProvider } from "../ai/clientFactory";
import { getAIConfig } from "../ai/config";

interface EnhancementOptions {
  provider?: AIProvider;
  model?: string;
  temperature?: number;
}

interface EnhancementResult {
  originalText: string;
  enhancedText: string;
  enhancementType: string;
  provider: AIProvider;
  model: string;
  processingTime: number;
}

export class ContentEnhancerService {
  private aiFactory: AIClientFactory;
  private config = getAIConfig();

  constructor() {
    this.aiFactory = AIClientFactory.getInstance();
  }

  /**
   * 文法修正
   */
  async correctGrammar(
    text: string,
    options: EnhancementOptions = {}
  ): Promise<EnhancementResult> {
    const startTime = Date.now();
    const provider = options.provider || this.config.defaultProvider;

    const prompt = `
以下の文章の文法を修正してください。元の意味とスタイルを保ちながら、正確で自然な日本語に修正してください：

${text}

修正版：
`;

    const client = this.aiFactory.getClient(provider);
    const enhancedText = await client.generateContent(prompt, options.model);
    
    return {
      originalText: text,
      enhancedText: enhancedText.trim(),
      enhancementType: "grammar_correction",
      provider,
      model: options.model || this.config.defaultModels[provider],
      processingTime: Date.now() - startTime
    };
  }

  /**
   * 文章要約
   */
  async summarize(
    text: string,
    maxLength: number = 200,
    options: EnhancementOptions = {}
  ): Promise<EnhancementResult> {
    const startTime = Date.now();
    const provider = options.provider || this.config.defaultProvider;

    const prompt = `
以下の文章を${maxLength}文字以内で要約してください。重要なポイントを漏らさず、簡潔にまとめてください：

${text}

要約：
`;

    const client = this.aiFactory.getClient(provider);
    const enhancedText = await client.generateContent(prompt, options.model);
    
    return {
      originalText: text,
      enhancedText: enhancedText.trim(),
      enhancementType: "summarization",
      provider,
      model: options.model || this.config.defaultModels[provider],
      processingTime: Date.now() - startTime
    };
  }

  /**
   * 文章詳細化・拡張
   */
  async elaborate(
    text: string,
    targetLength?: number,
    options: EnhancementOptions = {}
  ): Promise<EnhancementResult> {
    const startTime = Date.now();
    const provider = options.provider || this.config.defaultProvider;

    const lengthInstruction = targetLength 
      ? `約${targetLength}文字で`
      : "より詳細に";

    const prompt = `
以下の文章を${lengthInstruction}詳細化・拡張してください。具体例や説明を追加して、より豊かで理解しやすい内容にしてください：

${text}

詳細化版：
`;

    const client = this.aiFactory.getClient(provider);
    const enhancedText = await client.generateContent(prompt, options.model);
    
    return {
      originalText: text,
      enhancedText: enhancedText.trim(),
      enhancementType: "elaboration",
      provider,
      model: options.model || this.config.defaultModels[provider],
      processingTime: Date.now() - startTime
    };
  }

  /**
   * 文体改善
   */
  async improveStyle(
    text: string,
    targetStyle: "formal" | "casual" | "creative" | "professional" = "professional",
    options: EnhancementOptions = {}
  ): Promise<EnhancementResult> {
    const startTime = Date.now();
    const provider = options.provider || this.config.defaultProvider;

    const styleDescriptions = {
      formal: "フォーマルで丁寧な",
      casual: "カジュアルで親しみやすい",
      creative: "創造的で表現豊かな",
      professional: "プロフェッショナルで洗練された"
    };

    const prompt = `
以下の文章を${styleDescriptions[targetStyle]}文体に改善してください。内容は保ちながら、表現をより魅力的にしてください：

${text}

改善版：
`;

    const client = this.aiFactory.getClient(provider);
    const enhancedText = await client.generateContent(prompt, options.model);
    
    return {
      originalText: text,
      enhancedText: enhancedText.trim(),
      enhancementType: `style_improvement_${targetStyle}`,
      provider,
      model: options.model || this.config.defaultModels[provider],
      processingTime: Date.now() - startTime
    };
  }

  /**
   * 可読性向上
   */
  async improveReadability(
    text: string,
    options: EnhancementOptions = {}
  ): Promise<EnhancementResult> {
    const startTime = Date.now();
    const provider = options.provider || this.config.defaultProvider;

    const prompt = `
以下の文章の可読性を向上させてください。文章を整理し、理解しやすい構造にして、読みやすくしてください：

${text}

改善版：
`;

    const client = this.aiFactory.getClient(provider);
    const enhancedText = await client.generateContent(prompt, options.model);
    
    return {
      originalText: text,
      enhancedText: enhancedText.trim(),
      enhancementType: "readability_improvement",
      provider,
      model: options.model || this.config.defaultModels[provider],
      processingTime: Date.now() - startTime
    };
  }

  /**
   * 感情表現強化
   */
  async enhanceEmotion(
    text: string,
    targetEmotion: "joy" | "sadness" | "excitement" | "calm" | "romantic" = "joy",
    options: EnhancementOptions = {}
  ): Promise<EnhancementResult> {
    const startTime = Date.now();
    const provider = options.provider || this.config.defaultProvider;

    const emotionDescriptions = {
      joy: "喜びや幸せ",
      sadness: "悲しみや切なさ",
      excitement: "興奮やワクワク感",
      calm: "落ち着きや平穏",
      romantic: "ロマンチックで甘い"
    };

    const prompt = `
以下の文章に${emotionDescriptions[targetEmotion]}の感情をより豊かに表現してください。感情が伝わりやすい表現に強化してください：

${text}

感情強化版：
`;

    const client = this.aiFactory.getClient(provider);
    const enhancedText = await client.generateContent(prompt, options.model);
    
    return {
      originalText: text,
      enhancedText: enhancedText.trim(),
      enhancementType: `emotion_enhancement_${targetEmotion}`,
      provider,
      model: options.model || this.config.defaultModels[provider],
      processingTime: Date.now() - startTime
    };
  }

  /**
   * 翻訳（日本語↔英語）
   */
  async translate(
    text: string,
    targetLanguage: "en" | "ja",
    options: EnhancementOptions = {}
  ): Promise<EnhancementResult> {
    const startTime = Date.now();
    const provider = options.provider || this.config.defaultProvider;

    const languageMap = {
      en: "英語",
      ja: "日本語"
    };

    const prompt = `
以下の文章を自然で正確な${languageMap[targetLanguage]}に翻訳してください：

${text}

翻訳：
`;

    const client = this.aiFactory.getClient(provider);
    const enhancedText = await client.generateContent(prompt, options.model);
    
    return {
      originalText: text,
      enhancedText: enhancedText.trim(),
      enhancementType: `translation_to_${targetLanguage}`,
      provider,
      model: options.model || this.config.defaultModels[provider],
      processingTime: Date.now() - startTime
    };
  }

  /**
   * 複数の強化処理を一括実行
   */
  async enhanceBatch(
    text: string,
    enhancements: Array<{
      type: "grammar" | "style" | "readability" | "emotion" | "elaborate";
      options?: any;
    }>,
    options: EnhancementOptions = {}
  ): Promise<EnhancementResult[]> {
    const results: EnhancementResult[] = [];
    
    for (const enhancement of enhancements) {
      try {
        let result: EnhancementResult;
        
        switch (enhancement.type) {
          case "grammar":
            result = await this.correctGrammar(text, options);
            break;
          case "style":
            result = await this.improveStyle(text, enhancement.options?.targetStyle, options);
            break;
          case "readability":
            result = await this.improveReadability(text, options);
            break;
          case "emotion":
            result = await this.enhanceEmotion(text, enhancement.options?.targetEmotion, options);
            break;
          case "elaborate":
            result = await this.elaborate(text, enhancement.options?.targetLength, options);
            break;
          default:
            continue;
        }
        
        results.push(result);
        
        // 次の処理用に結果を更新
        text = result.enhancedText;
        
      } catch (error) {
        console.error(`Enhancement ${enhancement.type} failed:`, error);
      }
    }
    
    return results;
  }

  /**
   * 文章分析
   */
  async analyzeContent(
    text: string,
    options: EnhancementOptions = {}
  ): Promise<{
    wordCount: number;
    characterCount: number;
    readabilityScore: string;
    sentiment: string;
    suggestions: string[];
  }> {
    const provider = options.provider || this.config.defaultProvider;

    const prompt = `
以下の文章を分析して、次の項目について評価してください：
1. 可読性（高/中/低）
2. 感情的なトーン
3. 改善提案（3つ）

${text}

分析結果をJSON形式で返してください：
{
  "readabilityScore": "高/中/低",
  "sentiment": "感情的なトーン",
  "suggestions": ["提案1", "提案2", "提案3"]
}
`;

    const client = this.aiFactory.getClient(provider);
    const analysisResult = await client.generateContent(prompt, options.model);
    
    try {
      const parsed = JSON.parse(analysisResult);
      return {
        wordCount: text.length,
        characterCount: text.length,
        readabilityScore: parsed.readabilityScore || "中",
        sentiment: parsed.sentiment || "中性",
        suggestions: parsed.suggestions || []
      };
    } catch {
      return {
        wordCount: text.length,
        characterCount: text.length,
        readabilityScore: "中",
        sentiment: "中性",
        suggestions: ["分析結果の解析に失敗しました"]
      };
    }
  }
}

// シングルトンインスタンスをエクスポート
export const contentEnhancer = new ContentEnhancerService();
