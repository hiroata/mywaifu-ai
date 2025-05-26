#!/bin/bash

# ========================================
# ClamAV マルウェアスキャン設定スクリプト
# ========================================

echo "🦠 ClamAV マルウェアスキャン設定を開始します..."

# システム更新
echo "📦 システムパッケージを更新中..."
sudo apt-get update

# ClamAVインストール
echo "⬇️ ClamAVをインストール中..."
sudo apt-get install -y clamav clamav-daemon clamav-freshclam

# ウイルス定義データベースを更新
echo "🔄 ウイルス定義データベースを更新中..."
sudo freshclam

# ClamAVデーモンを開始
echo "🚀 ClamAVデーモンを開始中..."
sudo systemctl start clamav-daemon
sudo systemctl enable clamav-daemon

# 自動更新設定
echo "⚙️ 自動更新を設定中..."
sudo systemctl start clamav-freshclam
sudo systemctl enable clamav-freshclam

# 設定確認
echo "✅ ClamAV設定確認..."
sudo systemctl status clamav-daemon
sudo systemctl status clamav-freshclam

# ClamAV接続テスト
echo "🔗 ClamAV接続テスト..."
sudo clamdscan --version

echo "✅ ClamAV設定が完了しました！"
echo "📝 注意: Render.comなどのクラウドサービスでは、別途ClamAVサービスの設定が必要です。"
