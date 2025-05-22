// src/lib/utils/formatting.ts

// 文字列の最初の文字を大文字にし、残りを小文字にする
export function capitalize(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// 金額をフォーマット（日本円表記）
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  }).format(amount);
}

// テキストを指定した長さに切り詰め、末尾に省略記号を付ける
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

// HTMLタグを除去してプレーンテキストを取得
export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

// 文字列をスラッグに変換（URL用）
export function slugify(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD') // 発音記号等を分解
    .replace(/[\u0300-\u036f]/g, '') // アクセント記号などの削除
    .replace(/[^a-z0-9ぁ-んァ-ン一-龯ー]/g, '-') // 英数字、日本語以外をハイフンに置換
    .replace(/-+/g, '-') // 連続するハイフンを一つに
    .replace(/^-|-$/g, ''); // 先頭と末尾のハイフンを削除
}

// ファイルサイズを読みやすい形式に変換
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
