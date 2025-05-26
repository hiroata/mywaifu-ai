#!/bin/bash
# MyWaifuAI AI画像生成機能セットアップスクリプト

echo "🚀 MyWaifuAI AI画像生成機能のセットアップを開始します..."

# 1. 依存関係のインストール確認
echo "📦 依存関係を確認中..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.jsがインストールされていません"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npmがインストールされていません"
    exit 1
fi

# 2. プロジェクトディレクトリの確認
if [ ! -f "package.json" ]; then
    echo "❌ package.jsonが見つかりません。プロジェクトルートで実行してください。"
    exit 1
fi

# 3. 必要なパッケージのインストール
echo "📦 必要なパッケージをインストール中..."
npm install react-hot-toast

# 4. 生成画像用ディレクトリの作成
echo "📁 画像保存ディレクトリを作成中..."
mkdir -p public/generated

# 5. 環境変数の確認
echo "🔧 環境変数を確認中..."
if [ ! -f ".env" ]; then
    echo "❌ .envファイルが見つかりません"
    exit 1
fi

if ! grep -q "SD_API_URL" .env; then
    echo "🔧 Stable Diffusion API URL を .env に追加中..."
    echo "" >> .env
    echo "# Stable Diffusion API (Automatic1111)" >> .env
    echo "SD_API_URL=http://localhost:7860" >> .env
fi

# 6. データベースの準備
echo "🗄️ データベースを準備中..."
npx prisma generate
npx prisma db push --force-reset
npx prisma db seed

# 7. TypeScript型チェック
echo "🔍 TypeScript型チェック中..."
npm run type-check

if [ $? -eq 0 ]; then
    echo "✅ セットアップが完了しました！"
    echo ""
    echo "📋 次のステップ:"
    echo "1. Automatic1111をセットアップ (docs/automatic1111-setup-guide.md を参照)"
    echo "2. 必要なモデルをダウンロード:"
    echo "   - illustriousPencilXL_v200.safetensors (アニメ用)"
    echo "   - beautifulRealistic_brav5.safetensors (リアル用)"
    echo "3. Automatic1111を起動: webui-user.bat --api --cors-allow-origins=http://localhost:3004"
    echo "4. MyWaifuAIを起動: npm run dev"
    echo ""
    echo "🌐 アクセス先:"
    echo "- MyWaifuAI: http://localhost:3004"
    echo "- Automatic1111: http://localhost:7860"
    echo ""
    echo "🎉 セットアップ完了！AI画像生成機能をお楽しみください！"
else
    echo "❌ TypeScriptエラーが発生しました。ログを確認してください。"
    exit 1
fi
