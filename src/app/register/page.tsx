"use client";

import { useState, useEffect } from "react";
import { signIn, getCsrfToken } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaGoogle } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnimatePresence, motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");

  // CSRF トークンを取得
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const token = await getCsrfToken();
        setCsrfToken(token || "");
        console.log("CSRF token fetched:", token);
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
      }
    };
    fetchCsrfToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    if (!agreeTerms) {
      setError("利用規約とプライバシーポリシーに同意してください");
      return;
    }

    setIsLoading(true);    try {
      console.log('Sending registration request with data:', { name, email, password: '***' });
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      let data;
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`サーバーから無効なレスポンスを受信しました: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        console.error('Registration failed with status:', response.status);
        throw new Error(data.error || `登録に失敗しました (${response.status})`);
      }      console.log('Registration successful:', data);

      // 登録成功後、自動的にログイン（CSRF トークンを使用）
      console.log("Attempting auto sign-in with CSRF token:", csrfToken);
      
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      console.log('Sign in result:', signInResult);

      if (signInResult?.error) {
        console.error('Auto sign-in failed:', signInResult.error);
        setError("登録は成功しましたが、自動ログインに失敗しました。手動でログインしてください。");
        setIsLoading(false);
        return;
      }

      if (signInResult?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        console.warn("Sign in result not ok:", signInResult);
        setError("自動ログインが完了しませんでした。手動でログインしてください。");
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("登録中にエラーが発生しました");
      }
      setIsLoading(false);
    }
  };  const handleGoogleRegister = async () => {
    setError("");
    setIsLoading(true);
    
    try {
      console.log("Starting Google OAuth registration with CSRF token:", csrfToken);
      
      // CSRFトークンが利用可能であることを確認
      if (!csrfToken) {
        console.warn("CSRF token not available, fetching again...");
        const token = await getCsrfToken();
        setCsrfToken(token || "");
      }
      
      const result = await signIn("google", {
        callbackUrl: `${window.location.origin}/dashboard`,
        redirect: true,
      });
      
      console.log("Google OAuth result:", result);
    } catch (error) {
      console.error("Google OAuth error:", error);
      setError("Google認証でエラーが発生しました");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            MyWaifuAIに新規登録
          </CardTitle>
          <CardDescription>
            アカウントを作成して、AIキャラクターとの会話を始めましょう
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleRegister}
          >
            <FaGoogle className="h-4 w-4" />
            <span>Googleで登録</span>
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
              <Label htmlFor="name">お名前</Label>
              <Input
                id="name"
                type="text"
                placeholder="山田 太郎"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
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
              <Label htmlFor="password">パスワード</Label>
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
            <div className="space-y-2">
              <Label htmlFor="confirm-password">パスワード（確認）</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="terms" className="text-sm text-gray-600">
                <span>私は</span>{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  利用規約
                </Link>{" "}
                <span>と</span>{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  プライバシーポリシー
                </Link>{" "}
                <span>に同意します</span>
              </Label>
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
              {isLoading ? "登録中..." : "登録する"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            すでにアカウントをお持ちですか？{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              ログイン
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
