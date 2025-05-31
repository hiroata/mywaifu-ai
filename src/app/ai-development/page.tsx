// src/app/ai-development/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Clock, Zap } from "lucide-react";

interface AIConfig {
  userPreferences: any;
  systemConfig: any;
  availableModels: Record<string, string[]>;
  healthReport: any;
}

interface AIResult {
  success: boolean;
  data?: any;
  error?: string;
  provider?: string;
  model?: string;
  processingTime?: number;
}

export default function AIDevelopmentPage() {
  const [activeTab, setActiveTab] = useState("generation");
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("generate");
  const [enhancementType, setEnhancementType] = useState<string>("grammar");
  const [result, setResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  // 設定を読み込み
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setConfigLoading(true);
      const response = await fetch("/api/ai/config");
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.data);
        if (data.data.systemConfig.availableProviders.length > 0) {
          setSelectedProvider(data.data.userPreferences.preferredProvider || data.data.systemConfig.availableProviders[0]);
        }
      }
    } catch (error) {
      console.error("Failed to load config:", error);
    } finally {
      setConfigLoading(false);
    }
  };

  const refreshProviders = async () => {
    try {
      await fetch("/api/ai/config", { method: "PUT" });
      await loadConfig();
    } catch (error) {
      console.error("Failed to refresh providers:", error);
    }
  };

  const generateContent = async () => {
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      setResult(null);

      const response = await fetch("/api/ai/integrated", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "development-user"
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          type: selectedType,
          provider: selectedProvider,
          options: {
            enhancementType: selectedType === "enhance" ? enhancementType : undefined,
            temperature: 0.7,
            maxTokens: 2048
          }
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Generation failed:", error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: any) => {
    try {
      const response = await fetch("/api/ai/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "development-user"
        },
        body: JSON.stringify(newPreferences)
      });

      if (response.ok) {
        await loadConfig();
      }
    } catch (error) {
      console.error("Failed to update preferences:", error);
    }
  };

  if (configLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="mx-auto h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-2 text-gray-600">AI設定を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">AI開発環境テストコンソール</h1>
        <p className="text-gray-600">Gemini、xAI、OpenAIプロバイダーの統合テスト環境</p>
      </div>      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generation">コンテンツ生成</TabsTrigger>
          <TabsTrigger value="config">設定管理</TabsTrigger>
          <TabsTrigger value="status">システム状態</TabsTrigger>
        </TabsList>

        <TabsContent value="generation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI コンテンツ生成
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">プロバイダー</label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="プロバイダーを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {config?.systemConfig.availableProviders.map((provider: string) => (
                        <SelectItem key={provider} value={provider}>
                          {provider.charAt(0).toUpperCase() + provider.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">処理タイプ</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="generate">生成</SelectItem>
                      <SelectItem value="enhance">強化</SelectItem>
                      <SelectItem value="analyze">分析</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedType === "enhance" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">強化タイプ</label>
                    <Select value={enhancementType} onValueChange={setEnhancementType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grammar">文法修正</SelectItem>
                        <SelectItem value="style">文体改善</SelectItem>
                        <SelectItem value="emotion">感情強化</SelectItem>
                        <SelectItem value="summarize">要約</SelectItem>
                        <SelectItem value="elaborate">詳細化</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">プロンプト</label>
                <Textarea
                  placeholder="ここにプロンプトを入力してください..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </div>

              <Button 
                onClick={generateContent} 
                disabled={loading || !prompt.trim()}
                className="w-full"
              >
                {loading ? "処理中..." : "生成実行"}
              </Button>

              {result && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      結果
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.success ? (
                      <div className="space-y-2">
                        <div className="flex gap-2 text-sm text-gray-600">
                          <Badge variant="outline">プロバイダー: {result.provider}</Badge>
                          <Badge variant="outline">モデル: {result.model}</Badge>
                          <Badge variant="outline">処理時間: {result.processingTime}ms</Badge>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <pre className="whitespace-pre-wrap text-sm">
                            {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="text-red-600">
                        エラー: {result.error}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI設定管理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {config && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">優先プロバイダー</label>
                      <Select 
                        value={config.userPreferences.preferredProvider} 
                        onValueChange={(value) => updatePreferences({ preferredProvider: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {config.systemConfig.availableProviders.map((provider: string) => (
                            <SelectItem key={provider} value={provider}>
                              {provider.charAt(0).toUpperCase() + provider.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">フォールバックプロバイダー</label>
                      <Select 
                        value={config.userPreferences.fallbackProvider}
                        onValueChange={(value) => updatePreferences({ fallbackProvider: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {config.systemConfig.availableProviders.map((provider: string) => (
                            <SelectItem key={provider} value={provider}>
                              {provider.charAt(0).toUpperCase() + provider.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">利用可能なモデル</h3>
                    <div className="space-y-2">
                      {Object.entries(config.availableModels).map(([provider, models]) => (
                        <div key={provider} className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="mr-2">
                            {provider.charAt(0).toUpperCase() + provider.slice(1)}:
                          </Badge>
                          {(models as string[]).map((model) => (
                            <Badge key={model} variant="secondary" className="text-xs">
                              {model}
                            </Badge>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  システム健全性
                  <Button variant="outline" size="sm" onClick={refreshProviders}>
                    更新
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {config?.healthReport && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          config.healthReport.overall === "healthy" ? "default" :
                          config.healthReport.overall === "degraded" ? "secondary" : "destructive"
                        }
                      >
                        {config.healthReport.overall}
                      </Badge>
                      <span className="text-sm text-gray-600">全体状態</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">プロバイダー状態</h4>
                      {Object.entries(config.healthReport.providers).map(([provider, status]: [string, any]) => (
                        <div key={provider} className="flex items-center justify-between">
                          <span className="text-sm">{provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
                          <Badge 
                            variant={
                              status.status === "healthy" ? "default" :
                              status.status === "degraded" ? "secondary" : "destructive"
                            }
                          >
                            {status.status}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {config.healthReport.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">推奨事項</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {config.healthReport.recommendations.map((rec: string, index: number) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>開発環境情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>デフォルトプロバイダー:</span>
                    <Badge variant="outline">{config?.systemConfig.defaultProvider}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>フォールバックプロバイダー:</span>
                    <Badge variant="outline">{config?.systemConfig.fallbackProvider}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>利用可能プロバイダー数:</span>
                    <Badge variant="outline">{config?.systemConfig.availableProviders.length || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>レスポンス保存:</span>
                    <Badge variant={config?.userPreferences.saveResponses ? "default" : "secondary"}>
                      {config?.userPreferences.saveResponses ? "有効" : "無効"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
