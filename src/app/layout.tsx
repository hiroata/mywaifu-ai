import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyWaifuAI - あなただけのAIコンパニオン",
  description: "MyWaifuAIは、AIを活用したパーソナルコンパニオンサービスです。あなただけのAIキャラクターとチャットを楽しみましょう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
