# MyWaifu-AI セキュリティ実装ガイド

## 概要

MyWaifu-AIプロジェクトに包括的なセキュリティフレームワークが実装されました。このドキュメントでは、実装されたセキュリティ機能と設定方法について説明します。

## 実装済みセキュリティ機能

### 1. レート制限 (Rate Limiting)

すべてのAPIエンドポイントに階層化されたレート制限を実装：

- **コンテンツアップロード**: 15分間に10回
- **コメント投稿**: 5分間に20回  
- **いいね操作**: 1分間に100回
- **閲覧追跡**: 1分間に50回
- **パブリックコンテンツ**: 1分間に200回
- **管理者API**: 1分間に20回

### 2. セキュリティログ (Security Logging)

機能的な`logSecurityEvent()`システムで以下のイベントを記録：

- `RATE_LIMIT_EXCEEDED`: レート制限違反
- `UNAUTHORIZED_ACCESS`: 認証エラー
- `SUSPICIOUS_REQUEST`: 不審なリクエスト
- `MALICIOUS_PROMPT_DETECTED`: 不適切コンテンツ検出
- `FILE_UPLOAD_BLOCKED`: ファイルアップロードブロック
- `ADMIN_ACTION`: 成功した操作

### 3. 入力検証・サニタイゼーション

全ユーザー入力に対して：

- **長さ制限**: タイトル(100文字)、説明(500文字)、ストーリー(10,000文字)
- **XSS防護**: `sanitizeHtml()`による自動サニタイズ
- **不適切コンテンツフィルタリング**: `containsInappropriateContent()`
- **SQLインジェクション対策**: パラメータ化クエリとバリデーション

### 4. ファイルアップロードセキュリティ

`processSecureSingleFile()`による：

- **ファイル形式検証**: MIMEタイプとマジックバイト確認
- **サイズ制限**: 画像10MB、動画100MB
- **マルウェアスキャン**: ClamAV統合
- **セキュアファイル名**: ランダム生成とパストラバーサル防止

### 5. RBAC (Role-Based Access Control)

権限ベースのアクセス制御：

- **USER**: 基本コンテンツ作成・表示
- **PREMIUM**: 拡張機能アクセス
- **ADMIN**: 管理者機能
- **ULTIMATE**: 全機能アクセス

### 6. CSRFプロテクション

ミドルウェアレベルでの保護：

- **CSRFトークン検証**: 全POST/PUT/DELETE要求
- **セキュリティヘッダー**: XSS、CSRF、ClickJacking防護
- **HTTPS強制**: 本番環境でのセキュア通信

## 設定方法

### 1. 環境変数設定

`.env.security.example`をコピーして`.env.local`または`.env.production`に追加：

```bash
cp .env.security.example .env.local
```

### 2. 必要な環境変数

```env
# 基本設定
RATE_LIMIT_WINDOW_MS=60000
MAX_FILE_SIZE_MB=10

# Discord Webhook (アラート用)
DISCORD_SECURITY_WEBHOOK_URL="your-webhook-url"

# セキュリティログ
SECURITY_LOG_LEVEL=info
ENABLE_SECURITY_CONSOLE_LOG=true
```

### 3. ClamAVマルウェアスキャン (オプション)

```bash
# Ubuntu/Debian
sudo apt install clamav clamav-daemon
sudo systemctl start clamav-daemon

# Windows
# ClamAV for Windowsをインストール
```

## APIエンドポイント一覧

### セキュリティ実装済みエンドポイント

| エンドポイント | 認証 | レート制限 | RBAC | セキュリティログ |
|---|---|---|---|---|
| `POST /api/content` | ✅ | ✅ | CREATE_CONTENT | ✅ |
| `GET /api/content` | ✅ | ✅ | CREATE_CONTENT | ✅ |
| `GET /api/content/[id]` | ✅ | ✅ | - | ✅ |
| `POST /api/content/[id]/comment` | ✅ | ✅ | CREATE_CONTENT | ✅ |
| `POST /api/content/[id]/like` | ✅ | ✅ | CREATE_CONTENT | ✅ |
| `POST /api/content/[id]/view` | ✅ | ✅ | CREATE_CONTENT | ✅ |
| `GET /api/content/public` | - | ✅ | - | ✅ |
| `POST /api/chat` | ✅ | ✅ | - | ✅ |
| `GET /api/chat` | ✅ | ✅ | - | ✅ |
| `POST /api/ai/chat` | ✅ | ✅ | - | ✅ |
| `GET /api/admin/stats` | ✅ | ✅ | ADMIN_ACCESS | ✅ |

## セキュリティ監視

### 1. ログ監視

セキュリティイベントは以下の形式でログ出力：

```json
{
  "timestamp": "2025-01-XX",
  "type": "RATE_LIMIT_EXCEEDED", 
  "severity": "medium",
  "userId": "user-id",
  "ip": "xxx.xxx.xxx.xxx",
  "userAgent": "...",
  "details": {...}
}
```

### 2. Discord アラート

重要度の高いセキュリティイベントはDiscord Webhookに送信：

- `MALICIOUS_PROMPT_DETECTED`
- `FILE_UPLOAD_BLOCKED`
- `UNAUTHORIZED_ACCESS` (管理者エリア)

### 3. 推奨監視項目

- レート制限違反の頻度
- 不適切コンテンツ検出率
- ファイルアップロード失敗
- 認証エラーのパターン

## 本番環境デプロイ

### 1. セキュリティチェックリスト

- [ ] 全環境変数を設定
- [ ] HTTPS証明書の設定
- [ ] ClamAVサービスの起動
- [ ] Discord Webhook URLの設定
- [ ] ファイアウォール設定
- [ ] ログ監視の設定

### 2. パフォーマンス考慮事項

- レート制限値の調整
- ファイルサイズ制限の最適化
- ログローテーションの設定
- セキュリティスキャンの最適化

## 開発・テスト

### セキュリティテスト例

```bash
# レート制限テスト
for i in {1..200}; do curl http://localhost:3001/api/content/public; done

# 不適切コンテンツテスト
curl -X POST http://localhost:3001/api/content \
  -H "Content-Type: application/json" \
  -d '{"title": "不適切なタイトル", ...}'

# ファイルアップロードテスト
curl -X POST http://localhost:3001/api/content \
  -F "contentFile=@large-file.jpg" \
  -F "title=Test Upload"
```

## トラブルシューティング

### 一般的な問題

1. **レート制限に引っかかる**
   - 制限値を調整: `RATE_LIMIT_MAX_REQUESTS`
   - ウィンドウ時間を調整: `RATE_LIMIT_WINDOW_MS`

2. **ファイルアップロードが失敗**
   - ファイルサイズを確認: `MAX_FILE_SIZE_MB`
   - ClamAVサービスの状態確認

3. **セキュリティログが出力されない**
   - `ENABLE_SECURITY_CONSOLE_LOG=true`を設定
   - ログレベルを確認: `SECURITY_LOG_LEVEL`

## サポート

セキュリティに関する問題や改善提案は、プロジェクトのGitHubリポジトリまでお願いします。

---

**最終更新**: 2025年1月 (セキュリティフレームワーク v1.0)
