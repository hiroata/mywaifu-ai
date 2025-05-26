#!/bin/bash

# ========================================
# MyWaifu-AI プロダクション環境一括設定
# ========================================

set -e

echo "🚀 MyWaifu-AI プロダクション環境を設定します..."

# 設定ファイルのパス
ENV_PROD_FILE=".env.production"
ENV_SECURITY_FILE=".env.security.example"

# プロダクション環境変数ファイルが存在しない場合は作成
if [ ! -f "$ENV_PROD_FILE" ]; then
    echo "📄 プロダクション環境変数ファイルを作成中..."
    cp .env.production.example "$ENV_PROD_FILE"
    echo "⚠️  .env.production ファイルを編集して実際の値を設定してください"
fi

# セキュリティ設定の確認
echo "🛡️ セキュリティ設定を確認中..."

# 必須環境変数のチェック関数
check_env_var() {
    local var_name=$1
    local var_value=${!var_name}
    
    if [ -z "$var_value" ]; then
        echo "❌ 環境変数 $var_name が設定されていません"
        return 1
    else
        echo "✅ $var_name: 設定済み"
        return 0
    fi
}

# 環境変数を読み込み
source "$ENV_PROD_FILE" 2>/dev/null || echo "⚠️ .env.production ファイルが見つからないか読み込めません"

# 必須環境変数の確認
echo "🔍 必須環境変数を確認中..."
MISSING_VARS=0

check_env_var "NODE_ENV" || ((MISSING_VARS++))
check_env_var "DATABASE_URL" || ((MISSING_VARS++))
check_env_var "NEXTAUTH_SECRET" || ((MISSING_VARS++))
check_env_var "NEXTAUTH_URL" || ((MISSING_VARS++))

# 認証設定の確認
echo "🔑 認証設定を確認中..."
check_env_var "GOOGLE_CLIENT_ID" || ((MISSING_VARS++))
check_env_var "GOOGLE_CLIENT_SECRET" || ((MISSING_VARS++))

# API設定の確認
echo "🤖 AI API設定を確認中..."
if [ -z "$XAI_API_KEY" ] && [ -z "$GEMINI_API_KEY" ] && [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ 少なくとも1つのAI APIキーが必要です"
    ((MISSING_VARS++))
else
    [ -n "$XAI_API_KEY" ] && echo "✅ XAI_API_KEY: 設定済み"
    [ -n "$GEMINI_API_KEY" ] && echo "✅ GEMINI_API_KEY: 設定済み"
    [ -n "$OPENAI_API_KEY" ] && echo "✅ OPENAI_API_KEY: 設定済み"
fi

# セキュリティ設定のデフォルト値設定
echo "🔒 セキュリティ設定を適用中..."

# レート制限設定
export RATE_LIMIT_WINDOW_MS=${RATE_LIMIT_WINDOW_MS:-300000}
export RATE_LIMIT_MAX_REQUESTS=${RATE_LIMIT_MAX_REQUESTS:-50}
export RATE_LIMIT_API_MAX_REQUESTS=${RATE_LIMIT_API_MAX_REQUESTS:-30}

# ファイルアップロード設定
export MAX_FILE_SIZE_MB=${MAX_FILE_SIZE_MB:-5}
export MAX_VIDEO_SIZE_MB=${MAX_VIDEO_SIZE_MB:-50}

# セキュリティ機能
export CONTENT_FILTER_STRICT_MODE=${CONTENT_FILTER_STRICT_MODE:-true}
export FORCE_HTTPS=${FORCE_HTTPS:-true}
export SECURE_COOKIES=${SECURE_COOKIES:-true}

echo "📊 現在のセキュリティ設定:"
echo "  - レート制限: ${RATE_LIMIT_MAX_REQUESTS}回/${RATE_LIMIT_WINDOW_MS}ms"
echo "  - ファイルサイズ制限: ${MAX_FILE_SIZE_MB}MB"
echo "  - HTTPS強制: $FORCE_HTTPS"
echo "  - セキュアクッキー: $SECURE_COOKIES"
echo "  - コンテンツフィルタ厳格モード: $CONTENT_FILTER_STRICT_MODE"

# データベース接続テスト
if [ -n "$DATABASE_URL" ]; then
    echo "🗄️ データベース接続をテスト中..."
    if command -v psql >/dev/null 2>&1; then
        if psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
            echo "✅ データベース接続成功"
        else
            echo "❌ データベース接続失敗"
            ((MISSING_VARS++))
        fi
    else
        echo "⚠️ psqlがインストールされていないため、データベース接続テストをスキップ"
    fi
fi

# Prisma設定の確認
echo "🔄 Prisma設定を確認中..."
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ Prismaスキーマファイルが存在します"
    
    # Prismaクライアント生成
    echo "🔧 Prismaクライアントを生成中..."
    npx prisma generate
    
    # マイグレーションの確認
    if [ "$NODE_ENV" = "production" ]; then
        echo "🚀 プロダクション用マイグレーションを実行中..."
        npx prisma migrate deploy
    else
        echo "⚠️ 開発環境のため、マイグレーションをスキップ"
    fi
else
    echo "❌ Prismaスキーマファイルが見つかりません"
    ((MISSING_VARS++))
fi

# Discord Webhook設定の確認
if [ -n "$DISCORD_SECURITY_WEBHOOK_URL" ]; then
    echo "📢 Discord通知をテスト中..."
    if command -v node >/dev/null 2>&1; then
        node scripts/setup-discord-webhooks.js || echo "⚠️ Discord通知のテストに失敗しました"
    fi
fi

# ログディレクトリの作成
if [ -n "$SECURITY_LOG_FILE_PATH" ]; then
    LOG_DIR=$(dirname "$SECURITY_LOG_FILE_PATH")
    echo "📋 ログディレクトリを作成中: $LOG_DIR"
    mkdir -p "$LOG_DIR"
    
    # 権限設定（本番環境用）
    if [ "$NODE_ENV" = "production" ]; then
        chmod 755 "$LOG_DIR"
        touch "$SECURITY_LOG_FILE_PATH"
        chmod 644 "$SECURITY_LOG_FILE_PATH"
    fi
fi

# 結果の表示
echo ""
echo "🎯 設定結果サマリー:"
if [ $MISSING_VARS -eq 0 ]; then
    echo "✅ すべての必須設定が完了しています"
    echo ""
    echo "🚀 次のステップ:"
    echo "1. プロダクションビルド: npm run build"
    echo "2. アプリケーション起動: npm run start:production"
    echo "3. ヘルスチェック: curl http://localhost:3000/api/health"
    echo ""
    echo "📊 監視URL:"
    echo "- ヘルスチェック: $NEXTAUTH_URL/api/health"
    echo "- デバッグ情報: $NEXTAUTH_URL/api/debug"
    echo "- セキュリティログ: $SECURITY_LOG_FILE_PATH"
else
    echo "❌ $MISSING_VARS 個の設定項目に問題があります"
    echo ""
    echo "🔧 修正が必要な項目:"
    echo "1. .env.production ファイルを編集して必須環境変数を設定"
    echo "2. データベース接続情報の確認"
    echo "3. API キーの設定確認"
    echo ""
    echo "📚 参考ドキュメント:"
    echo "- docs/production-deployment-checklist.md"
    echo "- docs/security-implementation-guide.md"
    
    exit 1
fi

echo "✅ プロダクション環境設定が完了しました！"
