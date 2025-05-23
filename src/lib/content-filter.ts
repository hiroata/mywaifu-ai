// src/lib/content-filter.ts
/**
 * コンテンツフィルタリング機能
 * 不適切なプロンプトや内容をチェックするためのユーティリティ
 */

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

/**
 * テキスト内に不適切なキーワードが含まれているかチェックする
 *
 * @param text チェック対象のテキスト
 * @returns 不適切なコンテンツが含まれている場合はtrue、そうでなければfalse
 */
export function containsInappropriateContent(text: string): boolean {
  if (!text) return false;

  const lowerText = text.toLowerCase();

  return INAPPROPRIATE_KEYWORDS.some((keyword) =>
    lowerText.includes(keyword.toLowerCase()),
  );
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

  return prompt;
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

  return response;
}
