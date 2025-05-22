import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  MessageSquare, 
  Repeat, 
  Copy, 
  Check, 
  Music, 
  Volume2, 
  VolumeX, 
  MoreHorizontal, 
  Trash,
  Image as ImageIcon
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: {
    id: string;
    role: "user" | "assistant";
    content: string;
    imageUrl?: string;
    audioUrl?: string;
    timestamp: Date;
    isLoading?: boolean;
    aiProvider?: "openai" | "xai";
  };
  onRegenerate?: () => void;
  onDelete?: () => void;
}

export function ChatMessage({ message, onRegenerate, onDelete }: ChatMessageProps) {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const isAssistant = message.role === "assistant";
  const audioRef = useState<HTMLAudioElement | null>(null)[1];
  
  // テキストコピー処理
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    toast({
      title: "コピーしました",
      description: "メッセージをクリップボードにコピーしました",
      variant: "default",
      duration: 2000,
    });
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  
  // 音声再生処理
  const toggleAudio = () => {
    if (!message.audioUrl) return;
    
    if (!audioRef) {
      const audio = new Audio(message.audioUrl);
      audio.addEventListener("ended", () => {
        setIsAudioPlaying(false);
      });
      audio.play();
      setIsAudioPlaying(true);
    } else if (isAudioPlaying) {
      audioRef.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.play();
      setIsAudioPlaying(true);
    }
  };
  
  // フォーマット処理
  const formatContent = (content: string) => {
    // コード/マークダウン処理などが必要な場合実装
    return content;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "py-4 px-4 md:px-6 flex flex-col gap-3 relative",
        isAssistant ? "bg-neutral-50 dark:bg-neutral-900/50" : "bg-white dark:bg-neutral-950"
      )}
    >
      <div className="flex items-start gap-4 max-w-4xl mx-auto w-full">
        {/* アバターアイコン */}
        <div className={cn(
          "flex-shrink-0 rounded-full w-10 h-10 overflow-hidden flex items-center justify-center text-neutral-50",
          isAssistant ? "bg-blue-600 dark:bg-blue-700" : "bg-neutral-900 dark:bg-neutral-800"
        )}>
          {isAssistant ? (
            message.aiProvider === "xai" ? (
              <span className="text-xl font-semibold">X</span>
            ) : (
              <MessageSquare size={20} className="text-white" />
            )
          ) : (
            <span className="text-lg font-semibold">U</span>
          )}
        </div>
        
        {/* メッセージ本文 */}
        <div className="flex-1 space-y-3">
          {/* ヘッダー：名前と時間 */}
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
              {isAssistant ? (
                <span className="flex items-center gap-1">
                  {message.aiProvider === "xai" ? "Grok" : "Assistant"} 
                  {message.aiProvider === "xai" && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">xAI</span>
                  )}
                </span>
              ) : (
                "あなた"
              )}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {message.timestamp ? 
                format(new Date(message.timestamp), "M月d日 HH:mm", {locale: ja}) : 
                "送信中..."}
            </div>
          </div>
          
          {/* メッセージテキスト */}
          <div className={cn(
            "prose prose-neutral dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200",
            message.isLoading && "animate-pulse"
          )}>
            {formatContent(message.content)}
          </div>
          
          {/* 画像がある場合 */}
          {message.imageUrl && (
            <Card className="overflow-hidden w-fit max-w-xs rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div className="relative aspect-square w-full max-w-xs">
                <Image
                  src={message.imageUrl}
                  alt="生成された画像"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <ImageIcon size={12} />
                <span>AIによる生成画像</span>
              </div>
            </Card>
          )}
          
          {/* 音声がある場合 */}
          {message.audioUrl && (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "text-xs gap-1.5 h-8 rounded-lg border border-neutral-200 dark:border-neutral-800",
                isAudioPlaying && "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50"
              )}
              onClick={toggleAudio}
            >
              {isAudioPlaying ? (
                <><Volume2 size={14} /> 再生中...</>
              ) : (
                <><Music size={14} /> 音声を再生</>
              )}
            </Button>
          )}
          
          {/* アクションボタン */}
          {!message.isLoading && (
            <div className="flex gap-2 items-center">
              {isAssistant && onRegenerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1.5 h-8 text-neutral-600 dark:text-neutral-400"
                  onClick={onRegenerate}
                >
                  <Repeat size={14} />
                  再生成
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1.5 h-8 text-neutral-600 dark:text-neutral-400"
                onClick={copyToClipboard}
              >
                {isCopied ? (
                  <><Check size={14} className="text-green-600 dark:text-green-400" /> コピー済み</>
                ) : (
                  <><Copy size={14} /> コピー</>
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-neutral-600 dark:text-neutral-400 h-8 w-8 p-0"
                  >
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  {onDelete && (
                    <DropdownMenuItem
                      className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 cursor-pointer"
                      onClick={onDelete}
                    >
                      <Trash size={14} className="mr-2" />
                      <span>削除</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
