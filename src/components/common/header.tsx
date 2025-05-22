// components/common/header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  
  // スクロール検出
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // マーケティングページか管理画面かを判定
  const isMarketingPage = pathname === "/" || 
    pathname.startsWith("/about") || 
    pathname.startsWith("/blog") || 
    pathname.startsWith("/pricing");
  
  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "apple-header py-3" : "bg-transparent py-5"
      }`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-text-light dark:text-text-dark">
              MyWaifuAI
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            {isMarketingPage ? (
              <>
                <Link href="/about" className="apple-nav-link">
                  サービスについて
                </Link>
                <Link href="/pricing" className="apple-nav-link">
                  料金プラン
                </Link>
                <Link href="/blog" className="apple-nav-link">
                  ブログ
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="apple-nav-link">
                  ダッシュボード
                </Link>
                <Link href="/characters" className="apple-nav-link">
                  キャラクター
                </Link>
                <Link href="/chat" className="apple-nav-link">
                  チャット
                </Link>
                <Link href="/gallery" className="apple-nav-link">
                  ギャラリー
                </Link>
              </>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {isMarketingPage ? (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-text-light dark:text-text-dark font-medium hover:opacity-80 transition-opacity"
              >
                ログイン
              </Link>
              <Link href="/register" className="apple-button">
                無料で始める
              </Link>
            </div>
          ) : (
            <Link href="/settings" className="apple-nav-link">
              設定
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
