# デプロイガイド

## 概要

このプロジェクトはロリポップサーバーでNode.jsアプリケーションとして動作します。

## GitHub Actionsによる自動デプロイ
[.github/workflows/deploy.yml](.github/workflows/deploy.yml)で設定済み

### 必要なSecrets
- SSH_HOST
- SSH_USERNAME  
- SSH_PASSWORD
- SSH_PORT
- SSH_DEPLOY_PATH
- NEXTAUTH_SECRET
- DATABASE_URL
- XAI_API_KEY
- GEMINI_API_KEY

## 手動デプロイ手順
1. `npm run build`
2. ファイルをサーバーにアップロード
3. `pm2 restart ecosystem.config.js`

## トラブルシューティング

### 403エラーの対処法
1. `.htaccess`ファイルの確認
   ```
   # 適切な.htaccess設定
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.php [L]
   </IfModule>
   ```

2. ファイルパーミッションの設定
   ```bash
   chmod -R 755 public/
   chmod -R 755 .next/
   chmod 644 .htaccess
   chmod 644 public/.htaccess
   ```

3. PM2プロセスの再起動
   ```bash
   pm2 stop all
   pm2 start ecosystem.config.js
   ```

### ロリポップ固有の設定

#### Node.jsバージョン確認
```bash
node -v
npm -v
```

#### PM2の設定確認
```bash
pm2 status
pm2 logs
```

#### ログファイルの確認方法
```bash
cat server.log
tail -f server.log
```

#### プロセス管理
```bash
# 実行中のプロセスを確認
ps aux | grep node

# プロセスを停止
if [ -f "server.pid" ]; then
  kill $(cat server.pid)
fi
```

#### ファイル構造の確認
- `public/index.html` → リダイレクト用
- `public/index.php` → Node.jsへのプロキシ
- `.htaccess` → URL書き換えルール
- `ecosystem.config.js` → PM2設定
- `server.js` → カスタムNode.jsサーバー
