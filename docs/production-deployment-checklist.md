# 🚀 MyWaifu-AI プロダクション環境設定チェックリスト

## ✅ デプロイ前チェック

### 🔐 必須環境変数
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` (PostgreSQL接続文字列)
- [ ] `NEXTAUTH_SECRET` (32文字以上のランダム文字列)
- [ ] `NEXTAUTH_URL` (実際のドメインURL)

### 🔑 認証設定
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] Google OAuth設定でリダイレクトURI追加済み

### 🤖 AI API設定
- [ ] `XAI_API_KEY` (Grok API)
- [ ] `GEMINI_API_KEY` (Google AI)
- [ ] `OPENAI_API_KEY` (OpenAI) - オプション

### 🛡️ セキュリティ設定
- [ ] `RATE_LIMIT_MAX_REQUESTS=50`
- [ ] `RATE_LIMIT_API_MAX_REQUESTS=30`
- [ ] `CONTENT_FILTER_STRICT_MODE=true`
- [ ] `FORCE_HTTPS=true`
- [ ] `SECURE_COOKIES=true`

### 📁 ファイルアップロード設定
- [ ] `MAX_FILE_SIZE_MB=5`
- [ ] `MAX_VIDEO_SIZE_MB=50`
- [ ] `ALLOWED_IMAGE_TYPES`設定済み
- [ ] `ALLOWED_VIDEO_TYPES`設定済み

### 🦠 マルウェアスキャン (推奨)
- [ ] ClamAVサービス設定済み
- [ ] `ENABLE_MALWARE_SCANNING=true`
- [ ] `CLAMAV_HOST`と`CLAMAV_PORT`設定済み

### 📢 通知設定 (オプション)
- [ ] Discord Webhook URL設定済み
- [ ] `DISCORD_SECURITY_WEBHOOK_URL`
- [ ] `DISCORD_ADMIN_WEBHOOK_URL`

### 📋 ログ設定
- [ ] `SECURITY_LOG_LEVEL=warning`
- [ ] `SECURITY_LOG_FILE_PATH`設定済み
- [ ] ログディレクトリの書き込み権限確認済み

## 🧪 デプロイ後テスト

### 基本機能テスト
- [ ] アプリケーション起動確認 (`/api/health`)
- [ ] データベース接続確認
- [ ] 認証システム動作確認
- [ ] ファイルアップロード動作確認

### セキュリティテスト
- [ ] レート制限動作確認
```bash
# レート制限テスト例
for i in {1..60}; do curl -X GET "https://your-domain.com/api/health"; done
```

- [ ] 不正アクセス防止確認
```bash
# 不正アクセステスト例
curl -X POST "https://your-domain.com/api/admin/stats" \
  -H "Content-Type: application/json"
```

- [ ] CSRFプロテクション確認
- [ ] セキュリティヘッダー確認
```bash
curl -I "https://your-domain.com"
```

### パフォーマンステスト
- [ ] レスポンス時間測定 (< 2秒)
- [ ] 同時接続テスト
- [ ] メモリ使用量確認

## サービス設定

- [ ] Node.js環境設定済み
- [ ] ビルドコマンド: `npm run build`
- [ ] 開始コマンド: `npm start`
- [ ] 環境変数すべて設定済み

### データベース設定

- [ ] PostgreSQLインスタンス作成済み
- [ ] `DATABASE_URL`取得済み
- [ ] マイグレーション実行済み

### ドメイン設定

- [ ] カスタムドメイン設定済み (オプション)
- [ ] SSL証明書有効
- [ ] DNS設定確認済み

## 📊 監視とメンテナンス

### ログ監視

- [ ] アプリケーションログ設定
- [ ] セキュリティログ監視
- [ ] エラーログアラート設定

### バックアップ

- [ ] データベース自動バックアップ設定
- [ ] ファイルアップロードバックアップ設定

### アップデート

- [ ] 依存関係の自動セキュリティアップデート
- [ ] 定期的なセキュリティパッチ適用

## 🆘 トラブルシューティング

### よくある問題

1. **ビルドエラー**
   - TypeScript型エラー確認
   - 依存関係の競合確認
   - Prismaクライアント生成確認

2. **認証エラー**
   - `NEXTAUTH_SECRET`の長さ確認 (32文字以上)
   - `NEXTAUTH_URL`の末尾スラッシュ削除
   - Google OAuth設定の確認

3. **データベース接続エラー**
   - `DATABASE_URL`の形式確認
   - ネットワーク接続確認
   - データベースサーバーの状態確認

4. **パフォーマンス問題**
   - メモリ使用量確認
   - レート制限設定の調整
   - データベースクエリの最適化

### 緊急時の対応

- [ ] ロールバック手順確認済み
- [ ] 緊急連絡先リスト準備済み
- [ ] 障害対応手順書準備済み

## ✅ 最終チェック

デプロイ前にすべての項目を確認し、✅にチェックを入れてください。

**署名:** _________________ **日付:** _________________

**承認者:** _________________ **日付:** _________________
