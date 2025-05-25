# MyWaifuAI - 日本人(実写)と日本人(アニメ)キャラクターに特化したAIコンパニオンサービス

## プロジェクト概要

MyWaifuAI（マイワイフAI）は、日本人キャラクターに特化したAIコンパニオンサービスのWebアプリケーションです。
ユーザーは様々なキャラクターとテキスト、音声、画像を通じてコミュニケーションを取ることができます。

### 主な機能

- 日本人（実写）および日本人風アニメキャラクターとのチャット会話
- カスタムキャラクターの作成と編集
- 画像生成機能（会話の中で画像を生成）
- 音声合成機能（キャラクターの声での会話）
- プレミアム会員向けの追加機能

## 技術スタック

- **フロントエンド**: TypeScript + Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **バックエンド**: Next.js API Routes + Server Actions
- **データベース**: MySQL + Prisma ORM
- **認証**: NextAuth.js
- **状態管理**: Zustand + React Context API
- **API通信**: TanStack Query
- **フォーム**: React Hook Form + Zod
- **AI連携**:
  - OpenAI API (GPT-4o)
  - xAI API (Grok 3)
  - Stable Diffusion API
  - ElevenLabs API
- **決済処理**: Stripe

## セットアップ手順

### 必要条件

- Node.js 18.0.0以上
- MySQL 8.0以上
- Docker (オプション、開発環境用)

### 環境変数の設定

`.env.example`ファイルを`.env`にコピーし、以下の環境変数を設定してください：

```
# データベース設定
DATABASE_URL="mysql://user:password@localhost:3306/mywaifu_ai"

# NextAuth設定
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
TWITTER_CLIENT_ID="your-twitter-client-id"
TWITTER_CLIENT_SECRET="your-twitter-client-secret"

# OpenAI API
OPENAI_API_KEY="your-openai-api-key"

# xAI API (Grok)
XAI_API_KEY="your-xai-api-key"
XAI_API_URL="https://api.grok.x.ai/v1" # デフォルトのAPI URL

# Stable Diffusion API
STABLE_DIFFUSION_API_URL="your-stable-diffusion-api-url"
STABLE_DIFFUSION_API_KEY="your-stable-diffusion-api-key"

# ElevenLabs API
ELEVENLABS_API_KEY="your-elevenlabs-api-key"

# Stripe API
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
STRIPE_PREMIUM_PRICE_ID="price_xxxx"
STRIPE_ULTIMATE_PRICE_ID="price_xxxx"
```

### インストールと実行

1. 依存関係のインストール：

   ```bash
   npm install
   ```

2. Prismaクライアントの生成：

   ```bash
   npm run prisma:generate
   ```

3. データベースのマイグレーション：

   ```bash
   npm run prisma:push
   ```

4. 初期データの投入：

   ```bash
   npm run seed
   ```

5. 開発サーバーの起動：

   ```bash
   npm run dev
   ```

6. ブラウザで http://localhost:3000 へアクセス

### Dockerを使用した開発環境

```bash
docker-compose -f docker/docker-compose.yml up -d
```

## デプロイ

### ロリポップサーバーへのデプロイ

1. ビルド：

   ```bash
   npm run build
   ```

2. デプロイスクリプトの実行：
   ```bash
   npm run deploy
   ```

### Render デプロイ設定 ✅
このプロジェクトは **Render** での自動デプロイが設定済みです。

#### 設定済み項目
- ✅ `render.yaml` - Render公式仕様準拠
- ✅ `.github/workflows/deploy.yml` - GitHub Actions自動デプロイ
- ✅ `package.json` - ビルドスクリプト最適化
- ✅ socket.io依存関係追加
- ✅ Prisma migrate deploy設定

#### デプロイフロー
1. `main`ブランチにpush
2. GitHub Actionsが自動実行
3. Prisma migrationsとビルドを実行
4. RenderのDeploy Hookをトリガー
5. 本番環境に自動デプロイ

#### 必要なSecrets（GitHub Settings > Secrets）
- `DATABASE_URL` - RenderのPostgreSQLデータベースURL
- `RENDER_DEPLOY_HOOK_URL` - RenderのDeploy Hook URL
- `NEXTAUTH_SECRET` - NextAuth.jsのシークレット
- `NEXTAUTH_URL` - 本番環境URL (https://mywaifu-ai.onrender.com)
- その他API Keys（Google OAuth、AI Providers等）

詳細は [`docs/github-actions-deploy-guide.md`](docs/github-actions-deploy-guide.md) を参照してください。

## プロジェクト構造

```
mywaifu-ai/
├── prisma/                  # Prismaスキーマとマイグレーション
├── public/                  # 静的ファイル
│   ├── assets/              # 画像やアイコン
│   ├── uploads/             # アップロードされたファイル
│   └── locales/             # 多言語化ファイル
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # Reactコンポーネント
│   ├── hooks/               # カスタムReactフック
│   ├── lib/                 # ユーティリティ関数
│   ├── server/              # サーバーサイド専用コード
│   ├── store/               # Zustandストア
│   └── types/               # 型定義
└── scripts/                 # ユーティリティスクリプト
```

## サブスクリプションプラン

- **無料プラン**: 基本機能を利用可能

  - プリセットキャラクターとの会話
  - 1日5回までのAI会話
  - テキストチャットのみ

- **プレミアムプラン** (月額980円):

  - カスタムキャラクターの作成（最大3体）
  - 1日50回までのAI会話
  - 音声チャット機能
  - 優先サポート

- **アルティメットプラン** (月額1980円):
  - 無制限のカスタムキャラクター作成
  - 無制限のAI会話
  - 音声・画像生成機能
  - VIP優先サポート
  - 最新機能への早期アクセス

## Google OAuth認証の設定方法

Google OAuthを使った認証機能を追加するためには、以下の手順に従ってください：

1. Google Cloud Consoleにアクセスする：

   - [Google Cloud Console](https://console.cloud.google.com/)にアクセスし、アカウントでログインします。

2. プロジェクトを作成する：

   - 「新しいプロジェクト」を作成します。
   - プロジェクト名を入力し、「作成」をクリックします。

3. OAuth同意画面を設定する：

   - 左側のナビゲーションから「APIとサービス」>「OAuth同意画面」を選択します。
   - ユーザータイプ（「外部」または「内部」）を選択し、「作成」をクリックします。
   - アプリ名、ユーザーサポートメール、デベロッパーの連絡先情報を入力します。
   - 「保存して次へ」をクリックします。
   - スコープセクションでは、デフォルトのスコープのまま「保存して次へ」をクリックします。
   - テストユーザーを追加し、「保存して次へ」をクリックします。
   - 概要を確認し、「ダッシュボードに戻る」をクリックします。

4. 認証情報を作成する：

   - 左側のナビゲーションから「APIとサービス」>「認証情報」を選択します。
   - 「認証情報を作成」をクリックし、「OAuthクライアントID」を選択します。
   - アプリケーションの種類として「ウェブアプリケーション」を選択します。
   - 任意の名前を入力します。
   - 「承認済みリダイレクトURI」に以下を追加します：

     ```bash
     http://localhost:3000/api/auth/callback/google
     https://your-production-domain.com/api/auth/callback/google
     ```

   - 「作成」をクリックします。

5. クライアントIDとクライアントシークレットをコピーする：

   - 表示されたクライアントIDとクライアントシークレットをコピーします。

6. 環境変数を設定する：

   - `.env`ファイルに以下の環境変数を追加します：

     ```bash
     GOOGLE_CLIENT_ID="コピーしたクライアントID"
     GOOGLE_CLIENT_SECRET="コピーしたクライアントシークレット"
     ```

これで、アプリケーションでGoogleを使った認証が可能になります。開発サーバーを再起動して、ログインページからGoogle認証を試してみてください。

## ライセンス

本プロジェクトは非公開プロジェクトであり、権利は所有者に帰属します。
