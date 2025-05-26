@echo off
REM MyWaifuAI AI画像生成機能セットアップスクリプト (Windows)

echo 🚀 MyWaifuAI AI画像生成機能のセットアップを開始します...

REM 1. Node.jsの確認
echo 📦 依存関係を確認中...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.jsがインストールされていません
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npmがインストールされていません
    pause
    exit /b 1
)

REM 2. プロジェクトディレクトリの確認
if not exist "package.json" (
    echo ❌ package.jsonが見つかりません。プロジェクトルートで実行してください。
    pause
    exit /b 1
)

REM 3. 必要なパッケージのインストール
echo 📦 必要なパッケージをインストール中...
call npm install react-hot-toast

REM 4. 生成画像用ディレクトリの作成
echo 📁 画像保存ディレクトリを作成中...
if not exist "public\generated" mkdir "public\generated"

REM 5. 環境変数の確認
echo 🔧 環境変数を確認中...
if not exist ".env" (
    echo ❌ .envファイルが見つかりません
    pause
    exit /b 1
)

findstr /C:"SD_API_URL" .env >nul
if errorlevel 1 (
    echo 🔧 Stable Diffusion API URL を .env に追加中...
    echo. >> .env
    echo # Stable Diffusion API (Automatic1111) >> .env
    echo SD_API_URL=http://localhost:7860 >> .env
)

REM 6. データベースの準備
echo 🗄️ データベースを準備中...
call npx prisma generate
call npx prisma db push --force-reset
call npx prisma db seed

REM 7. TypeScript型チェック
echo 🔍 TypeScript型チェック中...
call npm run type-check

if errorlevel 1 (
    echo ❌ TypeScriptエラーが発生しました。ログを確認してください。
    pause
    exit /b 1
)

echo ✅ セットアップが完了しました！
echo.
echo 📋 次のステップ:
echo 1. Automatic1111をセットアップ (docs\automatic1111-setup-guide.md を参照)
echo 2. 必要なモデルをダウンロード:
echo    - illustriousPencilXL_v200.safetensors (アニメ用)
echo    - beautifulRealistic_brav5.safetensors (リアル用)
echo 3. Automatic1111を起動: webui-user.bat --api --cors-allow-origins=http://localhost:3004
echo 4. MyWaifuAIを起動: npm run dev
echo.
echo 🌐 アクセス先:
echo - MyWaifuAI: http://localhost:3004
echo - Automatic1111: http://localhost:7860
echo.
echo 🎉 セットアップ完了！AI画像生成機能をお楽しみください！

pause
