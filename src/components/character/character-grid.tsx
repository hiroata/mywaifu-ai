import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Grid,
  List,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Character {
  id: string;
  name: string;
  tagline: string;
  avatarUrl: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

interface CharacterGridProps {
  characters: Character[];
}

export function CharacterGrid({ characters }: CharacterGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  
  // 検索フィルタリング
  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // アニメーションバリアント
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            あなたのキャラクター
          </h1>
          
          <div className="flex flex-col md:flex-row gap-3">
            {/* 検索バー */}
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              <Input
                placeholder="キャラクターを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full md:w-[240px] bg-white dark:bg-neutral-900"
              />
            </div>
            
            {/* ビュー切り替え */}
            <div className="flex items-center space-x-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "h-8 px-2 rounded-md",
                  viewMode === "grid" && "bg-neutral-100 dark:bg-neutral-800"
                )}
              >
                <Grid size={18} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={cn(
                  "h-8 px-2 rounded-md",
                  viewMode === "list" && "bg-neutral-100 dark:bg-neutral-800"
                )}
              >
                <List size={18} />
              </Button>
            </div>
            
            {/* 新規作成ボタン */}
            <Link href="/create-character">
              <Button className="gap-1 md:gap-2">
                <Plus size={18} />
                <span>新規作成</span>
              </Button>
            </Link>
          </div>
        </div>
        
        {/* キャラクターがない場合 */}
        {filteredCharacters.length === 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-8 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Users size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                {searchQuery ? "検索結果がありません" : "キャラクターがまだありません"}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {searchQuery
                  ? `"${searchQuery}"に一致するキャラクターが見つかりませんでした。検索語を変更してお試しください。`
                  : "最初のAIキャラクターを作成して、会話を始めましょう。"}
              </p>
              {!searchQuery && (
                <div className="pt-2">
                  <Link href="/create-character">
                    <Button>
                      <Plus size={18} className="mr-2" />
                      キャラクターを作成
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* グリッドビュー */}
        {viewMode === "grid" && filteredCharacters.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredCharacters.map((character) => (
              <motion.div key={character.id} variants={itemVariants}>
                <Card className="overflow-hidden h-full hover:shadow-md transition-shadow border-neutral-200 dark:border-neutral-800">
                  <Link href={`/chat/${character.id}`} className="block h-full">
                    <div className="relative aspect-[3/2] w-full">
                      <Image
                        src={character.avatarUrl}
                        alt={character.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">
                            {character.name}
                          </h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {character.tagline}
                          </p>
                        </div>
                        <div className="relative -mt-1 -mr-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8"
                                onClick={(e) => e.preventDefault()}
                              >
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link href={`/characters/edit/${character.id}`} onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  編集
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                                <Copy className="mr-2 h-4 w-4" />
                                複製
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => e.preventDefault()} className="text-red-600 dark:text-red-400">
                                <Trash className="mr-2 h-4 w-4" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-500">
                        メッセージ: {character.messageCount} · 最終更新: {character.updatedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* リストビュー */}
        {viewMode === "list" && filteredCharacters.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {filteredCharacters.map((character) => (
              <motion.div key={character.id} variants={itemVariants}>
                <Card className="overflow-hidden border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                  <Link href={`/chat/${character.id}`} className="block">
                    <div className="p-4 flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={character.avatarUrl}
                          alt={character.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-lg truncate text-neutral-900 dark:text-neutral-100">
                            {character.name}
                          </h3>
                          <div className="flex items-center gap-1">
                            <div className="text-xs text-neutral-500 dark:text-neutral-500">
                              {character.updatedAt.toLocaleDateString()}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  <MoreHorizontal size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Link href={`/characters/edit/${character.id}`} onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    編集
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  複製
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => e.preventDefault()} className="text-red-600 dark:text-red-400">
                                  <Trash className="mr-2 h-4 w-4" />
                                  削除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                          {character.tagline}
                        </p>
                        <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                          メッセージ: {character.messageCount}
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// このコンポーネントはCharacterGridで使用
function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
