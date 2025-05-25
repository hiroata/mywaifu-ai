"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/use-chat";
import { useChatStore } from "@/store/chat-store";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatWindowProps {
  conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { sendMessage, isSending } = useChat(conversationId);
  const { messages, isLoading, character } = useChatStore();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // チャットをスクロールダウンする
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // 新しいメッセージが来たらスクロール
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ローディング表示
  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-4 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage({
        content,
        role: "user",
        conversationId,
      });
    } catch (error) {
      console.error("メッセージ送信エラー:", error);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {character && (
              <>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-600" />
                <div>
                  <h2 className="font-semibold">{character.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    オンライン
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* メッセージエリア */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ChatMessage message={message} />
            </motion.div>
          ))}
        </AnimatePresence>

        {isSending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
              <div className="flex space-x-1">
                <div className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                <div className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                <div className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">
                入力中...
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* 入力エリア */}
      <div className="border-t p-4">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isSending}
          placeholder={`${character?.name || "AI"}にメッセージを送信...`}
        />
      </div>
    </div>
  );
}
