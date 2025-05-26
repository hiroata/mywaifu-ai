"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Sparkles, Download, Heart, Settings, RefreshCw } from "lucide-react";

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  style: string;
  character?: {
    id: string;
    name: string;
  };
}

export function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<"anime" | "realistic">("anime");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [generationCount, setGenerationCount] = useState<number | null>(null);
  
  // 詳細設定パラメータ
  const [advancedParams, setAdvancedParams] = useState({
    steps: 20,
    cfg_scale: 7,
    width: 512,
    height: 768,
    sampler: "DPM++ 2M",
    seed: -1,
    model: ""
  });

  // 利用可能なモデルとサンプラー
  const availableModels = {
    anime: [
      { name: "🐼_illustriousPencilXL_v200", title: "Illustrious Pencil XL v2.0 (推奨)" },
      { name: "🐼_Illustrious-XL-v0.1", title: "Illustrious XL v0.1" },
      { name: "🐼_Anime_Screencap_Enhancement-v1", title: "Anime Screencap Enhancement" },
      { name: "animaPencilXL_v500", title: "Anima Pencil XL v5.0" }
    ],
    realistic: [
      { name: "📷️_beautifulRealistic_brav5", title: "Beautiful Realistic v5 (推奨)" },
      { name: "sd_xl_base_1.0", title: "Stable Diffusion XL Base" }
    ]
  };

  const availableSamplers = [
    "DPM++ 2M", "DPM++ SDE", "DPM++ 2M SDE", "Euler a", "Euler", 
    "LMS", "Heun", "DDIM", "UniPC", "LCM"
  ];
  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("プロンプトを入力してください");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          // 詳細パラメータを追加
          steps: advancedParams.steps,
          cfg_scale: advancedParams.cfg_scale,
          width: advancedParams.width,
          height: advancedParams.height,
          sampler_name: advancedParams.sampler,
          seed: advancedParams.seed,
          model_name: advancedParams.model || (style === 'anime' ? '🐼_illustriousPencilXL_v200' : '📷️_beautifulRealistic_brav5')
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "画像生成に失敗しました");
      }

      setGeneratedImage({
        id: data.id,
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        style: data.style,
      });

      setGenerationCount(data.remainingGenerations);
      toast.success("画像が生成されました！");

    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "画像生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAsCharacter = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch("/api/save-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: generatedImage.imageUrl,
          prompt: generatedImage.prompt,
          style: generatedImage.style,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "キャラクター保存に失敗しました");
      }

      setGeneratedImage(prev => prev ? {
        ...prev,
        character: {
          id: data.character.id,
          name: data.character.name,
        }
      } : null);

      toast.success(`キャラクター「${data.character.name}」として保存されました！`);

    } catch (error) {
      console.error("Save error:", error);
      toast.error(error instanceof Error ? error.message : "保存に失敗しました");
    }
  };
  const presetPrompts = {
    anime: [
      "美しい日本人女性、アニメスタイル、制服、学校の背景",
      "かわいい女の子、ピンクの髪、大きな目、笑顔",
      "エレガントな女性、ロングヘア、ドレス、夕日の背景",
      "元気な女の子、ツインテール、カジュアル服装",
    ],
    realistic: [
      "美しい日本人女性、自然な笑顔、カジュアル服装",
      "エレガントな女性、ビジネススーツ、オフィス背景",
      "かわいい女性、カフェでコーヒーを飲んでいる",
      "スポーティーな女性、ジム服装、フィットネス",
    ],
  };

  // クイックテスト機能
  const quickTest = async (testPrompt: string, testParams: Partial<typeof advancedParams> = {}) => {
    const originalPrompt = prompt;
    const originalParams = { ...advancedParams };
    
    setPrompt(testPrompt);
    setAdvancedParams(prev => ({ ...prev, ...testParams }));
    
    // 少し待ってから生成実行
    setTimeout(() => {
      generateImage();
      // 元の設定に戻す
      setTimeout(() => {
        setPrompt(originalPrompt);
        setAdvancedParams(originalParams);
      }, 500);
    }, 100);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="h-6 w-6 text-pink-500" />
          AI画像生成
        </CardTitle>
        <CardDescription className="text-gray-400">
          あなただけのオリジナルキャラクターを生成しましょう
          {generationCount !== null && (
            <Badge variant="secondary" className="ml-2">
              残り生成回数: {generationCount}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">        {/* スタイル選択 */}
        <div className="space-y-2">
          <Label htmlFor="style" className="text-white">スタイル</Label>
          <Select value={style} onValueChange={(value: "anime" | "realistic") => {
            setStyle(value);
            setAdvancedParams(prev => ({
              ...prev,
              model: "",
              width: value === "anime" ? 512 : 512,
              height: value === "anime" ? 768 : 768
            }));
          }}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="anime">アニメスタイル</SelectItem>
              <SelectItem value="realistic">リアリスティック</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 詳細設定 */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="advanced" className="border-gray-700">
            <AccordionTrigger className="text-white hover:text-gray-300">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                詳細設定
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* モデル選択 */}
                <div className="space-y-2">
                  <Label className="text-white">モデル</Label>
                  <Select 
                    value={advancedParams.model} 
                    onValueChange={(value) => setAdvancedParams(prev => ({...prev, model: value}))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="デフォルトモデルを使用" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {availableModels[style].map((model) => (
                        <SelectItem key={model.name} value={model.name}>
                          {model.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* サンプラー選択 */}
                <div className="space-y-2">
                  <Label className="text-white">サンプラー</Label>
                  <Select 
                    value={advancedParams.sampler} 
                    onValueChange={(value) => setAdvancedParams(prev => ({...prev, sampler: value}))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {availableSamplers.map((sampler) => (
                        <SelectItem key={sampler} value={sampler}>
                          {sampler}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* ステップ数 */}
                <div className="space-y-2">
                  <Label className="text-white">ステップ数: {advancedParams.steps}</Label>
                  <Input
                    type="range"
                    min="10"
                    max="50"
                    value={advancedParams.steps}
                    onChange={(e) => setAdvancedParams(prev => ({...prev, steps: parseInt(e.target.value)}))}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                {/* CFG Scale */}
                <div className="space-y-2">
                  <Label className="text-white">CFG Scale: {advancedParams.cfg_scale}</Label>
                  <Input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={advancedParams.cfg_scale}
                    onChange={(e) => setAdvancedParams(prev => ({...prev, cfg_scale: parseFloat(e.target.value)}))}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                {/* 解像度設定 */}
                <div className="space-y-2">
                  <Label className="text-white">幅</Label>
                  <Select 
                    value={advancedParams.width.toString()} 
                    onValueChange={(value) => setAdvancedParams(prev => ({...prev, width: parseInt(value)}))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="512">512px</SelectItem>
                      <SelectItem value="768">768px</SelectItem>
                      <SelectItem value="1024">1024px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">高さ</Label>
                  <Select 
                    value={advancedParams.height.toString()} 
                    onValueChange={(value) => setAdvancedParams(prev => ({...prev, height: parseInt(value)}))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="512">512px</SelectItem>
                      <SelectItem value="768">768px</SelectItem>
                      <SelectItem value="1024">1024px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* シード値 */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-white">シード値 (-1 でランダム)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={advancedParams.seed}
                      onChange={(e) => setAdvancedParams(prev => ({...prev, seed: parseInt(e.target.value) || -1}))}
                      placeholder="-1"
                      className="bg-gray-800 border-gray-700 text-white flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setAdvancedParams(prev => ({...prev, seed: Math.floor(Math.random() * 4294967295)}))}
                      className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* プリセットプロンプト */}
        <div className="space-y-2">
          <Label className="text-white">プリセットプロンプト</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {presetPrompts[style].map((presetPrompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start text-left bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                onClick={() => setPrompt(presetPrompt)}
              >
                {presetPrompt}
              </Button>
            ))}
          </div>
        </div>        {/* プロンプト入力 */}
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-white">プロンプト</Label>
          <Textarea
            id="prompt"
            placeholder="生成したい画像の詳細を日本語で入力してください..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
          />
        </div>

        {/* クイックテストボタン */}
        <div className="space-y-2">
          <Label className="text-white">クイックテスト</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickTest("beautiful anime girl, simple test", { steps: 10, width: 512, height: 512 })}
              disabled={isGenerating}
              className="bg-blue-800 border-blue-700 text-white hover:bg-blue-700"
            >
              高速テスト
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickTest("beautiful anime girl, detailed", { steps: 20, width: 512, height: 768 })}
              disabled={isGenerating}
              className="bg-green-800 border-green-700 text-white hover:bg-green-700"
            >
              標準テスト
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickTest("beautiful realistic woman, photorealistic", { steps: 25, width: 768, height: 1024, sampler: "DPM++ 2M SDE" })}
              disabled={isGenerating}
              className="bg-purple-800 border-purple-700 text-white hover:bg-purple-700"
            >
              高品質テスト
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickTest("test image generation", { seed: 123456, steps: 15 })}
              disabled={isGenerating}
              className="bg-orange-800 border-orange-700 text-white hover:bg-orange-700"
            >
              シード固定テスト
            </Button>
          </div>
        </div>

        {/* 生成ボタン */}
        <Button
          onClick={generateImage}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              画像を生成
            </>
          )}
        </Button>

        {/* 生成結果 */}
        {generatedImage && (
          <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
            <div className="flex flex-col md:flex-row gap-4">
              {/* 生成画像 */}
              <div className="flex-1">
                <img
                  src={generatedImage.imageUrl}
                  alt="Generated character"
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                />
              </div>
              
              {/* 画像情報 */}
              <div className="flex-1 space-y-3">
                <div>
                  <Label className="text-white text-sm">スタイル</Label>
                  <Badge variant="secondary" className="ml-2">
                    {generatedImage.style === "anime" ? "アニメ" : "リアリスティック"}
                  </Badge>
                </div>
                
                <div>
                  <Label className="text-white text-sm">プロンプト</Label>
                  <p className="text-gray-300 text-sm mt-1 p-2 bg-gray-700 rounded">
                    {generatedImage.prompt}
                  </p>
                </div>

                {/* アクションボタン */}
                <div className="flex flex-col sm:flex-row gap-2">
                  {!generatedImage.character ? (
                    <Button
                      onClick={saveAsCharacter}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      キャラクターとして保存
                    </Button>
                  ) : (
                    <div className="flex-1 p-2 bg-green-900 border border-green-700 rounded text-green-300 text-sm">
                      ✓ 「{generatedImage.character.name}」として保存済み
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedImage.imageUrl;
                      link.download = `generated-${Date.now()}.png`;
                      link.click();
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    ダウンロード
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
