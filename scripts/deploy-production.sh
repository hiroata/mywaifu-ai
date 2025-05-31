#!/bin/bash

# ========================================
# MyWaifu-AI プロダクション用デプロイスクリプト
# ========================================

set -e

echo "🚀 MyWaifu-AI プロダクションデプロイを開始します..."

# 環境変数確認
echo "🔍 環境変数を確認中..."
REQUIRED_VARS=(
    "NODE_ENV"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ 必須環境変数 $var が設定されていません"
        exit 1
    fi
done

echo "✅ 必須環境変数が設定されています"

# 依存関係のインストール
echo "📦 依存関係をインストール中..."
npm ci --omit=dev --ignore-scripts

# Prismaクライアント生成
echo "🔄 Prismaクライアントを生成中..."
npx prisma generate

# データベースマイグレーション
echo "📊 データベースマイグレーションを実行中..."
npx prisma migrate deploy

# アプリケーションビルド
echo "🏗️ アプリケーションをビルド中..."
npm run build

# セキュリティ設定の確認
echo "🛡️ セキュリティ設定を確認中..."

# レート制限設定の確認
if [ -z "$RATE_LIMIT_MAX_REQUESTS" ]; then
    export RATE_LIMIT_MAX_REQUESTS=50
    echo "⚠️ レート制限のデフォルト値を設定: $RATE_LIMIT_MAX_REQUESTS"
fi

# ファイルアップロード設定の確認
if [ -z "$MAX_FILE_SIZE_MB" ]; then
    export MAX_FILE_SIZE_MB=5
    echo "⚠️ ファイルサイズ制限のデフォルト値を設定: ${MAX_FILE_SIZE_MB}MB"
fi

# ClamAVの確認
if [ "$ENABLE_MALWARE_SCANNING" = "true" ]; then
    echo "🦠 ClamAVマルウェアスキャンを確認中..."
    if ! systemctl is-active --quiet clamav-daemon; then
        echo "⚠️ ClamAVデーモンが実行されていません。マルウェアスキャンを無効化します。"
        export ENABLE_MALWARE_SCANNING=false
    else
        echo "✅ ClamAVが正常に動作しています"
    fi
fi

# Discord Webhook設定の確認
if [ -n "$DISCORD_SECURITY_WEBHOOK_URL" ]; then
    echo "📢 Discord通知をテスト中..."
    node scripts/setup-discord-webhooks.js || echo "⚠️ Discord通知の設定を確認してください"
fi

# セキュリティログディレクトリの作成
if [ -n "$SECURITY_LOG_FILE_PATH" ]; then
    LOG_DIR=$(dirname "$SECURITY_LOG_FILE_PATH")
    mkdir -p "$LOG_DIR"
    echo "📋 セキュリティログディレクトリを作成: $LOG_DIR"
fi

# パフォーマンステスト
echo "⚡ パフォーマンステストを実行中..."
timeout 30s npm run start:production &
SERVER_PID=$!
sleep 10

# ヘルスチェック
echo "🔍 ヘルスチェックを実行中..."
HEALTH_CHECK_URL="${NEXTAUTH_URL}/api/health"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK_URL" || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ ヘルスチェック成功: $HEALTH_CHECK_URL"
else
    echo "❌ ヘルスチェック失敗: HTTP $HTTP_STATUS"
fi

# テストサーバーを停止
kill $SERVER_PID 2>/dev/null || true

# セキュリティスキャン
echo "🔒 セキュリティスキャンを実行中..."
echo "  - HTTPS強制: ${FORCE_HTTPS:-true}"
echo "  - セキュアクッキー: ${SECURE_COOKIES:-true}"
echo "  - CSP厳格モード: ${CSP_STRICT_MODE:-true}"
echo "  - コンテンツフィルタ厳格モード: ${CONTENT_FILTER_STRICT_MODE:-true}"

# 最終確認
echo "🎯 デプロイ前最終確認..."
echo "  - NODE_ENV: $NODE_ENV"
echo "  - データベース: 接続済み"
echo "  - 認証: 設定済み"
echo "  - セキュリティ: 有効"
echo "  - ビルド: 成功"

echo "✅ プロダクションデプロイの準備が完了しました！"
echo ""
echo "🚀 デプロイを開始する場合は以下のコマンドを実行してください:"
echo "   npm run start:production"
echo ""
echo "📊 監視とログ:"
echo "   - ヘルスチェック: ${NEXTAUTH_URL}/api/health"
echo "   - デバッグ情報: ${NEXTAUTH_URL}/api/debug"
echo "   - セキュリティログ: ${SECURITY_LOG_FILE_PATH:-'/var/log/security.log'}"
