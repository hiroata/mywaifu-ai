// src/lib/storage/index.ts
/**
 * メモリ内データストレージシステム
 * データベースの代わりにメモリとファイルを使用
 * サーバーサイドでのみ動作
 */

// データ型定義
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

// メモリ内ストレージ
class MemoryStorage {
  private users: Map<string, User> = new Map();
  private characters: Map<string, Character> = new Map();
  private generationLogs: Map<string, GenerationLog> = new Map();
  private securityLogs: Map<string, SecurityLog> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private dataDir: string;
  private isServer: boolean;

  constructor() {
    this.isServer = typeof window === 'undefined';
    if (this.isServer) {
      const path = require('path');
      this.dataDir = path.join(process.cwd(), 'data');
      this.ensureDataDirectory();
      this.loadData();
    } else {
      this.dataDir = '';
    }
  }

  private async ensureDataDirectory() {
    if (!this.isServer) return;
    
    try {
      const fs = await import('fs/promises');
      await fs.access(this.dataDir);
    } catch {
      const fs = await import('fs/promises');
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  private async loadData() {
    if (!this.isServer) return;
    
    try {
      const fs = await import('fs/promises');
      const path = require('path');
      
      // ユーザーデータ読み込み
      try {
        const usersData = await fs.readFile(path.join(this.dataDir, 'users.json'), 'utf-8');
        const users = JSON.parse(usersData);
        this.users = new Map(users.map((user: any) => [user.id, {
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
          blockedUntil: user.blockedUntil ? new Date(user.blockedUntil) : undefined,
          lastGeneratedAt: user.lastGeneratedAt ? new Date(user.lastGeneratedAt) : undefined,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : undefined,
        }]));
      } catch {
        // ファイルが存在しない場合は空のMapを使用
      }

      // キャラクターデータ読み込み
      try {
        const charactersData = await fs.readFile(path.join(this.dataDir, 'characters.json'), 'utf-8');
        const characters = JSON.parse(charactersData);
        this.characters = new Map(characters.map((char: any) => [char.id, {
          ...char,
          createdAt: new Date(char.createdAt),
          updatedAt: new Date(char.updatedAt),
        }]));
      } catch {
        // ファイルが存在しない場合は空のMapを使用
      }

      // 生成ログデータ読み込み
      try {
        const logsData = await fs.readFile(path.join(this.dataDir, 'generation-logs.json'), 'utf-8');
        const logs = JSON.parse(logsData);
        this.generationLogs = new Map(logs.map((log: any) => [log.id, {
          ...log,
          createdAt: new Date(log.createdAt),
          updatedAt: new Date(log.updatedAt),
        }]));
      } catch {
        // ファイルが存在しない場合は空のMapを使用
      }

      // セキュリティログデータ読み込み
      try {
        const securityData = await fs.readFile(path.join(this.dataDir, 'security-logs.json'), 'utf-8');
        const securityLogs = JSON.parse(securityData);
        this.securityLogs = new Map(securityLogs.map((log: any) => [log.id, {
          ...log,
          timestamp: new Date(log.timestamp),
        }]));
      } catch {
        // ファイルが存在しない場合は空のMapを使用
      }

      // サブスクリプションデータ読み込み
      try {
        const subsData = await fs.readFile(path.join(this.dataDir, 'subscriptions.json'), 'utf-8');
        const subscriptions = JSON.parse(subsData);
        this.subscriptions = new Map(subscriptions.map((sub: any) => [sub.id, {
          ...sub,
          currentPeriodStart: new Date(sub.currentPeriodStart),
          currentPeriodEnd: new Date(sub.currentPeriodEnd),
          createdAt: new Date(sub.createdAt),
          updatedAt: new Date(sub.updatedAt),
        }]));
      } catch {
        // ファイルが存在しない場合は空のMapを使用
      }

    } catch (error) {
      console.error('データ読み込みエラー:', error);
    }
  }

  private async saveData() {
    if (!this.isServer) return;
    
    try {
      const fs = await import('fs/promises');
      const path = require('path');
      
      // ユーザーデータ保存
      await fs.writeFile(
        path.join(this.dataDir, 'users.json'),
        JSON.stringify(Array.from(this.users.values()), null, 2)
      );

      // キャラクターデータ保存
      await fs.writeFile(
        path.join(this.dataDir, 'characters.json'),
        JSON.stringify(Array.from(this.characters.values()), null, 2)
      );

      // 生成ログデータ保存
      await fs.writeFile(
        path.join(this.dataDir, 'generation-logs.json'),
        JSON.stringify(Array.from(this.generationLogs.values()), null, 2)
      );

      // セキュリティログデータ保存（最新1000件のみ）
      const recentSecurityLogs = Array.from(this.securityLogs.values())
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 1000);
      await fs.writeFile(
        path.join(this.dataDir, 'security-logs.json'),
        JSON.stringify(recentSecurityLogs, null, 2)
      );

      // サブスクリプションデータ保存
      await fs.writeFile(
        path.join(this.dataDir, 'subscriptions.json'),
        JSON.stringify(Array.from(this.subscriptions.values()), null, 2)
      );

    } catch (error) {
      console.error('データ保存エラー:', error);
    }
  }

  // ユーザー操作
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    await this.saveData();
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const users = Array.from(this.users.values());
    for (const user of users) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    await this.saveData();
    return updatedUser;
  }

  // キャラクター操作
  async createCharacter(characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character> {
    const character: Character = {
      ...characterData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.characters.set(character.id, character);
    await this.saveData();
    return character;
  }

  async findCharacterById(id: string): Promise<Character | null> {
    return this.characters.get(id) || null;
  }

  async findCharacters(filter?: { isPublic?: boolean }): Promise<Character[]> {
    const characters = Array.from(this.characters.values());
    if (filter?.isPublic !== undefined) {
      return characters.filter(char => char.isPublic === filter.isPublic);
    }
    return characters;
  }

  // 生成ログ操作
  async createGenerationLog(logData: Omit<GenerationLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<GenerationLog> {
    const log: GenerationLog = {
      ...logData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.generationLogs.set(log.id, log);
    await this.saveData();
    return log;
  }

  async updateGenerationLog(id: string, updates: Partial<GenerationLog>): Promise<GenerationLog | null> {
    const log = this.generationLogs.get(id);
    if (!log) return null;

    const updatedLog = {
      ...log,
      ...updates,
      updatedAt: new Date(),
    };
    this.generationLogs.set(id, updatedLog);
    await this.saveData();
    return updatedLog;
  }

  async findGenerationLogsByUser(userId: string): Promise<GenerationLog[]> {
    return Array.from(this.generationLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // セキュリティログ操作
  async createSecurityLog(logData: Omit<SecurityLog, 'id'>): Promise<SecurityLog> {
    const log: SecurityLog = {
      ...logData,
      id: this.generateId(),
    };
    this.securityLogs.set(log.id, log);
    
    // メモリ内では最新5000件のみ保持
    if (this.securityLogs.size > 5000) {
      const logs = Array.from(this.securityLogs.entries())
        .sort(([, a], [, b]) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5000);
      this.securityLogs.clear();
      logs.forEach(([id, log]) => this.securityLogs.set(id, log));
    }

    await this.saveData();
    return log;
  }

  // サブスクリプション操作
  async createSubscription(subData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    const subscription: Subscription = {
      ...subData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.subscriptions.set(subscription.id, subscription);
    await this.saveData();
    return subscription;
  }

  async findSubscriptionsByUser(userId: string): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values())
      .filter(sub => sub.userId === userId)
      .filter(sub => sub.status === 'active');
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // データクリーンアップ
  async cleanup() {
    // 古いセキュリティログを削除（30日以上前）
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const securityEntries = Array.from(this.securityLogs.entries());
    for (const [id, log] of securityEntries) {
      if (log.timestamp < thirtyDaysAgo) {
        this.securityLogs.delete(id);
      }
    }

    // 古い生成ログを削除（90日以上前）
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const generationEntries = Array.from(this.generationLogs.entries());
    for (const [id, log] of generationEntries) {
      if (log.createdAt < ninetyDaysAgo) {
        this.generationLogs.delete(id);
      }
    }

    await this.saveData();
  }
}

// シングルトンインスタンス - サーバーサイドでのみ初期化
let storage: MemoryStorage;

if (typeof window === 'undefined') {
  storage = new MemoryStorage();
} else {
  // クライアントサイドでは空のオブジェクトを返す
  storage = {
    createUser: async () => { throw new Error('Server-only operation'); },
    findUserByEmail: async () => { throw new Error('Server-only operation'); },
    findUserById: async () => { throw new Error('Server-only operation'); },
    updateUser: async () => { throw new Error('Server-only operation'); },
    createCharacter: async () => { throw new Error('Server-only operation'); },
    findCharacterById: async () => { throw new Error('Server-only operation'); },
    findCharacters: async () => { throw new Error('Server-only operation'); },
    createGenerationLog: async () => { throw new Error('Server-only operation'); },
    updateGenerationLog: async () => { throw new Error('Server-only operation'); },
    findGenerationLogsByUser: async () => { throw new Error('Server-only operation'); },
    createSecurityLog: async () => { throw new Error('Server-only operation'); },
    createSubscription: async () => { throw new Error('Server-only operation'); },
    findSubscriptionsByUser: async () => { throw new Error('Server-only operation'); },
    cleanup: async () => { throw new Error('Server-only operation'); },
  } as any;
}

export { storage };

// 定期的なクリーンアップとデータ保存（24時間ごと、サーバーサイドのみ）
if (typeof window === 'undefined') {
  setInterval(() => {
    storage.cleanup();
  }, 24 * 60 * 60 * 1000);
}