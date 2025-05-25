"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestRegistrationPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testRegistration = async () => {
    setIsLoading(true);
    setResult("テスト開始...");

    try {
      console.log("=== TEST REGISTRATION DEBUG ===");
      const requestData = { name, email, password };
      console.log("Request data:", requestData);
      
      const jsonString = JSON.stringify(requestData);
      console.log("JSON string:", jsonString);
      console.log("JSON string length:", jsonString.length);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonString,
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      
      const responseText = await response.text();
      console.log("Response text:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed response:", data);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        setResult(`パースエラー: ${parseError}\nレスポンス: ${responseText}`);
        return;
      }

      if (response.ok) {
        setResult(`成功: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`エラー (${response.status}): ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.error("Test error:", error);
      setResult(`例外エラー: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>登録API テスト</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-name">名前</Label>
            <Input
              id="test-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Test User"
            />
          </div>
          <div>
            <Label htmlFor="test-email">メール</Label>
            <Input
              id="test-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          <div>
            <Label htmlFor="test-password">パスワード</Label>
            <Input
              id="test-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
            />
          </div>
          <Button 
            onClick={testRegistration} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "テスト中..." : "登録APIテスト"}
          </Button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
              <pre className="whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
