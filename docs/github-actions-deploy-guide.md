# GitHub Actions + Render 自動デプロイ設定ガイド

## 概要
このガイドでは、GitHub Actions を使用して MyWaifuAI アプリケーションを Render に自動デプロイする設定方法を説明します。

## 📋 前提条件
- GitHub リポジトリ: `hiroata/mywaifu-ai`
- Render アカウントとサービスの作成済み
- Node.js 20 対応
- Next.js 14 + TypeScript + Prisma 構成

## 🔧 GitHub Secrets 設定

### 必須 Secrets
GitHub リポジトリの Settings > Secrets and variables > Actions で以下を設定：

#### 1. Render デプロイ関連
```
RENDER_DEPLOY_HOOK_URL
- 値: https://api.render.com/deploy/srv-xxxxxxxxxxxxx?key=yyyyyyyyyyy
- 取得方法: Render Dashboard > Service > Settings > Deploy Hook
```

```
RENDER_SERVICE_ID
- 値: srv-xxxxxxxxxxxxx
- 取得方法: Render Dashboard > Service > Settings で確認
```

```
RENDER_API_KEY
- 値: rnd_xxxxxxxxxxxxxxxxx
- 取得方法: Render Dashboard > Account Settings > API Keys
```

#### 2. アプリケーション設定
```
NEXTAUTH_URL
- 値: https://your-app-name.onrender.com
- 説明: デプロイ後のアプリケーションURL
```

```
NEXTAUTH_SECRET
- 値: ランダムな長い文字列
- 生成方法: openssl rand -base64 32
```

#### 3. データベース
```
DATABASE_URL
- 値: postgresql://username:password@host:port/database
- 取得方法: Render PostgreSQL インスタンスの接続情報
```

#### 4. API Keys（必要に応じて）
```
XAI_API_KEY
GEMINI_API_KEY
OPENAI_API_KEY
ELEVENLABS_API_KEY
STABLE_DIFFUSION_API_KEY
```

## 🚀 Render サービス設定

### Web Service 設定
```yaml
# render.yaml (既存ファイル使用)
services:
  - type: web
    name: mywaifu-ai
    env: node
    plan: starter  # または適切なプラン
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: mywaifu-ai-db
          property: connectionString
      # その他の環境変数...
```

### PostgreSQL データベース設定
```yaml
databases:
  - name: mywaifu-ai-db
    plan: starter  # または適切なプラン
```

## 📝 ワークフロー詳細

### トリガー条件
- `main` ブランチへの push
- 手動実行（workflow_dispatch）

### 実行フロー
1. **Test & Build Job**
   - 依存関係インストール
   - Prisma クライアント生成
   - ESLint 実行
   - TypeScript 型チェック
   - テスト実行（存在する場合）
   - アプリケーションビルド

2. **Deploy Job**
   - Deploy Hook による主要デプロイ
   - API による代替デプロイ（フォールバック）
   - デプロイ完了待機

3. **Notify Job**
   - デプロイ結果通知
   - サマリー生成

## 🔍 トラブルシューティング

### よくある問題と解決方法

#### 1. ビルドエラー
```bash
# 問題: 依存関係の競合
解決策: package.json の dependencies 確認

# 問題: TypeScript エラー
解決策: npm run type-check でローカル確認
```

#### 2. デプロイエラー
```bash
# 問題: Deploy Hook が 404
解決策: RENDER_DEPLOY_HOOK_URL の再確認

# 問題: API キーが無効
解決策: RENDER_API_KEY の再生成
```

#### 3. 環境変数エラー
```bash
# 問題: DATABASE_URL が無効
解決策: PostgreSQL 接続文字列の確認

# 問題: NEXTAUTH_SECRET が未設定
解決策: ランダム文字列の生成と設定
```

#### 4. タイムアウトエラー
```bash
# 問題: デプロイが10分を超過
解決策: 
- ビルド最適化
- 依存関係の削減
- Render プランのアップグレード
```

### デバッグ方法

#### 1. ローカルテスト
```bash
# 本番環境と同じビルドをテスト
npm ci
npx prisma generate
npm run build

# 型チェック
npm run type-check

# リント
npm run lint
```

#### 2. Render ログ確認
```bash
# Render Dashboard での確認項目:
- Build Logs
- Deploy Logs
- Service Logs
- Environment Variables
```

#### 3. GitHub Actions ログ
```bash
# 確認項目:
- Job の実行時間
- エラーメッセージ
- 環境変数の設定状況
- API レスポンス
```

## 📊 監視とメンテナンス

### ヘルスチェック
- エンドポイント: `/api/health`
- 自動チェック: デプロイ後 30 秒待機して確認
- タイムアウト: 5 分（10 回リトライ）

### ログ監視
- GitHub Actions: ワークフロー実行履歴
- Render: サービスログとメトリクス
- アプリケーション: 独自のロギング

### 定期メンテナンス
- 依存関係の更新
- Secrets の定期ローテーション
- ログの確認と分析

## 🔐 セキュリティ考慮事項

### Secrets 管理
- API キーの定期ローテーション
- 最小権限の原則
- 環境別の分離

### アクセス制御
- GitHub リポジトリのアクセス権限
- Render アカウントの権限設定
- 本番環境のアクセス制限

## 📚 参考リンク

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Render Deployment Guide](https://render.com/docs/deploys)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Production Guide](https://www.prisma.io/docs/guides/deployment/production)

## 📞 サポート

問題が発生した場合:
1. このドキュメントのトラブルシューティングを確認
2. GitHub Actions のログを確認
3. Render のログを確認
4. 必要に応じて GitHub Issue を作成
