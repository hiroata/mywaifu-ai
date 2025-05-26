# Automatic1111 Stable Diffusion セットアップガイド

MyWaifuAIのAI画像生成機能を使用するために、Automatic1111 Stable Diffusionをセットアップする手順を説明します。

## 前提条件

- Python 3.10.6以上
- Git
- NVIDIA GPU（推奨、CPUでも可能だが非常に遅い）
- 最低8GB RAM（GPU VRAM 4GB以上推奨）

## インストール手順

### 1. Automatic1111のクローン

```bash
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui
```

### 2. モデルのダウンロード

以下の2つのモデルをダウンロードして、`models/Stable-diffusion/`フォルダに配置してください：

#### アニメスタイル用モデル
- **illustriousPencilXL_v200.safetensors**
- ダウンロード先: [Hugging Face](https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0/tree/main)
- または [Civitai](https://civitai.com/models/795765)

#### リアリスティック用モデル
- **beautifulRealistic_brav5.safetensors**
- ダウンロード先: [Civitai](https://civitai.com/models/501240/beautiful-realistic-asians)

### 3. 起動スクリプトの設定

#### Windows (.bat)
`webui-user.bat`ファイルを編集：

```batch
@echo off

set PYTHON=
set GIT=
set VENV_DIR=
set COMMANDLINE_ARGS=--api --cors-allow-origins=http://localhost:3004 --xformers

call webui.bat
```

#### Linux/Mac (.sh)
`webui-user.sh`ファイルを編集：

```bash
#!/bin/bash

export COMMANDLINE_ARGS="--api --cors-allow-origins=http://localhost:3004 --xformers"

./webui.sh
```

### 4. Automatic1111の起動

#### Windows
```cmd
webui-user.bat
```

#### Linux/Mac
```bash
chmod +x webui-user.sh
./webui-user.sh
```

### 5. API設定の確認

起動後、以下のURLでAPIが利用可能か確認：
- WebUI: http://localhost:7860
- API docs: http://localhost:7860/docs

## 重要な設定オプション

### APIオプション
- `--api`: APIサーバーを有効化
- `--cors-allow-origins=http://localhost:3004`: CORSを許可
- `--xformers`: メモリ効率の向上（NVIDIA GPU）

### パフォーマンス向上
- `--medvram`: VRAM使用量を削減（6GB GPU）
- `--lowvram`: VRAM使用量をさらに削減（4GB GPU）
- `--precision full`: 高品質生成
- `--no-half`: 精度向上（遅くなる）

## モデル設定

### 1. WebUIでモデルを選択
1. http://localhost:7860 にアクセス
2. 左上の「Stable Diffusion checkpoint」でモデル選択
3. アニメ用: `illustriousPencilXL_v200.safetensors`
4. リアル用: `beautifulRealistic_brav5.safetensors`

### 2. 推奨設定
- **Steps**: 20-30
- **Sampler**: DPM++ 2M Karras
- **CFG Scale**: 7-12
- **Size**: 512x768 または 768x512

## MyWaifuAIとの連携

### 環境変数設定
`.env`ファイルに以下を設定：

```env
SD_API_URL=http://localhost:7860
```

### APIテスト

以下のコマンドでAPIテストが可能：

```bash
curl -X POST "http://localhost:7860/sdapi/v1/txt2img" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "beautiful anime girl, high quality",
    "steps": 20,
    "width": 512,
    "height": 768
  }'
```

## トラブルシューティング

### よくある問題

1. **モデルが見つからない**
   - `models/Stable-diffusion/`フォルダにモデルファイルが正しく配置されているか確認
   - ファイル名が正確か確認

2. **APIエラー**
   - `--api`オプションが設定されているか確認
   - CORSエラーの場合は`--cors-allow-origins`を確認

3. **メモリ不足**
   - `--medvram`または`--lowvram`オプションを追加
   - 生成サイズを小さくする

4. **生成が遅い**
   - GPU使用の確認
   - `--xformers`オプションの確認
   - より小さいモデルの使用を検討

### ログ確認

```bash
# Automatic1111のログ
tail -f webui.log

# MyWaifuAIのログ
npm run dev
```

## 使用方法

1. Automatic1111を起動
2. MyWaifuAIの開発サーバーを起動
3. ブラウザで http://localhost:3004 にアクセス
4. AI画像生成セクションでプロンプトを入力
5. スタイルを選択（アニメ/リアリスティック）
6. 「画像を生成」ボタンをクリック

## 注意事項

- 初回起動時は必要なパッケージのダウンロードで時間がかかります
- モデルファイルは大きいため（4-8GB）、十分なストレージ容量を確保してください
- 商用利用時はモデルのライセンスを確認してください
- 生成される画像の内容に注意し、適切なコンテンツフィルタリングを実装してください

## 参考リンク

- [Automatic1111 公式GitHub](https://github.com/AUTOMATIC1111/stable-diffusion-webui)
- [Stable Diffusion モデル Hub](https://huggingface.co/models?search=stable-diffusion)
- [Civitai - AI Art モデル](https://civitai.com/)
