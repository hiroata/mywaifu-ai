// src/lib/security/file-security.ts
/**
 * ファイルアップロードセキュリティ
 * ファイルタイプの検証、マルウェアスキャン、サイズ制限など
 */

import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';

const ALLOWED_MIME_TYPES = {
  image: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ],
  video: [
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ],
  audio: [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg'
  ]
};

const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024,    // 10MB
  video: 200 * 1024 * 1024,   // 200MB
  audio: 50 * 1024 * 1024     // 50MB
};

// 危険なファイルシグネチャ
const DANGEROUS_SIGNATURES = [
  // 実行可能ファイル
  Buffer.from('MZ'),              // PE executable
  Buffer.from('7fELF'),           // ELF executable
  Buffer.from('\x00\x00\x01\x00'), // ICO (偽装リスク)
  
  // スクリプト系
  Buffer.from('#!/'),             // Shell script
  Buffer.from('<?php'),           // PHP script
  Buffer.from('<script'),         // JavaScript
  
  // アーカイブ（偽装リスク）
  Buffer.from('PK'),              // ZIP/JAR
  Buffer.from('Rar!'),            // RAR
];

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  buffer?: Buffer;
  mimeType?: string;
  extension?: string;
  secureFileName?: string;
}

/**
 * アップロードされたファイルの包括的な検証
 * 
 * @param file アップロードされたファイル
 * @param type 期待されるファイルタイプ
 * @returns 検証結果
 */
export async function validateUploadedFile(
  file: File,
  type: keyof typeof ALLOWED_MIME_TYPES
): Promise<FileValidationResult> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // ファイルサイズチェック
    if (buffer.length > MAX_FILE_SIZES[type]) {
      return {
        isValid: false,
        error: `File size exceeds limit of ${Math.round(MAX_FILE_SIZES[type] / 1024 / 1024)}MB`
      };
    }

    // 空ファイルチェック
    if (buffer.length === 0) {
      return {
        isValid: false,
        error: 'Empty file is not allowed'
      };
    }

    // 実際のファイルタイプを検証（拡張子に依存しない）
    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType) {
      return {
        isValid: false,
        error: 'Unable to determine file type'
      };
    }    if (!ALLOWED_MIME_TYPES[type].includes(fileType.mime)) {
      return {
        isValid: false,
        error: `Invalid file type. Expected: ${ALLOWED_MIME_TYPES[type].join(', ')}, got: ${fileType.mime}`
      };
    }

    // 危険なファイルシグネチャチェック
    if (containsDangerousSignature(buffer)) {
      return {
        isValid: false,
        error: 'File contains dangerous content'
      };
    }

    // マルウェアスキャン（簡易版）
    if (containsSuspiciousContent(buffer)) {
      return {
        isValid: false,
        error: 'File contains suspicious content'
      };
    }

    // セキュアなファイル名生成
    const secureFileName = generateSecureFileName(file.name, fileType.ext);

    return {
      isValid: true,
      buffer,
      mimeType: fileType.mime,
      extension: fileType.ext,
      secureFileName
    };
  } catch (error) {
    console.error('File validation error:', error);
    return {
      isValid: false,
      error: 'File validation failed'
    };
  }
}

/**
 * 危険なファイルシグネチャが含まれているかチェック
 * 
 * @param buffer ファイルバッファ
 * @returns 危険なシグネチャが見つかった場合はtrue
 */
function containsDangerousSignature(buffer: Buffer): boolean {
  return DANGEROUS_SIGNATURES.some(signature => {
    return buffer.subarray(0, signature.length).equals(signature);
  });
}

/**
 * 疑わしいコンテンツが含まれているかチェック
 * 
 * @param buffer ファイルバッファ
 * @returns 疑わしいコンテンツが見つかった場合はtrue
 */
function containsSuspiciousContent(buffer: Buffer): boolean {
  const suspicious = [
    'javascript:',
    '<script',
    '<?php',
    '<%',
    'eval(',
    'document.cookie',
    'window.location',
    'alert(',
    'confirm(',
    'prompt(',
    'setTimeout(',
    'setInterval('
  ];
  
  const content = buffer.toString('ascii').toLowerCase();
  return suspicious.some(pattern => content.includes(pattern));
}

/**
 * セキュアなファイル名を生成
 * 
 * @param originalName 元のファイル名
 * @param detectedExtension 検出された拡張子
 * @returns セキュアなファイル名
 */
export function generateSecureFileName(originalName: string, detectedExtension?: string): string {
  // 元のファイル名から安全な部分を抽出
  const safeName = originalName
    .replace(/[^a-zA-Z0-9\-_.]/g, '_')  // 英数字、ハイフン、アンダースコア、ドット以外を置換
    .substring(0, 50)                   // 長さ制限
    .replace(/^\.+/, '')                // 先頭のドットを削除
    .replace(/\.+$/, '');               // 末尾のドットを削除

  // ユニークなハッシュを生成
  const hash = crypto.randomBytes(8).toString('hex');
  
  // 検出された拡張子を使用（より安全）
  const extension = detectedExtension || 'bin';
  
  // セキュアなファイル名を構築
  const secureBaseName = safeName || 'file';
  return `${secureBaseName}_${hash}.${extension}`;
}

/**
 * ファイルのメタデータを安全に抽出
 * 
 * @param file ファイルオブジェクト
 * @returns 安全なメタデータ
 */
export function extractSafeMetadata(file: File) {
  return {
    originalName: file.name.substring(0, 255), // 長さ制限
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  };
}

/**
 * 画像の追加検証（寸法チェックなど）
 * 
 * @param buffer 画像バッファ
 * @param maxWidth 最大幅
 * @param maxHeight 最大高さ
 * @returns 検証結果
 */
export async function validateImageDimensions(
  buffer: Buffer, 
  maxWidth: number = 2048, 
  maxHeight: number = 2048
): Promise<{ isValid: boolean; error?: string; width?: number; height?: number }> {
  try {
    // 実際の画像処理ライブラリ（sharp等）を使用することを推奨
    // ここでは簡易的なチェックのみ実装
    
    // JPEGの場合の簡易寸法チェック（実装例）
    if (buffer.subarray(0, 2).equals(Buffer.from([0xFF, 0xD8]))) {
      // JPEG header analysis would go here
      // For now, we'll assume validation passes
      return { isValid: true };
    }
    
    // PNGの場合の簡易寸法チェック
    if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
      // PNG header analysis would go here
      return { isValid: true };
    }
    
    return { isValid: true }; // Default to valid for now
  } catch (error) {
    return { isValid: false, error: 'Failed to validate image dimensions' };
  }
}
