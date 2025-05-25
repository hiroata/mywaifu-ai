"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageCircle, Users, Settings, Plus, Image, BookOpen } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // まだ読み込み中
    if (!session) {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // リダイレクト中
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ようこそ、{session.user?.name || session.user?.email}さん！
          </h1>
          <p className="text-gray-600">
            MyWaifuAI ダッシュボードへようこそ。AIキャラクターとの素敵な会話を始めましょう。
          </p>
        </div>

        {/* クイックアクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">新しいチャット</CardTitle>
              <MessageCircle className="h-5 w-5 ml-auto text-blue-600" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                AIキャラクターと新しい会話を始めましょう
              </CardDescription>
              <Link href="/chat">
                <Button className="w-full">
                  チャットを開始
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">キャラクター作成</CardTitle>
              <Plus className="h-5 w-5 ml-auto text-green-600" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                オリジナルのAIキャラクターを作成
              </CardDescription>
              <Link href="/create-character">
                <Button variant="outline" className="w-full">
                  キャラクター作成
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">キャラクター一覧</CardTitle>
              <Users className="h-5 w-5 ml-auto text-purple-600" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                既存のキャラクターを閲覧・管理
              </CardDescription>
              <Link href="/characters">
                <Button variant="outline" className="w-full">
                  キャラクター一覧
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">ギャラリー</CardTitle>
              <Image className="h-5 w-5 ml-auto text-pink-600" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                生成された画像やアートを閲覧
              </CardDescription>
              <Link href="/gallery">
                <Button variant="outline" className="w-full">
                  ギャラリー
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">コンテンツ</CardTitle>
              <BookOpen className="h-5 w-5 ml-auto text-orange-600" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                ストーリーやコンテンツを管理
              </CardDescription>
              <Link href="/content">
                <Button variant="outline" className="w-full">
                  コンテンツ
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">設定</CardTitle>
              <Settings className="h-5 w-5 ml-auto text-gray-600" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                アカウントとアプリの設定
              </CardDescription>
              <Link href="/settings">
                <Button variant="outline" className="w-full">
                  設定
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* 最近のアクティビティ */}
        <Card>
          <CardHeader>
            <CardTitle>最近のアクティビティ</CardTitle>
            <CardDescription>
              あなたの最近の活動状況
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>まだアクティビティがありません</p>
              <p className="text-sm">チャットやキャラクター作成を始めると、ここに表示されます</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
