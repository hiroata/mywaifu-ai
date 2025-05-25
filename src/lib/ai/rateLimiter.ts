// src/lib/ai/rateLimiter.ts - AI APIレート制限とエラーハンドリング
import { AI_CONFIG } from './config';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};

  isAllowed(provider: string, userId?: string): boolean {
    const key = `${provider}_${userId || 'anonymous'}`;
    const limit = AI_CONFIG.rateLimits[provider as keyof typeof AI_CONFIG.rateLimits];
    
    if (!limit) return true;

    const now = Date.now();
    const userLimit = this.store[key];

    if (!userLimit || now > userLimit.resetTime) {
      this.store[key] = {
        count: 1,
        resetTime: now + limit.window
      };
      return true;
    }

    if (userLimit.count >= limit.requests) {
      return false;
    }

    userLimit.count++;
    return true;
  }

  getRemainingRequests(provider: string, userId?: string): number {
    const key = `${provider}_${userId || 'anonymous'}`;
    const limit = AI_CONFIG.rateLimits[provider as keyof typeof AI_CONFIG.rateLimits];
    
    if (!limit) return Infinity;

    const userLimit = this.store[key];
    if (!userLimit || Date.now() > userLimit.resetTime) {
      return limit.requests;
    }

    return Math.max(0, limit.requests - userLimit.count);
  }
}

export const rateLimiter = new RateLimiter();

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public provider: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) break;
      
      // 指数バックオフで再試行
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
