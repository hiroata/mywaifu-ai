import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/use-chat";
import { useChatStore } from "@/store/chat-store";
import { useCharacter } from "@/hooks/use-character";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon, Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { messages, isLoading, error } = useChat(conversationId);
  const { regenerateMessage, deleteMessage } = useChatStore();
  const { character } = useCharacter(conversationId);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const showScrollDownRef = useRef(false);
  
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // チャットをスクロールダウンする
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };
  
  // 新しいメッセージが来たら自動スクロール
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);
  
  // スクロール状態の監視
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      // 下から100px以上離れたらスクロールダウンボタンを表示
      showScrollDownRef.current = scrollHeight - scrollTop - clientHeight > 100;
    };
    
    chatContainer.addEventListener("scroll", handleScroll);
    return () => {
      chatContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  // メッセージ再生成処理
  const handleRegenerate = (messageId: string) => {
    regenerateMessage(conversationId, messageId);
  };
  
  // メッセージ削除処理
  const handleDelete = (messageId: string) => {
    deleteMessage(conversationId, messageId);
  };
  
  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-950">
      {/* キャラクターヘッダー */}
      {character && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center text-white">
              {character.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-medium text-neutral-900 dark:text-neutral-100">{character.name}</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{character.tagline || "AI コンパニオン"}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings2 size={18} className="text-neutral-600 dark:text-neutral-400" />
          </Button>
        </div>
      )}
      
      {/* メッセージエリア */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent"
      >
        {/* エラー表示 */}
        {error && (
          <div className="p-4 m-4 text-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">
            <p>エラーが発生しました: {error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400"
              onClick={() => window.location.reload()}
            >
              再読み込み
            </Button>
          </div>
        )}
        
        {/* メッセージリスト */}
        {sortedMessages.length === 0 && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="max-w-md mx-auto text-center space-y-4">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">会話を始めましょう</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                メッセージを送信して{character?.name || "AI"}との会話を開始してください。
                質問や悩み、雑談などなんでもどうぞ。
              </p>
            </div>
          </div>
        ) : (
          <div className="pb-20">
            <AnimatePresence>
              {sortedMessages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRegenerate={message.role === "assistant" ? () => handleRegenerate(message.id) : undefined}
                  onDelete={() => handleDelete(message.id)}
                />
              ))}
            </AnimatePresence>
            
            {/* ローディングスケルトン */}
            {isLoading && (
              <div className="py-4 px-6 bg-neutral-50 dark:bg-neutral-900/50">
                <div className="flex items-start gap-4 max-w-4xl mx-auto w-full">
                  <Skeleton className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800" />
                      <Skeleton className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full bg-neutral-200 dark:bg-neutral-800" />
                      <Skeleton className="h-4 w-5/6 bg-neutral-200 dark:bg-neutral-800" />
                      <Skeleton className="h-4 w-4/6 bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* スクロールダウンボタン */}
      <AnimatePresence>
        {showScrollDownRef.current && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-24 right-6"
          >
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-md bg-white dark:bg-neutral-900 h-10 w-10"
              onClick={() => scrollToBottom()}
            >
              <ArrowDownIcon size={18} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* チャット入力 */}
      <div className="sticky bottom-0 z-10">
        <ChatInput conversationId={conversationId} />
      </div>
    </div>
  );
}
