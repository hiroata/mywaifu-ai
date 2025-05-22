// src/hooks/use-chat.ts
import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useChatStore } from "@/store/chat-store";
import { MessageInput, Message } from "@/types/chat";

export function useChat(conversationId: string) {
  const [isSending, setIsSending] = useState(false);
  const { addMessage, setLoading } = useChatStore();

  // メッセージ送信ミューテーション
  const { mutateAsync: sendMessageMutation } = useMutation({
    mutationFn: async (input: MessageInput) => {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "メッセージの送信に失敗しました");
      }
      
      return response.json();
    },
  });

  // メッセージ送信ハンドラー
  const sendMessage = useCallback(
    async (input: MessageInput) => {
      try {
        setIsSending(true);
        setLoading(true);
        
        // ユーザーメッセージを追加して表示
        const userMessage: Partial<Message> = {
          id: `temp-${Date.now()}`,
          conversationId,
          content: input.content,
          role: "user",
          hasImage: false,
          hasVoice: false,
          createdAt: new Date(),
        };
        
        addMessage(userMessage as Message);
        
        // APIを呼び出してAIの応答を取得
        const result = await sendMessageMutation(input);
        
        if (result.success) {
          // 応答メッセージを追加
          addMessage(result.data.assistantMessage);
          
          // 関係を更新（もしあれば）
          if (result.data.relationship) {
            // 関係性の更新処理
          }
          
          return result.data;
        }
      } catch (error) {
        console.error("メッセージ送信エラー:", error);
        throw error;
      } finally {
        setIsSending(false);
        setLoading(false);
      }
    },
    [conversationId, addMessage, setLoading, sendMessageMutation]
  );

  return {
    sendMessage,
    isSending,
  };
}
