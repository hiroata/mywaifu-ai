// src/lib/__tests__/imageGenerator.test.ts
import { ImageGenerationService } from '../services/imageGenerator';

// Mock dependencies
jest.mock('../stable-diffusion', () => ({
  generateImageStableDiffusion: jest.fn(),
}));

jest.mock('../database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    generationLog: {
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../security', () => ({
  security: {
    checkRateLimit: jest.fn(),
    logEvent: jest.fn(),
  },
}));

describe('ImageGenerationService', () => {
  let service: ImageGenerationService;

  beforeEach(() => {
    service = ImageGenerationService.getInstance();
    jest.clearAllMocks();
  });

  describe('generateImage', () => {
    it('should validate required prompt', async () => {
      const options = {
        prompt: '',
        userId: 'test-user-id',
      };

      const result = await service.generateImage(options);

      expect(result.success).toBe(false);
      expect(result.error).toContain('プロンプトは必須です');
    });

    it('should validate prompt length', async () => {
      const options = {
        prompt: 'a'.repeat(1001), // 1001文字
        userId: 'test-user-id',
      };

      const result = await service.generateImage(options);

      expect(result.success).toBe(false);
      expect(result.error).toContain('プロンプトが長すぎます');
    });

    it('should detect inappropriate content', async () => {
      const options = {
        prompt: 'nude character',
        userId: 'test-user-id',
      };

      const result = await service.generateImage(options);

      expect(result.success).toBe(false);
      expect(result.error).toContain('不適切なコンテンツが検出されました');
    });
  });

  describe('getUserGenerationStatus', () => {
    it('should return correct status for free user', async () => {
      const mockUser = {
        id: 'test-user-id',
        dailyGenerations: 3,
        lastGeneratedAt: new Date(),
        subscriptions: [],
      };

      const { prisma } = require('../database');
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const status = await service.getUserGenerationStatus('test-user-id');

      expect(status.plan).toBe('free');
      expect(status.dailyLimit).toBe(5);
      expect(status.dailyGenerations).toBe(3);
      expect(status.remaining).toBe(2);
      expect(status.canGenerate).toBe(true);
    });

    it('should return unlimited for ultimate user', async () => {
      const mockUser = {
        id: 'test-user-id',
        dailyGenerations: 100,
        lastGeneratedAt: new Date(),
        subscriptions: [{ status: 'active', plan: 'ultimate' }],
      };

      const { prisma } = require('../database');
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const status = await service.getUserGenerationStatus('test-user-id');

      expect(status.plan).toBe('ultimate');
      expect(status.dailyLimit).toBe(-1);
      expect(status.remaining).toBe(-1);
      expect(status.canGenerate).toBe(true);
    });

    it('should reset daily count for new day', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const mockUser = {
        id: 'test-user-id',
        dailyGenerations: 5,
        lastGeneratedAt: yesterday,
        subscriptions: [],
      };

      const { prisma } = require('../database');
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const status = await service.getUserGenerationStatus('test-user-id');

      expect(status.dailyGenerations).toBe(0);
      expect(status.remaining).toBe(5);
      expect(status.canGenerate).toBe(true);
    });
  });

  describe('Singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ImageGenerationService.getInstance();
      const instance2 = ImageGenerationService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});