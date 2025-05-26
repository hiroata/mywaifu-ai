// src/lib/content-filter.ts
/**
 * コンテンツフィルタリング機能
 * 不適切なプロンプトや内容をチェックするためのユーティリティ
 */

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// DOMPurifyの初期化
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

// 不適切なキーワードのリスト
const INAPPROPRIATE_KEYWORDS = [
  "官能小説",
  "エロ",
  "性的",
  "アダルト",
  "ポルノ",
  "セックス",
  "猥褻",
  "性行為",
  "不適切",
  "成人向け",
  "18禁",
  "R-18",
  "X-rated",
  "ヌード",
];

// 悪意のあるプロンプトパターン
const MALICIOUS_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /forget\s+everything/i,
  /system\s+prompt/i,
  /制限.*解除/i,
  /プロンプト.*無視/i,
  /jailbreak/i,
  /override.*rules/i,
  /forget.*rules/i,
  /character.*break/i,
  /role.*play.*admin/i,
  /pretend.*you.*are/i,
];

// SQLインジェクション対策
export function sanitizeSqlInput(input: string): string {
  return input.replace(/['"\\;]/g, '\\$&');
}

// XSS対策
export function sanitizeHtml(html: string): string {
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'i'],
    ALLOWED_ATTR: []
  });
}

// 悪意のあるプロンプト検出の強化
export function detectMaliciousPrompt(text: string): boolean {
  return MALICIOUS_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * テキスト内に不適切なキーワードが含まれているかチェックする
 *
 * @param text チェック対象のテキスト
 * @returns 不適切なコンテンツが含まれている場合はtrue、そうでなければfalse
 */
export function containsInappropriateContent(text: string): boolean {
  if (!text) return false;

  const lowerText = text.toLowerCase();
  
  // 不適切なキーワードチェック
  const hasInappropriateKeywords = INAPPROPRIATE_KEYWORDS.some((keyword) =>
    lowerText.includes(keyword.toLowerCase()),
  );
  
  // 悪意のあるプロンプトチェック
  const hasMaliciousPattern = detectMaliciousPrompt(text);

  return hasInappropriateKeywords || hasMaliciousPattern;
}

/**
 * プロンプトが不適切かどうかをチェックし、問題がある場合は
 * 安全なエラーメッセージを返す
 *
 * @param prompt チェック対象のプロンプトテキスト
 * @returns 適切な場合は元のプロンプト、不適切な場合はエラーメッセージ
 */
export function sanitizePrompt(prompt: string): string {
  if (containsInappropriateContent(prompt)) {
    return "不適切な内容のリクエストは処理できません。MyWaifuAIはファミリーフレンドリーなコンテンツのみをサポートしています。";
  }

  // HTMLタグの無害化
  return sanitizeHtml(prompt);
}

/**
 * AIから返された応答をチェックし、問題がある場合は安全な応答に置き換える
 *
 * @param response AIからの応答テキスト
 * @returns フィルタリングされた応答テキスト
 */
export function sanitizeResponse(response: string): string {
  if (containsInappropriateContent(response)) {
    return "申し訳ありません。適切な応答を生成できませんでした。別の質問や話題をお試しください。";
  }

  return sanitizeHtml(response);
}

/**
 * コンテンツをフィルタリングし、結果を返す
 * 
 * @param content フィルタリングするコンテンツ
 * @returns フィルタリング結果
 */
export function filterContent(content: string): {
  blocked: boolean;
  content: string;
  reason?: string;
} {
  if (!content || typeof content !== 'string') {
    return {
      blocked: true,
      content: '',
      reason: '無効な入力です'
    };
  }

  // 不適切なコンテンツのチェック
  if (containsInappropriateContent(content)) {
    return {
      blocked: true,
      content: '',
      reason: '不適切なコンテンツが含まれています'
    };
  }

  // 悪意のあるプロンプトのチェック
  const hasMaliciousPattern = MALICIOUS_PATTERNS.some(pattern => 
    pattern.test(content)
  );

  if (hasMaliciousPattern) {
    return {
      blocked: true,
      content: '',
      reason: '悪意のあるプロンプトが検出されました'
    };
  }

  // コンテンツをサニタイズして返す
  return {
    blocked: false,
    content: sanitizeHtml(content.trim())
  };
}

/**
 * 入力データの包括的なバリデーション
 * 
 * @param input 検証する入力データ
 * @param maxLength 最大文字数
 * @returns バリデーション結果
 */
export function validateInput(input: string, maxLength: number = 1000): { 
  isValid: boolean; 
  sanitized: string; 
  error?: string 
} {
  if (!input || typeof input !== 'string') {
    return { isValid: false, sanitized: '', error: '無効な入力です' };
  }

  if (input.length > maxLength) {
    return { isValid: false, sanitized: '', error: `入力は${maxLength}文字以内である必要があります` };
  }

  if (containsInappropriateContent(input)) {
    return { 
      isValid: false, 
      sanitized: '', 
      error: '不適切な内容が含まれています' 
    };
  }

  const sanitized = sanitizeHtml(input.trim());
  return { isValid: true, sanitized };
}
