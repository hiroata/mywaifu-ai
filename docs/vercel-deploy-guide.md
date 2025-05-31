# VSCode → GitHub Actions → Vercel 自動デプロイマニュアル (Next.js)

## 🚀 デプロイフロー
VSCode → git push → GitHub Actions → Vercel API → デプロイ完了

## 📋 前提条件
- Next.js プロジェクト (App Router / Pages Router)
- GitHub リポジトリ
- Vercel アカウント
- VSCode + Git 設定済み

## ⚙️ STEP 1: Vercel API設定

### 1-1. Vercel API Token取得
1. Vercel Dashboard: https://vercel.com/account/tokens
2. 「Create Token」 をクリック
3. Token Name: `GitHub Actions Deploy`
4. Scope: `Full Account`
5. 「Create」 → トークンをコピー

### 1-2. Vercel Project ID取得
1. Vercel Dashboard → 対象プロジェクト
2. Settings → General
3. Project ID をコピー

### 1-3. Vercel Org ID取得
1. Vercel Dashboard → Settings → General
2. Team ID をコピー

## 🔧 STEP 2: GitHub Secrets設定

### 2-1. GitHub Repository設定
1. GitHub リポジトリ → Settings
2. Secrets and variables → Actions
3. 「New repository secret」 で以下を追加：

```
VERCEL_TOKEN = [STEP 1-1で取得したトークン]
VERCEL_PROJECT_ID = [STEP 1-2で取得したProject ID]
VERCEL_ORG_ID = [STEP 1-3で取得したOrg ID]
```

### 2-2. 環境変数Secrets
アプリケーションで使用する環境変数も追加：
```
DATABASE_URL = [データベース接続文字列]
NEXTAUTH_SECRET = [認証用シークレット]
NEXTAUTH_URL = [本番環境URL]
GOOGLE_CLIENT_ID = [Google OAuth ID]
GOOGLE_CLIENT_SECRET = [Google OAuth Secret]
XAI_API_KEY = [xAI API Key]
GEMINI_API_KEY = [Gemini API Key]
```

## 📁 STEP 3: GitHub Actions設定済み

プロジェクトルートの `.github/workflows/deploy.yml` が既に設定済みです：

- **mainブランチプッシュ**: 本番デプロイ
- **Pull Request**: プレビューデプロイ
- **自動コメント**: PRにプレビューURL通知

## 🔄 STEP 4: 開発→デプロイフロー

### 4-1. 基本的な開発フロー
```bash
# VSCodeで開発
cd your-nextjs-project

# ファイル編集
# pages/, app/, components/ などを編集

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
1. GitHub Repository → Actions タブ
2. ワークフロー実行状況を確認
3. ログでビルド・デプロイ状況を確認

### 5-2. Vercel確認
1. Vercel Dashboard → Deployments
2. デプロイ状況を確認
3. 本番URLで動作確認

## 🛠️ STEP 6: Next.js固有設定

### 6-1. next.config.js（既存設定）
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel最適化設定
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: ['example.com'], // 外部画像ドメイン
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // 本番最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
```

### 6-2. Vercel環境変数設定
Vercel Dashboard → Settings → Environment Variables で以下を設定：
```
NODE_ENV=production
NEXTAUTH_SECRET=your-secret
DATABASE_URL=your-database-url
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 🆘 トラブルシューティング

### よくある問題と解決法

#### ❌ GitHub Actions失敗
**症状**: npm run build でエラー  
**解決**:
```bash
# ローカルで確認
npm run build

# エラーがあれば修正してプッシュ
git add .
git commit -m "fix: ビルドエラー修正"
git push origin main
```

#### ❌ Vercel API エラー
**症状**: Error: Invalid token  
**解決**:
1. Vercel Tokenを再生成
2. GitHub Secretsを更新
3. 再実行

#### ❌ デプロイ成功でも404
**症状**: デプロイ成功だがページが404  
**解決**:
```js
// next.config.js
module.exports = {
  trailingSlash: true, // 必要に応じて
  basePath: '', // サブパスの場合設定
}
```

### デバッグ方法
- **GitHub Actions Logs**: Actions → 失敗したワークフロー → ログ確認
- **Vercel Function Logs**: Vercel Dashboard → Functions → Logs
- **ローカルビルド**: `npm run build` でローカル確認

## ✅ チェックリスト

### 初回設定
- [ ] Vercel API Token取得・設定済み
- [ ] GitHub Secrets設定済み
- [ ] `.github/workflows/deploy.yml` 設定済み
- [ ] `package.json` にbuildスクリプト設定済み

### 毎回のデプロイ前
- [ ] ローカルで `npm run build` が成功する
- [ ] `npm run dev` でローカル動作確認済み
- [ ] lint エラーなし（`npm run lint`）
- [ ] TypeScript エラーなし（使用する場合）

### デプロイ後
- [ ] GitHub Actions が成功
- [ ] Vercel デプロイが成功
- [ ] 本番URLで動作確認
- [ ] モバイル表示確認

## 🎯 まとめ

**3ステップでNext.js自動デプロイ完成**:
1. **設定**: Vercel API + GitHub Secrets
2. **ワークフロー**: `.github/workflows/deploy.yml`
3. **開発**: VSCode → git push → 自動デプロイ

**メリット**:
- **完全自動化**: プッシュするだけ
- **プレビュー機能**: PR毎にプレビューURL生成
- **本番安全**: mainブランチのみ本番デプロイ
- **Next.js最適化**: フレームワーク特化設定

これで開発に集中し、プッシュするだけで本番環境が更新されます！
