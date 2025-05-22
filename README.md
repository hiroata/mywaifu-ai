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

## ライセンス

本プロジェクトは非公開プロジェクトであり、権利は所有者に帰属します。
