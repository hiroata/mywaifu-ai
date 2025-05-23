# ロリポップサーバーでのNode.js実行ガイド

このドキュメントは、ロリポップサーバーでのNode.jsアプリケーション実行に関する情報を提供します。

## 1. エラー対応

GitHub Actionsからのデプロイで`npm: command not found`や`pm2: command not found`エラーが発生した場合は、以下の解決策を試してください。

### ロリポップでのNode.js設定

1. **コントロールパネルからNode.jsを有効化**:
   - ロリポップのコントロールパネルで「Node.js」の設定を開き、有効化

2. **SSHでの手動設定確認**:
   ```bash
   ssh main.jp-3385b51a75b81a95@ssh.lolipop.jp -p 2222
   cd /home/users/2/main.jp-3385b51a75b81a95/web/shakedude
   chmod +x start-server.sh
   ./start-server.sh
   ```

3. **Node.jsのパスとバージョンを確認**:
   ```bash
   which node
   node -v
   which npm
   npm -v
   ```

## 2. 手動での起動

サーバーにSSHで接続してアプリケーションを手動で起動する方法:

```bash
cd /home/users/2/main.jp-3385b51a75b81a95/web/shakedude
chmod +x start-server.sh
./start-server.sh
```

## 3. アプリケーションログの確認

アプリケーションのログを確認する方法:

```bash
cd /home/users/2/main.jp-3385b51a75b81a95/web/shakedude
cat server.log
# または最新のログを表示
tail -f server.log
```

## 4. プロセス管理

実行中のプロセスを確認する方法:

```bash
ps aux | grep node
```

プロセスを停止する方法:

```bash
# PIDファイルからプロセスIDを取得して停止
if [ -f "server.pid" ]; then
  kill $(cat server.pid)
fi
```

## 5. 一般的なトラブルシューティング

1. **403エラー**:
   - `.htaccess`ファイルの設定が正しいか確認
   - サーバー上でファイルのパーミッションを確認（755または644）

2. **502エラー (Bad Gateway)**:
   - Node.jsサーバーが実行されているか確認
   - `server.log`ファイルでエラーを確認

3. **ファイルが見つからないエラー**:
   - デプロイされたファイルが正しいディレクトリにあるか確認
   - サーバー上で`ls -la`コマンドを実行してファイル一覧を表示
