"use client";

import { useState, useEffect } from "react";
import { signIn, getCsrfToken } from "next-auth/react";

export default function TestCSRFPage() {
  const [csrfToken, setCsrfToken] = useState("");
  const [email, setEmail] = useState("test-csrf@example.com");
  const [password, setPassword] = useState("TestPassword123");
  const [name, setName] = useState("Test CSRF User");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const testEmailRegistration = async () => {
    setIsLoading(true);
    setResult("登録処理を開始...");
    
    try {
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

      const responseText = await response.text();
      console.log("Registration response:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setResult("✅ 登録成功！自動ログインを試行中...");

      // 自動ログイン
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.ok) {
        setResult("✅ 登録と自動ログイン成功！");
      } else {
        setResult(`⚠️ 登録成功、ログイン失敗: ${signInResult?.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setResult(`❌ 登録失敗: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testGoogleAuth = async () => {
    setIsLoading(true);
    setResult("Google認証を開始...");
    
    try {
      if (!csrfToken) {
        const token = await getCsrfToken();
        setCsrfToken(token || "");
      }
      
      console.log("Starting Google OAuth with CSRF:", csrfToken);
      
      const result = await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: false,
      });
      
      console.log("Google OAuth result:", result);
      
      if (result?.ok) {
        setResult("✅ Google認証成功！");
      } else {
        setResult(`❌ Google認証失敗: ${result?.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Google auth error:", error);
      setResult(`❌ Google認証エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">CSRF & 登録機能テストページ</h1>
      
      <div className="space-y-4 mb-8">
        <div>
          <strong>CSRF Token:</strong> {csrfToken ? "✅ 取得済み" : "❌ 未取得"}
          <br />
          <small className="text-gray-600 break-all">{csrfToken}</small>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <button
          onClick={testEmailRegistration}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "処理中..." : "メール登録テスト"}
        </button>
        
        <button
          onClick={testGoogleAuth}
          disabled={isLoading}
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isLoading ? "処理中..." : "Google認証テスト"}
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <strong>結果:</strong>
        <div className="mt-2 whitespace-pre-wrap">{result || "テストを実行してください"}</div>
      </div>
    </div>
  );
}
