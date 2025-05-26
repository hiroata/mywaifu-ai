// CSP nonce管理
import { randomBytes } from 'crypto';

/**
 * CSP用のnonceを生成
 */
export function generateNonce(): string {
  return randomBytes(16).toString('base64');
}

/**
 * リクエストからnonceを取得または生成
 */
export function getNonce(headers?: Headers): string {
  if (headers?.get('x-nonce')) {
    return headers.get('x-nonce')!;
  }
  return generateNonce();
}
