# MyWaifuAI - AI Waifu Chat Platform

MyWaifuAIは、ユーザーがカスタムAIキャラクターと会話できるプラットフォームです。画像生成、音声チャット、パーソナライズされたキャラクター作成機能を提供します。

## 🚀 新しいアーキテクチャ

このプロジェクトは、データベース依存からメモリ内ストレージシステムに移行しました。これにより、セットアップが簡単になり、開発が高速化されます。

### 主要な変更点

- **Prisma → メモリ内ストレージ**: データベースの代わりにメモリ内ストレージシステムを使用
- **簡素化された認証**: NextAuthの代わりにヘッダーベースの認証
- **ファイルベース永続化**: JSONファイルでデータを永続化

## 🛠️ セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# API Keys
OPENAI_API_KEY=your_openai_api_key
STABILITY_API_KEY=your_stability_api_key
HUGGING_FACE_API_KEY=your_hugging_face_api_key

# Stripe (決済処理)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PREMIUM_PRICE_ID=your_premium_price_id
STRIPE_ULTIMATE_PRICE_ID=your_ultimate_price_id
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# アプリケーション設定
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000

# ストレージ設定
STORAGE_PATH=./data
```

### 3. アプリケーションの起動

```bash
npm run dev
```

アプリケーションは `http://localhost:3000` で起動します。

## 📁 プロジェクト構造

```
src/
├── app/
│   └── api/                    # API routes
│       ├── content/           # キャラクター管理API
│       └── generate/          # 画像生成API
├── lib/
│   ├── storage/              # メモリ内ストレージシステム
│   ├── services/             # ビジネスロジック
│   ├── security/             # セキュリティ機能
│   ├── ai/                   # AI統合
│   ├── stable-diffusion.ts   # 画像生成
│   ├── stripe.ts             # 決済処理
│   └── utils/                # ユーティリティ
└── __tests__/                # テストファイル
```

## 🔧 主要機能

### 1. ストレージシステム

メモリ内ストレージシステムは以下の機能を提供します：

- **ユーザー管理**: 登録、認証、プロフィール管理
- **キャラクター管理**: AI キャラクターの作成・編集・削除
- **サブスクリプション管理**: プラン管理、制限チェック
- **ログ管理**: セキュリティログ、生成ログの記録
- **ファイル永続化**: JSONファイルでのデータ保存

### 2. 画像生成サービス

```typescript
import imageGenerationService from '@/lib/services/imageGenerator';

const result = await imageGenerationService.generateImage({
  prompt: "beautiful anime girl",
  userId: "user-id",
  style: "anime"
});
```

### 3. セキュリティ機能

- レート制限
- 不適切コンテンツフィルタリング
- セキュリティイベントログ
- ファイルアップロード検証

### 4. 決済統合（Stripe）

```typescript
import { createCheckoutSession } from '@/lib/stripe';

const session = await createCheckoutSession({
  userId: "user-id",
  planId: "PREMIUM",
  returnUrl: "http://localhost:3000"
});
```

## 🧪 テスト

```bash
# 全テスト実行
npm test

# 特定のテストファイル実行
npm test imageGenerator.test.ts

# カバレッジ付きテスト実行
npm run test:coverage
```

## 📦 本番環境へのデプロイ

### Vercel

```bash
# Vercel CLIをインストール
npm i -g vercel

# デプロイ
vercel --prod
```

### 環境変数の設定

本番環境では以下の環境変数を必ず設定してください：

- `OPENAI_API_KEY`
- `STABILITY_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXTAUTH_SECRET`

## 🔒 セキュリティ考慮事項

1. **API キーの保護**: 環境変数を使用してAPI キーを保護
2. **レート制限**: 各エンドポイントにレート制限を実装
3. **入力検証**: ユーザー入力の適切な検証
4. **認証**: ヘッダーベースの認証システム
5. **ログ監視**: セキュリティイベントの記録と監視

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを開く

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は `LICENSE` ファイルをご覧ください。

## 🆘 トラブルシューティング

### よくある問題

1. **メモリ不足エラー**
   - Node.jsのメモリ制限を増やす: `node --max-old-space-size=4096`

2. **画像生成エラー**
   - Stability AI API キーが正しく設定されているか確認
   - API制限に達していないか確認

3. **認証エラー**
   - `x-user-id` ヘッダーが正しく設定されているか確認

### サポート

問題が発生した場合は、GitHubのIssuesセクションで報告してください。

## 🚀 今後の機能

- [ ] リアルタイム音声チャット
- [ ] より高度なAIパーソナリティ
- [ ] モバイルアプリ
- [ ] ソーシャル機能の拡張
- [ ] マルチプレイヤー機能

---

**注意**: このプロジェクトは開発目的であり、本番環境で使用する前に適切なセキュリティレビューを行ってください。
