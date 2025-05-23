"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CharacterCardProps {
  id: string;
  name: string;
  age?: number;
  tagline: string;
  avatarUrl: string;
  isOnline?: boolean;
  isNew?: boolean;
  isFavorite?: boolean;
  region?: string;
  joinDate?: Date;
  type?: string;
}

export function CharacterCard({
  id,
  name,
  age,
  tagline,
  avatarUrl,
  isOnline = false,
  isNew = false,
  isFavorite: initialFavorite = false,
  region,
  joinDate,
  type,
}: CharacterCardProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    
    // IDをキーとしてイベントをトリガー
    // 親コンポーネントでこのイベントをキャッチして処理
    const event = new CustomEvent('favoriteToggle', { 
      detail: { id }
    });
    document.dispatchEvent(event);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden bg-[#1a1a1a] border-gray-800 h-full hover:shadow-xl transition-all duration-300">
        <Link href={`/chat/${id}`} className="block h-full relative">          {/* スタータスバッジ */}
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
            {isOnline && (
              <Badge className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                オンライン
              </Badge>
            )}
            {isNew && (
              <Badge className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
                新着
              </Badge>
            )}
            {type && (
              <Badge className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">
                {type}
              </Badge>
            )}
          </div>

          {/* いいねボタン */}
          <Button
            className={cn(
              "absolute top-2 left-2 z-10 h-8 w-8 rounded-full p-0 flex items-center justify-center",
              isFavorite ? "bg-pink-500 text-white" : "bg-black/50 text-gray-300 hover:bg-pink-500/70 hover:text-white"
            )}
            size="icon"
            variant="ghost"
            onClick={handleFavoriteToggle}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </Button>

          {/* キャラクター画像 - 縦長に表示 */}
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={avatarUrl}
              alt={name}
              fill
              className="object-cover transition-transform hover:scale-105 duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>          {/* キャラクター情報 */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white z-10">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="font-medium text-lg">{name} {age && <span className="text-sm text-gray-300">{age}歳</span>}</h3>
                <p className="text-sm text-gray-300 line-clamp-2">{tagline}</p>
                {region && (
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-400">
                      <span className="mr-1">📍</span>{region}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </Card>
    </motion.div>
  );
}
