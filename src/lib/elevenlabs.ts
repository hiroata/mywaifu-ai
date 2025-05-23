// src/lib/elevenlabs.ts
import { config } from "./config";
import { saveFile } from "./utils/file-utils";

const { apiKey, baseUrl } = config.api.elevenlabs;

interface GenerateVoiceOptions {
  text: string;
  voiceId: string;
  stability?: number;
  similarity?: number;
}

export async function generateVoice({
  text,
  voiceId,
  stability = 0.5,
  similarity = 0.75,
}: GenerateVoiceOptions): Promise<string> {
  try {
    const response = await fetch(`${baseUrl}/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey!,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability,
          similarity_boost: similarity,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`音声合成APIエラー: ${errorText}`);
    } // 音声データを取得
    const audioBuffer = await response.arrayBuffer();

    // 音声ファイルを保存して公開URLを返す
    const audioUrl = await saveFile(Buffer.from(audioBuffer), {
      folder: "voice-messages",
      extension: "mp3",
    });

    return audioUrl;
  } catch (error) {
    console.error("ElevenLabs API Error:", error);
    throw new Error("音声の生成中にエラーが発生しました");
  }
}

// 利用可能な音声の一覧を取得する関数
export async function getAvailableVoices() {
  try {
    const response = await fetch(`${baseUrl}/voices`, {
      headers: {
        "xi-api-key": apiKey!,
      },
    });

    if (!response.ok) {
      throw new Error("利用可能な音声の取得に失敗しました");
    }

    const data = await response.json();
    return data.voices;
  } catch (error) {
    console.error("ElevenLabs API Error:", error);
    throw new Error("利用可能な音声の取得に失敗しました");
  }
}

// 互換性のために generateVoiceWithElevenLabs としても公開
export const generateVoiceWithElevenLabs = generateVoice;
