// src/lib/security/index.ts - 統合されたセキュリティモジュール
export * from './file-security';
export * from './secure-content-api';
export * from './api-security';
export * from './security-logger';
export * from './rbac';

// 統一されたセキュリティAPI
import { validateUploadedFile, processFileUpload } from './file-security';
import { isRateLimited } from './api-security';
import { logSecurityEvent } from './security-logger';

export const security = {
  validateFile: validateUploadedFile,
  processUpload: processFileUpload,
  checkRateLimit: isRateLimited,
  logEvent: logSecurityEvent,
};

// セキュリティ設定の統合
export interface SecurityConfig {
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    apiMaxRequests: number;
    adminMaxRequests: number;
  };
  fileUpload: {
    maxSizeMB: number;
    allowedTypes: string[];
    enableMalwareScanning: boolean;
  };
  content: {
    enableFiltering: boolean;
    strictMode: boolean;
  };
}

export const defaultSecurityConfig: SecurityConfig = {
  rateLimit: {
    windowMs: 60000, // 1分
    maxRequests: 100,
    apiMaxRequests: 50,
    adminMaxRequests: 20,
  },
  fileUpload: {
    maxSizeMB: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    enableMalwareScanning: true,
  },
  content: {
    enableFiltering: true,
    strictMode: false,
  },
};
