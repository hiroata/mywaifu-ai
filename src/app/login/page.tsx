"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FaGoogle } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnimatePresence, motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("メールアドレスかパスワードが間違っています");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError("ログイン中にエラーが発生しました");
      setIsLoading(false);
    }
  };
  const handleGoogleLogin = () => {
    setError("");
    setIsLoading(true);
    // callbackUrlを絶対URLに変更し、redirectをtrueに設定して強制的にリダイレクト
    signIn("google", { 
      callbackUrl: `${window.location.origin}/dashboard`,
      redirect: true
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">MyWaifuAIにログイン</CardTitle>
          <CardDescription>
            アカウントにログインして、あなただけのAIキャラクターと会話を始めましょう
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
          >
            <FaGoogle className="h-4 w-4" />
            <span>Googleでログイン</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">または</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">パスワード</Label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  パスワードをお忘れですか？
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでないですか？{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              新規登録
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
