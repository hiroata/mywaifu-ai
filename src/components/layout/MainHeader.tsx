"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TabType = "female" | "anime" | "male";

interface MainHeaderProps {
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

export function MainHeader({
  activeTab = "female",
  onTabChange,
}: MainHeaderProps) {
  const handleTabClick = (tab: TabType) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <header className="bg-black border-b border-gray-800">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* ロゴ */}
        <div>
          <h1 className="text-2xl font-bold text-pink-500">MyWaifuAI</h1>
        </div>

        {/* タブナビゲーション */}
        <nav className="flex space-x-8">
          <button
            onClick={() => handleTabClick("female")}
            className={cn(
              "text-gray-400 hover:text-white pb-2 transition-colors",
              activeTab === "female" &&
                "text-pink-500 border-b-2 border-pink-500",
            )}
          >
            女性
          </button>
          <button
            onClick={() => handleTabClick("anime")}
            className={cn(
              "text-gray-400 hover:text-white pb-2 transition-colors",
              activeTab === "anime" &&
                "text-pink-500 border-b-2 border-pink-500",
            )}
          >
            アニメ
          </button>
          <button
            onClick={() => handleTabClick("male")}
            className={cn(
              "text-gray-400 hover:text-white pb-2 transition-colors",
              activeTab === "male" &&
                "text-pink-500 border-b-2 border-pink-500",
            )}
          >
            男性
          </button>
        </nav>

        {/* ユーザーアクション */}
        <div className="flex space-x-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:text-pink-500">
              ログイン
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-pink-600 hover:bg-pink-700 text-white">
              新規登録
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
