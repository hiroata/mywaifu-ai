// src/lib/database.ts - 統合されたデータベースモジュール
import { PrismaClient } from '@prisma/client';

// Prismaクライアントのシングルトン
declare global {
  var __prisma: PrismaClient | undefined;
}

export const db = globalThis.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = db;
}

// モックデータ（開発・テスト用）
export const mockData = {
  characters: [
    {
      id: 'character-1',
      name: 'サクラ',
      description: '優しくて思いやりのある女の子です。ピンクの髪と大きな瞳が特徴的です。',
      shortDescription: '心優しい桜の精',
      age: 20,
      gender: 'female',
      type: 'anime',
      personality: 'kind,cheerful,caring',
      profileImageUrl: '/images/characters/sakura.jpg',
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'character-2',
      name: 'ユキ',
      description: 'クールで知的な女性。青い髪と鋭い目つきが印象的です。',
      shortDescription: '冷静沈着な知識の番人',
      age: 22,
      gender: 'female',
      type: 'anime',
      personality: 'intelligent,cool,mysterious',
      profileImageUrl: '/images/characters/yuki.jpg',
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  users: [
    {
      id: 'demo-user-1',
      name: 'デモユーザー',
      email: 'demo@example.com',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  conversations: [],
  content: [],
};

// 開発環境用のモッククライアント（db.tsの機能を統合）
export const mockDb = {
  character: {
    findMany: async () => mockData.characters,
    findUnique: async ({ where }: any) => 
      mockData.characters.find(c => c.id === where.id) || null,
    create: async ({ data }: any) => {
      const newCharacter = { ...data, id: `character-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
      mockData.characters.push(newCharacter);
      return newCharacter;
    },
    update: async ({ where, data }: any) => {
      const index = mockData.characters.findIndex(c => c.id === where.id);
      if (index !== -1) {
        mockData.characters[index] = { ...mockData.characters[index], ...data, updatedAt: new Date() };
        return mockData.characters[index];
      }
      return null;
    },
    delete: async ({ where }: any) => {
      const index = mockData.characters.findIndex(c => c.id === where.id);
      if (index !== -1) {
        return mockData.characters.splice(index, 1)[0];
      }
      return null;
    },
  },
  user: {
    findMany: async () => mockData.users,
    findUnique: async ({ where }: any) => 
      mockData.users.find(u => u.id === where.id || u.email === where.email) || null,
    create: async ({ data }: any) => {
      const newUser = { ...data, id: `user-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
      mockData.users.push(newUser);
      return newUser;
    },
  },
  $disconnect: async () => {},
  $connect: async () => {},
};

// 環境に応じてクライアントを選択
export const database = db; // 常に実際のPrismaクライアントを使用

// 下位互換性のためのエイリアス
export { db as prisma };
