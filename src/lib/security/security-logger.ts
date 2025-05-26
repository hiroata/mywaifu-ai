// src/lib/security/security-logger.ts
/**
 * セキュリティイベントのログとモニタリング
 * 攻撃の検出、記録、アラート機能
 */

export enum SecurityEvent {
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  REGISTER_ATTEMPT = 'register_attempt',
  SUSPICIOUS_REQUEST = 'suspicious_request',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  MALICIOUS_PROMPT_DETECTED = 'malicious_prompt_detected',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  FILE_UPLOAD_BLOCKED = 'file_upload_blocked',
  XSS_ATTEMPT = 'xss_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  CSRF_TOKEN_MISMATCH = 'csrf_token_mismatch',
  INVALID_FILE_TYPE = 'invalid_file_type',
  LARGE_FILE_UPLOAD = 'large_file_upload',
  ADMIN_ACTION = 'admin_action'
}

export interface SecurityLogEntry {
  event: SecurityEvent;
  userId?: string;
  sessionId?: string;
  ip: string;
  userAgent: string;
  path: string;
  method: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  blocked: boolean;
}

class SecurityLogger {
  private logEntries: SecurityLogEntry[] = [];
  private readonly MAX_LOG_ENTRIES = 10000;
  
  /**
   * セキュリティイベントをログに記録
   * 
   * @param entry ログエントリ
   */
  async log(entry: SecurityLogEntry): Promise<void> {
    // メモリ内ログ（本番環境では外部ログサービス推奨）
    this.logEntries.push(entry);
    
    // ログエントリ数の制限
    if (this.logEntries.length > this.MAX_LOG_ENTRIES) {
      this.logEntries = this.logEntries.slice(-this.MAX_LOG_ENTRIES / 2);
    }

    // コンソールログ
    const logLevel = this.getLogLevel(entry.severity);
    console[logLevel]('SECURITY EVENT:', {
      event: entry.event,
      severity: entry.severity,
      ip: entry.ip,
      path: entry.path,
      method: entry.method,
      blocked: entry.blocked,
      timestamp: entry.timestamp.toISOString(),
      details: entry.details
    });

    // 高リスクイベントの即座アラート
    if (this.isHighRiskEvent(entry)) {
      await this.sendAlert(entry);
    }

    // データベースへの永続化（実装推奨）
    try {
      await this.saveToDatabase(entry);
    } catch (error) {
      console.error('Failed to save security log to database:', error);
    }

    // パターン分析（同一IPからの複数攻撃など）
    this.analyzePatterns(entry);
  }

  /**
   * 高リスクイベントかどうかを判定
   */
  private isHighRiskEvent(entry: SecurityLogEntry): boolean {
    const highRiskEvents = [
      SecurityEvent.MALICIOUS_PROMPT_DETECTED,
      SecurityEvent.UNAUTHORIZED_ACCESS,
      SecurityEvent.SQL_INJECTION_ATTEMPT,
      SecurityEvent.XSS_ATTEMPT
    ];
    
    return entry.severity === 'critical' || 
           highRiskEvents.includes(entry.event) ||
           entry.details.repeated_attempts > 5;
  }

  /**
   * ログレベルを取得
   */
  private getLogLevel(severity: string): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      default:
        return 'log';
    }
  }

  /**
   * アラート送信（実装例）
   */
  private async sendAlert(entry: SecurityLogEntry): Promise<void> {
    // Slack、Discord、メール等での通知実装
    // 環境変数でWebhook URLを設定することを推奨
    
    const alertData = {
      text: `🚨 セキュリティアラート: ${entry.event}`,
      attachments: [{
        color: 'danger',
        fields: [
          { title: 'Event', value: entry.event, short: true },
          { title: 'Severity', value: entry.severity, short: true },
          { title: 'IP Address', value: entry.ip, short: true },
          { title: 'Path', value: entry.path, short: true },
          { title: 'Timestamp', value: entry.timestamp.toISOString(), short: false }
        ]
      }]
    };

    // Webhook送信の実装例（実際の実装では環境変数を使用）
    const webhookUrl = process.env.SECURITY_ALERT_WEBHOOK;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alertData)
        });
      } catch (error) {
        console.error('Failed to send security alert:', error);
      }
    }
  }

  /**
   * データベースへの保存（実装推奨）
   */
  private async saveToDatabase(entry: SecurityLogEntry): Promise<void> {
    // Prismaを使用した実装例
    // await db.securityLog.create({
    //   data: {
    //     event: entry.event,
    //     userId: entry.userId,
    //     sessionId: entry.sessionId,
    //     ip: entry.ip,
    //     userAgent: entry.userAgent,
    //     path: entry.path,
    //     method: entry.method,
    //     details: entry.details,
    //     severity: entry.severity,
    //     timestamp: entry.timestamp,
    //     blocked: entry.blocked
    //   }
    // });
  }

  /**
   * パターン分析
   */
  private analyzePatterns(entry: SecurityLogEntry): void {
    const recentLogs = this.getRecentLogs(entry.ip, 5 * 60 * 1000); // 5分以内
    
    // 同一IPからの短時間での複数回攻撃検出
    if (recentLogs.length >= 5) {
      const suspiciousPattern = {
        ...entry,
        event: SecurityEvent.SUSPICIOUS_REQUEST,
        severity: 'high' as const,
        details: {
          ...entry.details,
          repeated_attempts: recentLogs.length,
          pattern: 'multiple_attacks_same_ip'
        }
      };
      
      // 再帰を避けるため、直接処理
      console.error('PATTERN DETECTED: Multiple attacks from same IP', {
        ip: entry.ip,
        attempts: recentLogs.length,
        events: recentLogs.map(log => log.event)
      });
    }
  }

  /**
   * 最近のログを取得
   */
  private getRecentLogs(ip: string, timeWindowMs: number): SecurityLogEntry[] {
    const cutoff = new Date(Date.now() - timeWindowMs);
    return this.logEntries.filter(log => 
      log.ip === ip && 
      log.timestamp >= cutoff &&
      ['medium', 'high', 'critical'].includes(log.severity)
    );
  }

  /**
   * 統計情報の取得
   */
  public getStatistics(timeWindowMs: number = 24 * 60 * 60 * 1000): {
    total: number;
    byEvent: Record<string, number>;
    bySeverity: Record<string, number>;
    topIPs: Array<{ ip: string; count: number }>;
  } {
    const cutoff = new Date(Date.now() - timeWindowMs);
    const recentLogs = this.logEntries.filter(log => log.timestamp >= cutoff);

    const byEvent: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const ipCounts: Record<string, number> = {};

    recentLogs.forEach(log => {
      byEvent[log.event] = (byEvent[log.event] || 0) + 1;
      bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
      ipCounts[log.ip] = (ipCounts[log.ip] || 0) + 1;
    });

    const topIPs = Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    return {
      total: recentLogs.length,
      byEvent,
      bySeverity,
      topIPs
    };
  }
}

// シングルトンインスタンス
export const securityLogger = new SecurityLogger();

/**
 * セキュリティイベントの簡単なログ記録ヘルパー
 */
export async function logSecurityEvent(
  event: SecurityEvent,
  request: Request | { ip?: string; headers: Headers; url: string; method: string },
  details: Record<string, any> = {},
  options: {
    userId?: string;
    sessionId?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    blocked?: boolean;
  } = {}
): Promise<void> {
  const url = new URL(request.url);
  const ip = 'ip' in request ? request.ip : 
             request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const entry: SecurityLogEntry = {
    event,
    userId: options.userId,
    sessionId: options.sessionId,
    ip: Array.isArray(ip) ? ip[0] : ip,
    userAgent: request.headers.get('user-agent') || 'unknown',
    path: url.pathname,
    method: request.method,
    details,
    severity: options.severity || 'medium',
    timestamp: new Date(),
    blocked: options.blocked || false
  };

  await securityLogger.log(entry);
}
