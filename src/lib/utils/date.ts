// src/lib/utils/date.ts

// 日本語の日付フォーマット
export function formatDateJP(date: Date | string | number): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  return `${year}年${month}月${day}日`;
}

// 日本語の日時フォーマット
export function formatDateTimeJP(date: Date | string | number): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");

  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

// 相対的な時間表示（〜分前、〜時間前など）
export function getRelativeTimeJP(date: Date | string | number): string {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  // 1分未満
  if (diffInSeconds < 60) {
    return "たった今";
  }

  // 1時間未満
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}分前`;
  }

  // 24時間未満
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}時間前`;
  }

  // 30日未満
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}日前`;
  }

  // 12ヶ月未満
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months}ヶ月前`;
  }

  // それ以上
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years}年前`;
}
