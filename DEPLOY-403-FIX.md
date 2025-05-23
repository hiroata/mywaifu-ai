# 403エラー対応のためのデプロイ変更点

## 主な変更点

1. **カスタムサーバー対応**
   - `server.js` ファイルの追加：Node.jsアプリケーションを直接起動するためのカスタムサーバースクリプト
   - `package.json`に新しい起動スクリプトを追加：`start:custom`と`start:production`

2. **PM2設定の最適化**
   - `ecosystem.config.js`をJavaScript形式に修正
   - PM2の設定をカスタムサーバーを使用するように変更

3. **.htaccessの改善**
   - Next.jsルーティングの最適化
   - index.phpへのリダイレクト設定

4. **PHPプロキシの追加**
   - `public/index.php`ファイルを追加：PHPからNode.jsアプリへのプロキシ
   - ロリポップサーバーでのPHPとNode.jsの連携を可能に

5. **GitHub Actionsワークフローの改善**
   - デプロイファイルに`server.js`と`ecosystem.config.js`を追加
   - PM2を使用してサーバー上でアプリを再起動するステップの追加

## デプロイ手順

### 1. 新しいデプロイが完了したら、サーバーで以下を確認

```bash
# サーバーにSSHでログイン
ssh $SSH_USERNAME@$SSH_HOST -p $SSH_PORT

# デプロイディレクトリに移動
cd $SSH_DEPLOY_PATH

# PM2の状態を確認
pm2 status

# ログを確認（エラーがあれば）
pm2 logs
```

### 2. エラーが発生した場合の対処法

- PM2が起動していない場合：
  ```bash
  npm install -g pm2
  pm2 start ecosystem.config.js
  ```

- 必要なモジュールがない場合：
  ```bash
  npm ci --production
  ```

- パーミッションエラーの場合：
  ```bash
  chmod 755 server.js
  chmod -R 755 .next
  chmod -R 755 public
  ```

### 3. アクセス確認

デプロイ後、以下のURLにアクセスしてアプリケーションが正常に動作していることを確認してください：

```
https://shakedude.com
```
