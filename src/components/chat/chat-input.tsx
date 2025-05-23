// src/components/chat/chat-input.tsx
"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useChat } from "@/hooks/use-chat";
import { useChatStore } from "@/store/chat-store";
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ImageIcon, SendIcon, MicIcon, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  conversationId: string;
}

export function ChatInput({ conversationId }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [generateVoice, setGenerateVoice] = useState(false);
  const [aiProvider, setAiProvider] = useState<"openai" | "xai">("openai");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { sendMessage, isSending } = useChat(conversationId);
  const { isLoading } = useChatStore();
  const { canGenerateImages, canUseVoice } = useSubscription();
  // メッセージ送信ハンドラー
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim() || isSending) return;

    try {
      await sendMessage({
        content: message,
        ...(showImageInput && imagePrompt ? { imagePrompt } : {}),
        generateVoice,
        aiProvider, // AIプロバイダを追加
      });

      // 入力フィールドをリセット
      setMessage("");
      setImagePrompt("");
      setShowImageInput(false);
    } catch (error) {
      console.error("メッセージ送信エラー:", error);
    }
  };

  // テキストエリアの高さを自動調整
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 backdrop-blur-lg bg-opacity-80 dark:bg-opacity-80">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        {/* 画像生成プロンプト */}
        {showImageInput && (
          <div className="flex items-center space-x-2 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-900 transition-all duration-200">
            <ImageIcon size={18} className="text-neutral-500" />
            <input
              type="text"
              placeholder="画像生成プロンプト（例：海辺でデート、カフェでくつろぐ）"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              disabled={isSending || isLoading}
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowImageInput(false)}
              className="h-7 w-7 rounded-full"
            >
              &times;
            </Button>
          </div>
        )}
        {/* メインのチャット入力 */}
        <div className="flex items-end space-x-3">
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              placeholder="メッセージを入力..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending || isLoading}
              className="min-h-[60px] w-full pr-14 border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-blue-600 dark:focus:ring-blue-500"
              variant="outline"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (message.trim()) {
                    handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
                  }
                }
              }}
            />{" "}
            <div className="absolute bottom-2 right-2 flex items-center space-x-1">
              {/* 画像生成ボタン */}
              {canGenerateImages && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isSending || isLoading}
                  onClick={() => setShowImageInput(!showImageInput)}
                  className={cn(
                    "h-8 w-8 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
                    showImageInput &&
                      "bg-neutral-100 dark:bg-neutral-800 text-blue-600 dark:text-blue-400",
                  )}
                >
                  <ImageIcon
                    size={18}
                    className={cn(
                      showImageInput
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-neutral-600 dark:text-neutral-400",
                    )}
                  />
                </Button>
              )}
            </div>
          </div>
          {/* 音声・送信ボタン */}{" "}
          <div className="flex items-center space-x-3">
            {" "}
            {/* AI選択ポップオーバー */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isSending || isLoading}
                  className={cn(
                    "h-11 w-11 rounded-full border-neutral-200 dark:border-neutral-800 transition-all duration-200",
                    aiProvider === "xai" &&
                      "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-700/50",
                  )}
                >
                  <SparklesIcon size={18} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4">
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                    AIモデルを選択
                  </div>
                  <div className="flex items-center justify-between space-x-3">
                    <Label
                      htmlFor="openai-toggle"
                      className={cn(
                        "font-medium",
                        aiProvider === "openai"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-neutral-600 dark:text-neutral-400",
                      )}
                    >
                      OpenAI
                    </Label>
                    <Switch
                      id="openai-toggle"
                      checked={aiProvider === "openai"}
                      onCheckedChange={(checked) => {
                        if (checked) setAiProvider("openai");
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-3">
                    <Label
                      htmlFor="xai-toggle"
                      className={cn(
                        "font-medium",
                        aiProvider === "xai"
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-neutral-600 dark:text-neutral-400",
                      )}
                    >
                      xAI (Grok)
                    </Label>
                    <Switch
                      id="xai-toggle"
                      checked={aiProvider === "xai"}
                      onCheckedChange={(checked) => {
                        if (checked) setAiProvider("xai");
                      }}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            {/* 音声合成設定 */}
            {canUseVoice && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isSending || isLoading}
                    className={cn(
                      "h-11 w-11 rounded-full border-neutral-200 dark:border-neutral-800 transition-all duration-200",
                      generateVoice &&
                        "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-700/50",
                    )}
                  >
                    <MicIcon size={18} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4">
                  <div className="flex items-center justify-between space-x-3">
                    <Label
                      htmlFor="voice-toggle"
                      className="font-medium text-neutral-900 dark:text-neutral-50"
                    >
                      音声で応答
                    </Label>
                    <Switch
                      id="voice-toggle"
                      checked={generateVoice}
                      onCheckedChange={setGenerateVoice}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            )}
            {/* 送信ボタン */}
            <Button
              type="submit"
              disabled={!message.trim() || isSending || isLoading}
              className="h-11 w-11 rounded-full p-0 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              {isSending ? (
                <SparklesIcon size={18} className="animate-spin text-white" />
              ) : (
                <SendIcon size={18} className="text-white" />
              )}
            </Button>
          </div>
        </div>
      </form>
      {/* サブスクリプションのアップグレード促進 */}
      {(!canGenerateImages || !canUseVoice) && (
        <div className="mt-3 text-center text-xs text-neutral-500 dark:text-neutral-400">
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-blue-600 dark:text-blue-400 font-medium"
            onClick={() => (window.location.href = "/subscription")}
          >
            プランをアップグレード
          </Button>
          して画像生成・音声機能を利用できます
        </div>
      )}
    </div>
  );
}
