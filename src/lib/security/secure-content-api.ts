// src/lib/security/secure-content-api.ts
/**
 * セキュアなコンテンツアップロードAPI
 * ファイル検証、権限チェック、ログ記録を統合
 */

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { validateUploadedFile, generateSecureFileName } from "./file-security";
import { hasPermission, Permission, parseRole } from "./rbac";
import { logSecurityEvent, SecurityEvent } from "./security-logger";
import { validateInput } from "@/lib/content-filter";
import { createApiErrorResponse, createApiSuccessResponse } from "./api-security";

export interface SecureUploadOptions {
  allowedTypes: ('image' | 'video' | 'audio')[];
  maxFileSize?: number;
  requirePremium?: boolean;
  logActivity?: boolean;
}

export async function processSecureUpload(
  request: NextRequest,
  options: SecureUploadOptions
): Promise<{
  isValid: boolean;
  files: Array<{
    fieldName: string;
    originalName: string;
    secureFileName: string;
    buffer: Buffer;
    mimeType: string;
    size: number;
  }>;
  textFields: Record<string, string>;
  session: any;
  error?: string;
}> {
  try {
    // 認証確認
    const session = await auth();
    if (!session?.user) {
      await logSecurityEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        request,
        { action: 'file_upload' },
        { severity: 'medium', blocked: true }
      );
      
      return {
        isValid: false,
        files: [],
        textFields: {},
        session: null,
        error: "認証が必要です"
      };
    }

    // 権限チェック
    const userRole = parseRole(session.user.role);
    if (options.requirePremium && !hasPermission(userRole, Permission.CREATE_CHARACTER)) {
      await logSecurityEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        request,
        { 
          action: 'premium_upload',
          userRole,
          userId: session.user.id
        },
        { 
          severity: 'medium', 
          blocked: true,
          userId: session.user.id
        }
      );
      
      return {
        isValid: false,
        files: [],
        textFields: {},
        session,
        error: "プレミアム権限が必要です"
      };
    }

    const formData = await request.formData();
    const files: any[] = [];
    const textFields: Record<string, string> = {};    // フォームデータを処理
    const formDataEntries: [string, FormDataEntryValue][] = [];
    formData.forEach((value, key) => {
      formDataEntries.push([key, value]);
    });
    
    for (const [key, value] of formDataEntries) {
      if (value instanceof File) {
        // ファイルの処理
        if (value.size === 0) {
          continue; // 空ファイルをスキップ
        }

        // ファイルタイプの判定
        const fileType = options.allowedTypes.find(type => {
          const mimeType = value.type.toLowerCase();
          switch (type) {
            case 'image':
              return mimeType.startsWith('image/');
            case 'video':
              return mimeType.startsWith('video/');
            case 'audio':
              return mimeType.startsWith('audio/');
            default:
              return false;
          }
        });

        if (!fileType) {
          await logSecurityEvent(
            SecurityEvent.INVALID_FILE_TYPE,
            request,
            { 
              fileName: value.name,
              mimeType: value.type,
              allowedTypes: options.allowedTypes,
              userId: session.user.id
            },
            { 
              severity: 'medium', 
              blocked: true,
              userId: session.user.id
            }
          );
          
          return {
            isValid: false,
            files: [],
            textFields: {},
            session,
            error: `無効なファイルタイプ: ${value.type}`
          };
        }

        // セキュリティ検証
        const validation = await validateUploadedFile(value, fileType);
        if (!validation.isValid) {
          await logSecurityEvent(
            SecurityEvent.FILE_UPLOAD_BLOCKED,
            request,
            { 
              fileName: value.name,
              reason: validation.error,
              userId: session.user.id
            },
            { 
              severity: 'high', 
              blocked: true,
              userId: session.user.id
            }
          );
          
          return {
            isValid: false,
            files: [],
            textFields: {},
            session,
            error: validation.error
          };
        }

        // ファイルサイズチェック（追加）
        if (options.maxFileSize && value.size > options.maxFileSize) {
          await logSecurityEvent(
            SecurityEvent.LARGE_FILE_UPLOAD,
            request,
            { 
              fileName: value.name,
              size: value.size,
              maxSize: options.maxFileSize,
              userId: session.user.id
            },
            { 
              severity: 'medium', 
              blocked: true,
              userId: session.user.id
            }
          );
          
          return {
            isValid: false,
            files: [],
            textFields: {},
            session,
            error: `ファイルサイズが大きすぎます: ${Math.round(value.size / 1024 / 1024)}MB`
          };
        }

        files.push({
          fieldName: key,
          originalName: value.name,
          secureFileName: validation.secureFileName!,
          buffer: validation.buffer!,
          mimeType: validation.mimeType!,
          size: value.size
        });
      } else {
        // テキストフィールドの処理
        const textValue = value.toString();
        
        // 入力値の検証
        const validation = validateInput(textValue, 1000);
        if (!validation.isValid) {
          await logSecurityEvent(
            SecurityEvent.SUSPICIOUS_REQUEST,
            request,
            { 
              field: key,
              reason: validation.error,
              userId: session.user.id
            },
            { 
              severity: 'medium', 
              blocked: true,
              userId: session.user.id
            }
          );
          
          return {
            isValid: false,
            files: [],
            textFields: {},
            session,
            error: `無効な入力 (${key}): ${validation.error}`
          };
        }

        textFields[key] = validation.sanitized;
      }
    }

    // 成功ログ
    if (options.logActivity) {
      await logSecurityEvent(
        SecurityEvent.ADMIN_ACTION,
        request,
        { 
          action: 'secure_upload',
          fileCount: files.length,
          totalSize: files.reduce((sum, f) => sum + f.size, 0),
          userId: session.user.id
        },
        { 
          severity: 'low',
          userId: session.user.id
        }
      );
    }

    return {
      isValid: true,
      files,
      textFields,
      session
    };
  } catch (error) {
    await logSecurityEvent(
      SecurityEvent.SUSPICIOUS_REQUEST,
      request,
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        action: 'secure_upload_error'
      },
      { severity: 'high' }
    );

    return {
      isValid: false,
      files: [],
      textFields: {},
      session: null,
      error: "アップロード処理中にエラーが発生しました"
    };
  }
}

export interface SingleFileUploadOptions {
  allowedTypes: string[];
  maxSize: number;
  scanForMalware?: boolean;
  generateSecureName?: boolean;
}

export async function processSecureSingleFile(
  file: File,
  options: SingleFileUploadOptions
): Promise<{
  success: boolean;
  filePath?: string;
  secureFileName?: string;
  error?: string;
}> {
  try {
    // Basic validation
    if (!file || file.size === 0) {
      return {
        success: false,
        error: "ファイルが提供されていません"
      };
    }

    // Check file type
    if (!options.allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `許可されていないファイル形式です。許可形式: ${options.allowedTypes.join(', ')}`
      };
    }

    // Check file size
    if (file.size > options.maxSize) {
      return {
        success: false,
        error: `ファイルサイズが制限を超えています。最大: ${Math.round(options.maxSize / 1024 / 1024)}MB`
      };
    }

    // Determine file type category for validation
    let fileCategory: 'image' | 'video' | 'audio';
    if (file.type.startsWith('image/')) {
      fileCategory = 'image';
    } else if (file.type.startsWith('video/')) {
      fileCategory = 'video';
    } else if (file.type.startsWith('audio/')) {
      fileCategory = 'audio';
    } else {
      return {
        success: false,
        error: "サポートされていないファイル形式です"
      };
    }

    // Validate file using the security validation
    const validation = await validateUploadedFile(file, fileCategory);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || "ファイル検証に失敗しました"
      };
    }

    // For now, we'll use the existing saveFile utility
    // In production, you'd implement proper cloud storage
    const { saveFile } = await import("@/lib/utils/index");
    
    const fileExt = file.name.split(".").pop();
    const contentDir = file.type.startsWith("image/") ? "images" : "videos";
    
    const filePath = await saveFile(validation.buffer!, {
      folder: contentDir,
      extension: fileExt,
    });

    return {
      success: true,
      filePath,
      secureFileName: validation.secureFileName
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "ファイル処理中にエラーが発生しました"
    };
  }
}
