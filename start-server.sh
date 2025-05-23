#!/bin/bash
# ロリポップサーバー用のNode.js起動スクリプト
# このスクリプトは$SSH_DEPLOY_PATHディレクトリに配置されます

# ログファイルの設定
LOG_FILE="server.log"
PID_FILE="server.pid"

# 環境変数の設定
export NODE_ENV=production
export PORT=3000

# nvmの読み込み（存在する場合）
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# ロリポップでNode.jsを有効化（存在する場合）
if [ -f "/usr/local/bin/nodejs_startup.sh" ]; then
  source /usr/local/bin/nodejs_startup.sh
fi

# 実行中のサーバープロセスを停止
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if ps -p "$OLD_PID" > /dev/null; then
    echo "Stopping existing server process (PID: $OLD_PID)"
    kill "$OLD_PID"
    sleep 2
  fi
  rm "$PID_FILE"
fi

# サーバーの起動
echo "Starting Node.js server..."
echo "Using Node.js: $(which node 2>/dev/null || echo 'Not found')"
echo "Node.js version: $(node -v 2>/dev/null || echo 'Not available')"

# ノーハップでサーバーを起動し、PIDを保存
nohup node server.js > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
echo "Server started with PID: $(cat "$PID_FILE")"

# 最初のログ行を表示
echo "Server log started:"
tail -n 5 "$LOG_FILE"
