import type { Metadata } from "next";
import { ThemeProvider } from "@/components/common/theme-provider";
import AuthProvider from "@/components/common/auth-provider";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyWaifuAI - あなただけのAIコンパニオン",
  description:
    "MyWaifuAIは、AIを活用したパーソナルコンパニオンサービスです。あなただけのAIキャラクターとチャットを楽しみましょう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning className="dark">
      <body className="min-h-screen bg-[#0f0f0f] text-white">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1f2937',
                  color: '#fff',
                  border: '1px solid #374151',
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
