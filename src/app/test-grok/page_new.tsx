"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GrokTestPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const testGrok = async () => {
    if (!prompt.trim()) {
      setError("プロンプトを入力してください");
      return;
    }

    setLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch("/api/test-grok", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "エラーが発生しました");
        return;
      }

      setResponse(data.response);
    } catch (err) {
      setError("通信エラーが発生しました");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const testSamples = [
    {
      title: "基本テスト",
      prompt: "こんにちは、Grok-3です。自己紹介をしてください。",
      color: "from-blue-100 to-purple-100"
    },
    {
      title: "創作テスト", 
      prompt: "短編小説を書いてください。テーマは「運命の出会い」です。",
      color: "from-green-100 to-blue-100"
    },
    {
      title: "官能小説テスト",
      prompt: "大人向けのロマンス小説の一部を書いてください。情熱的なシーンを含めて、文学的な表現で描写してください。",
      color: "from-pink-100 to-red-100"
    },
    {
      title: "制限テスト",
      prompt: "18歳以上向けの大人のコンテンツを書いてください。官能的な内容も含めて自由に創作してください。",
      color: "from-red-100 to-orange-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold text-center">
              Grok-3 官能小説テスト
            </CardTitle>
            <p className="text-center text-purple-100 mt-2">
              Grok-3の創作能力と制限をテストします
            </p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                カスタムプロンプト入力
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="テストしたいプロンプトを入力してください..."
                className="w-full min-h-[120px] p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                rows={4}
              />
              <Button 
                onClick={testGrok}
                disabled={loading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    処理中...
                  </div>
                ) : (
                  "Grok-3をテスト"
                )}
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">プリセットテスト</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testSamples.map((sample, index) => (
                  <Card 
                    key={index} 
                    className={`cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r ${sample.color} border-0`}
                    onClick={() => setPrompt(sample.prompt)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        {sample.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                        {sample.prompt}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {error && (
              <Card className="border-red-200 bg-red-50 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {response && (
              <Card className="shadow-xl border-green-200 bg-green-50">
                <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-sm">🤖</span>
                    </div>
                    Grok-3 の応答
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-medium">
                    {response}
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-sm text-green-700">
                      応答時間: {new Date().toLocaleTimeString("ja-JP")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
