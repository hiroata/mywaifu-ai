import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import {
  Home,
  MessageSquare,
  Users,
  Image as ImageIcon,
  Settings,
  Star,
  Plus,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { label: "ダッシュボード", href: "/dashboard", icon: Home },
    { label: "チャット", href: "/chat", icon: MessageSquare },
    { label: "キャラクター", href: "/characters", icon: Users },
    { label: "ギャラリー", href: "/gallery", icon: ImageIcon },
    { label: "設定", href: "/settings", icon: Settings },
    { label: "サブスクリプション", href: "/subscription", icon: Star },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* サイドバー - デスクトップ */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/80 backdrop-blur-sm">
        <div className="p-4 h-16 flex items-center border-b border-neutral-200 dark:border-neutral-800">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 dark:bg-blue-700 flex items-center justify-center text-white">
              <span className="font-bold">M</span>
            </div>
            <span className="font-semibold text-lg">MyWaifuAI</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 font-normal h-10",
                  item.href === "/chat" &&
                    "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
                )}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
          <Link href="/create-character">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
              <Plus className="mr-2 h-5 w-5" />
              新しいキャラクター
            </Button>
          </Link>
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-neutral-600 dark:text-neutral-400"
            >
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* モバイルヘッダー */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 h-16 bg-white dark:bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 dark:bg-blue-700 flex items-center justify-center text-white">
            <span className="font-bold">M</span>
          </div>
          <span className="font-semibold text-lg">MyWaifuAI</span>
        </Link>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* モバイルメニュー */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden fixed inset-0 z-10 bg-white dark:bg-neutral-950 pt-16"
        >
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 font-normal h-12",
                    item.href === "/chat" &&
                      "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
                  )}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 mt-4">
            <Link
              href="/create-character"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                <Plus className="mr-2 h-5 w-5" />
                新しいキャラクター
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full mt-4 text-neutral-600 dark:text-neutral-400 justify-start"
            >
              <LogOut className="mr-2 h-5 w-5" />
              ログアウト
            </Button>
          </div>
        </motion.div>
      )}

      {/* メインコンテンツエリア */}
      <main className="flex-1 md:pt-0 pt-16 flex flex-col">{children}</main>
    </div>
  );
}
