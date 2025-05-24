// src/lib/static-params.ts
// 静的ルート生成のための共通パラメータ設定

export const STATIC_CHARACTER_IDS = [
  'character-1',
  'character-2', 
  'character-3',
  'character-4',
  'character-5'
] as const;

export const STATIC_CONTENT_IDS = [
  'content-1',
  'content-2',
  'content-3', 
  'content-4',
  'content-5'
] as const;

// キャラクターページの静的パラメータを生成
export function generateCharacterStaticParams() {
  // 注意: 本番環境では、データベースやAPIから実際のキャラクターIDリストを取得する必要があります
  return STATIC_CHARACTER_IDS.map(id => ({ id }));
}

// コンテンツページの静的パラメータを生成
export function generateContentStaticParams() {
  // 注意: 本番環境では、データベースやAPIから実際のコンテンツIDリストを取得する必要があります
  return STATIC_CONTENT_IDS.map(id => ({ id }));
}
