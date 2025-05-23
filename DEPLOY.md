# GitHub Actionsによる自動デプロイ設定

このプロジェクトは、GitHub Actionsを使用してロリポップのサーバーに自動デプロイするように設定されています。
カスタムドメイン（shakedude.com）を使用する構成になっています。
以下の手順で設定を行ってください。

## 1. GitHubリポジトリのSecretsを設定

GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」から以下のシークレットを追加してください：

- `FTP_PASSWORD`: ロリポップのFTPパスワード
- `NEXTAUTH_SECRET`: NextAuth.jsで使用する秘密鍵
- `NEXTAUTH_URL`: 本番環境のURL（https://shakedude.com）
- `GOOGLE_CLIENT_ID`: GoogleのOAuth Client ID
- `GOOGLE_CLIENT_SECRET`: GoogleのOAuth Client Secret
- `DATABASE_URL`: データベースの接続URL
- `XAI_API_KEY`: xAI (Grok) のAPIキー
- `GEMINI_API_KEY`: Google Gemini のAPIキー

## 2. Googleの認証設定を更新

Google Cloud ConsoleでOAuthアプリケーションの設定を開き、以下の承認済みリダイレクトURIを追加してください：

```
https://shakedude.com/api/auth/callback/google
```

## 3. ロリポップサーバーでの初期設定

初回デプロイ後、以下の設定を行ってください：

1. ロリポップのコントロールパネルからNode.jsを有効化
2. 初回のデータベースマイグレーションを実行：
   ```bash
   npx prisma migrate deploy
   ```
3. カスタムドメイン(shakedude.com)の設定：
   - ロリポップの管理画面から「ドメイン/SSL」→「独自ドメイン設定」を開く
   - shakedude.comをロリポップアカウントに紐付ける
   - DNSレコードを設定（ドメイン管理会社のコントロールパネルで設定）
     - Aレコード: @ → ロリポップのIPアドレス
     - CNAMEレコード: www → ロリポップのサブドメイン

4. SSL証明書の設定：
   - ロリポップの管理画面から「ドメイン/SSL」→「SSL証明書設定」を開く
   - shakedude.comに対してSSL証明書を発行

## 4. デプロイの確認

GitHub Actionsのワークフローが成功したら、以下のURLにアクセスしてアプリケーションが正常に動作していることを確認してください：

```
https://shakedude.com
```
