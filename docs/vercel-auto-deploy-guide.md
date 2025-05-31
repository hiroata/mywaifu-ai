# Vercel 自動デプロイ設定ガイド

このガイドでは、MyWaifu AIプロジェクトをVercelに自動デプロイするための設定方法を説明します。

## 🚀 デプロイフロー
VSCode → git push → GitHub Actions → Vercel API → デプロイ完了

## 📋 前提条件
- ✅ Next.js プロジェクト (App Router対応)
- ✅ GitHub リポジトリ
- ✅ Vercel アカウント
- ✅ VSCode + Git 設定済み

## ⚙️ STEP 1: Vercel API設定

### 1-1. Vercel API Token取得
1. [Vercel Dashboard](https://vercel.com/account/tokens) にアクセス
2. 「Create Token」をクリック
3. Token Name: `GitHub Actions Deploy`
4. Scope: `Full Account`
5. 「Create」→ トークンをコピー

### 1-2. Vercel Project ID取得
1. Vercel Dashboard → 対象プロジェクト選択
2. Settings → General
3. Project ID をコピー

### 1-3. Vercel Org ID取得
1. Vercel Dashboard → Settings → General
2. Team ID をコピー

## 🔧 STEP 2: GitHub Secrets設定

### 2-1. GitHub Repository設定
1. GitHub リポジトリ → Settings
2. Secrets and variables → Actions
3. 「New repository secret」で以下を追加：

```
VERCEL_TOKEN = [STEP 1-1で取得したトークン]
VERCEL_PROJECT_ID = [STEP 1-2で取得したProject ID]
VERCEL_ORG_ID = [STEP 1-3で取得したOrg ID]
```

## 📁 STEP 3: 環境変数設定

### 3-1. Vercel環境変数設定
Vercel Dashboard → Settings → Environment Variables で以下を設定：

```bash
# 本番環境用
NODE_ENV=production
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
XAI_API_KEY=your-xai-api-key
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
```

## 🔄 STEP 4: 開発→デプロイフロー

### 4-1. 基本的な開発フロー
```bash
# VSCodeで開発
cd mywaifu-ai

# ローカル確認
npm run dev
# → http://localhost:3000 で確認

# 変更をコミット
git add .
git commit -m "feat: 新機能追加"

# プッシュ（GitHub Actions起動）
git push origin main
```

### 4-2. Pull Request フロー
```bash
# フィーチャーブランチ作成
git checkout -b feature/new-component

# 開発・コミット
git add .
git commit -m "feat: 新しいコンポーネント追加"

# プッシュ
git push origin feature/new-component

# GitHub でPull Request作成
# → プレビューデプロイが自動実行
# → コメントにプレビューURL表示

# レビュー完了後、mainにマージ
# → 本番デプロイが自動実行
```

## 📊 STEP 5: デプロイ確認

### 5-1. GitHub Actions確認
- GitHub Repository → Actions タブ
- ワークフロー実行状況を確認
- ログでビルド・デプロイ状況を確認

### 5-2. Vercel確認
- Vercel Dashboard → Deployments
- デプロイ状況を確認
- 本番URLで動作確認

## 🛠️ STEP 6: プロジェクト固有設定

### 6-1. カスタムサーバー対応
このプロジェクトはWebSocket対応のため、以下のスクリプトを使用：

```json
{
  "scripts": {
    "build": "cross-env NODE_OPTIONS=\"--max-old-space-size=4096\" next build",
    "start": "node server-websocket.js",
    "start:production": "cross-env NODE_ENV=production node server-websocket.js"
  }
}
```

### 6-2. AI API統合
- OpenAI API
- Google Gemini API  
- xAI API
- 画像生成API (Stable Diffusion)

## 🆘 トラブルシューティング

### ❌ GitHub Actions失敗
**症状**: npm run build でエラー
**解決法**:
```bash
# ローカルで確認
npm run build

# エラーがあれば修正してプッシュ
git add .
git commit -m "fix: ビルドエラー修正"
git push origin main
```

### ❌ Vercel API エラー
**症状**: Error: Invalid token
**解決法**:
1. Vercel Tokenを再生成
2. GitHub Secretsを更新
3. 再実行

### ❌ デプロイ成功でも404
**症状**: デプロイ成功だがページが404
**解決法**:
- `next.config.js`のルーティング設定確認
- `vercel.json`のrewrites設定確認

## ✅ チェックリスト

### 初回設定
- [ ] Vercel API Token取得・設定済み
- [ ] GitHub Secrets設定済み
- [ ] `.github/workflows/deploy.yml` 作成済み
- [ ] `vercel.json` 設定済み
- [ ] 環境変数設定済み

### 毎回のデプロイ前
- [ ] ローカルで `npm run build` が成功する
- [ ] `npm run dev` でローカル動作確認済み
- [ ] lint エラーなし（`npm run lint`）
- [ ] TypeScript エラーなし（`npm run type-check`）
- [ ] テスト通過（`npm test`）

### デプロイ後
- [ ] GitHub Actions が成功
- [ ] Vercel デプロイが成功
- [ ] 本番URLで動作確認
- [ ] モバイル表示確認
- [ ] AI機能動作確認

## 🎯 まとめ

3ステップでNext.js自動デプロイ完成:
1. **設定**: Vercel API + GitHub Secrets
2. **ワークフロー**: `.github/workflows/deploy.yml`
3. **開発**: VSCode → git push → 自動デプロイ

**メリット**:
- ✅ 完全自動化: プッシュするだけ
- ✅ プレビュー機能: PR毎にプレビューURL生成
- ✅ 本番安全: mainブランチのみ本番デプロイ
- ✅ Next.js最適化: フレームワーク特化設定
- ✅ AI統合: API設定自動化

これで開発に集中し、プッシュするだけで本番環境が更新されます！
