// src/lib/storage/types.ts
/**
 * ストレージシステムのデータ型定義
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  hashedPassword?: string;
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  isBlocked: boolean;
  lastLoginAt?: Date;
  loginAttempts: number;
  blockedUntil?: Date;
  dailyGenerations: number;
  lastGeneratedAt?: Date;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  age?: number;
  gender: string;
  type: string;
  personality: string;
  profileImageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  prompt?: string;
  negativePrompt?: string;
  style?: string;
  isGenerated: boolean;
  isOnline: boolean;
  sdModel?: string;
  generationParams?: any;
}

export interface GenerationLog {
  id: string;
  userId: string;
  prompt: string;
  negativePrompt?: string;
  style: string;
  sdModel: string;
  status: string;
  imageUrl?: string;
  errorMessage?: string;
  generationTime?: number;
  characterId?: string;
  parameters?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityLog {
  id: string;
  event: string;
  userId?: string;
  sessionId?: string;
  ip: string;
  userAgent: string;
  path: string;
  method: string;
  details?: any;
  severity: string;
  blocked: boolean;
  timestamp: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: string;
  status: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorageInterface {
  // ユーザー操作
  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  updateUser(id: string, updates: Partial<User>): Promise<User | null>;

  // キャラクター操作
  createCharacter(characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character>;
  findCharacterById(id: string): Promise<Character | null>;
  findCharacters(filter?: { isPublic?: boolean }): Promise<Character[]>;

  // 生成ログ操作
  createGenerationLog(logData: Omit<GenerationLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<GenerationLog>;
  updateGenerationLog(id: string, updates: Partial<GenerationLog>): Promise<GenerationLog | null>;
  findGenerationLogsByUser(userId: string): Promise<GenerationLog[]>;

  // セキュリティログ操作
  createSecurityLog(logData: Omit<SecurityLog, 'id'>): Promise<SecurityLog>;

  // サブスクリプション操作
  createSubscription(subData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription>;
  findSubscriptionsByUser(userId: string): Promise<Subscription[]>;

  // その他
  cleanup(): Promise<void>;
}
