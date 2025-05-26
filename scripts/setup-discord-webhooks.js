// scripts/setup-discord-webhooks.js
// Discord Webhook設定とテストスクリプト

const https = require('https');

/**
 * Discord Webhookにメッセージを送信
 */
async function sendDiscordNotification(webhookUrl, message, color = 0x3498db) {
  if (!webhookUrl) {
    console.log('⚠️ Discord Webhook URLが設定されていません');
    return;
  }

  const payload = {
    embeds: [{
      title: message.title || 'MyWaifu-AI セキュリティアラート',
      description: message.description || '',
      color: color,
      fields: message.fields || [],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'MyWaifu-AI Security System'
      }
    }]
  };

  try {
    const url = new URL(webhookUrl);
    const postData = JSON.stringify(payload);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Discord通知が送信されました');
            resolve(data);
          } else {
            console.error('❌ Discord通知の送信に失敗:', res.statusCode, data);
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Discord通知エラー:', error);
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  } catch (error) {
    console.error('❌ Discord Webhook設定エラー:', error);
    throw error;
  }
}

/**
 * セキュリティアラート用のDiscord通知
 */
async function sendSecurityAlert(type, details) {
  const webhookUrl = process.env.DISCORD_SECURITY_WEBHOOK_URL;
  
  const severityColors = {
    low: 0x95a5a6,     // グレー
    medium: 0xf39c12,  // オレンジ
    high: 0xe74c3c,    // 赤
    critical: 0x8e44ad // 紫
  };

  const message = {
    title: `🚨 セキュリティアラート: ${type}`,
    description: details.description || '不審な活動が検出されました',
    fields: [
      {
        name: '重要度',
        value: details.severity || 'medium',
        inline: true
      },
      {
        name: 'IP Address',
        value: details.ipAddress || 'unknown',
        inline: true
      },
      {
        name: 'User ID',
        value: details.userId || 'anonymous',
        inline: true
      },
      {
        name: 'エンドポイント',
        value: details.endpoint || 'unknown',
        inline: false
      },
      {
        name: '詳細',
        value: details.additionalInfo || 'N/A',
        inline: false
      }
    ]
  };

  const color = severityColors[details.severity] || severityColors.medium;
  
  return sendDiscordNotification(webhookUrl, message, color);
}

/**
 * 管理者通知用のDiscord通知
 */
async function sendAdminNotification(action, details) {
  const webhookUrl = process.env.DISCORD_ADMIN_WEBHOOK_URL;
  
  const message = {
    title: `📊 管理者アクション: ${action}`,
    description: details.description || '管理者操作が実行されました',
    fields: [
      {
        name: '実行者',
        value: details.adminUser || 'system',
        inline: true
      },
      {
        name: '対象',
        value: details.target || 'N/A',
        inline: true
      },
      {
        name: '結果',
        value: details.result || 'success',
        inline: true
      }
    ]
  };

  return sendDiscordNotification(webhookUrl, message, 0x27ae60); // 緑色
}

/**
 * テスト用Discord通知
 */
async function testDiscordNotifications() {
  console.log('🧪 Discord Webhook通知をテスト中...');

  // セキュリティアラートのテスト
  try {
    await sendSecurityAlert('RATE_LIMIT_EXCEEDED', {
      severity: 'medium',
      ipAddress: '192.168.1.100',
      userId: 'test-user',
      endpoint: '/api/test',
      description: 'テスト用レート制限超過アラート',
      additionalInfo: 'これはテスト通知です'
    });
  } catch (error) {
    console.error('❌ セキュリティアラートテスト失敗:', error.message);
  }

  // 管理者通知のテスト
  try {
    await sendAdminNotification('SYSTEM_TEST', {
      adminUser: 'system-admin',
      target: 'notification-system',
      result: 'success',
      description: 'Discord通知システムのテスト'
    });
  } catch (error) {
    console.error('❌ 管理者通知テスト失敗:', error.message);
  }
}

// スクリプトが直接実行された場合のテスト
if (require.main === module) {
  // 環境変数を読み込み
  require('dotenv').config();
  
  testDiscordNotifications().then(() => {
    console.log('✅ Discord通知テストが完了しました');
  }).catch((error) => {
    console.error('❌ Discord通知テストエラー:', error);
    process.exit(1);
  });
}

module.exports = {
  sendDiscordNotification,
  sendSecurityAlert,
  sendAdminNotification
};
