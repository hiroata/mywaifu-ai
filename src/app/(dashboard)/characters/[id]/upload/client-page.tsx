"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Video,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useFormState } from "react-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// キャラクタータイプ
type Character = {
  id: string;
  name: string;
  description: string;
  type: "real" | "anime";
  profileImageUrl: string;
  isPublic: boolean;
};

// コンテンツアップロードコンポーネント
export default function ContentUploadPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contentType, setContentType] = useState<"story" | "image" | "video">(
    "story",
  );
  const [showPreview, setShowPreview] = useState(false);

  // フォームステート
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [storyContent, setStoryContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  // キャラクター情報の取得
  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const response = await fetch(`/api/characters/${params.id}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "キャラクターの取得に失敗しました");
        }

        setCharacter(data.data);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "キャラクターの取得に失敗しました",
        );
      }
    };

    fetchCharacter();
  }, [params.id]);

  // 画像アップロードハンドラー
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 画像プレビューの作成
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  // 動画アップロードハンドラー
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
  };

  // フォーム送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("characterId", params.id);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("contentType", contentType);
      formData.append("isPublic", isPublic.toString());

      if (contentType === "story") {
        formData.append("storyContent", storyContent);
      } else if (contentType === "image" && imageFile) {
        formData.append("file", imageFile);
      } else if (contentType === "video") {
        if (videoFile) {
          formData.append("file", videoFile);
        } else if (videoUrl) {
          formData.append("videoUrl", videoUrl);
        }
      }

      const response = await fetch("/api/content", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "コンテンツのアップロードに失敗しました");
      }

      // 成功したらキャラクターページに戻る
      router.push(`/characters/${params.id}`);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "コンテンツのアップロードに失敗しました",
      );
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={20} />
            <span>{error}</span>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/characters/${params.id}`)}
        >
          <ArrowLeft className="mr-2" size={16} />
          キャラクターページに戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link
          href={`/characters/${params.id}`}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2" size={16} />
          <span>{character?.name || "キャラクター"}ページに戻る</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6">コンテンツをアップロード</h1>

        {character && (
          <div className="flex items-center mb-6">
            <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3">
              <Image
                src={character.profileImageUrl}
                alt={character.name}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div>
              <h2 className="font-semibold">{character.name}</h2>
              <p className="text-sm text-gray-500">
                {character.type === "real" ? "実写" : "アニメ"} キャラクター
              </p>
            </div>
          </div>
        )}

        <Tabs
          value={contentType}
          onValueChange={(value) => setContentType(value as any)}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="story" className="flex items-center gap-1">
              <FileText size={14} />
              <span>小説</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-1">
              <ImageIcon size={14} />
              <span>画像</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-1">
              <Video size={14} />
              <span>動画</span>
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="コンテンツのタイトルを入力"
                />
              </div>

              <div>
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="コンテンツの説明を入力（任意）"
                  rows={2}
                />
              </div>

              <div className="flex items-center">
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="isPublic" className="ml-2">
                  公開する
                </Label>
              </div>

              <TabsContent value="story" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="storyContent">小説本文</Label>
                  <Textarea
                    id="storyContent"
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                    placeholder="小説の内容を入力してください"
                    className="min-h-[300px]"
                    required
                  />
                </div>

                <div>
                  <Dialog
                    open={showPreview}
                    onOpenChange={(open) => setShowPreview(open)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!storyContent}
                      >
                        プレビュー
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>
                          {title || "無題の小説"}
                        </DialogTitle>
                        <DialogDescription>
                          {description || "説明なし"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="max-h-[70vh] overflow-y-auto p-4 my-4 bg-gray-50 rounded-md">
                        {storyContent.split("\n").map((paragraph, index) => (
                          <p
                            key={index}
                            className={`${paragraph ? "mb-4" : "mb-6"}`}
                          >
                            {paragraph || "　"}
                          </p>
                        ))}
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          onClick={() => setShowPreview(false)}
                        >
                          閉じる
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4 mt-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative h-64 w-full">
                        <Image
                          src={imagePreview}
                          alt="プレビュー"
                          fill
                          style={{ objectFit: "contain" }}
                          className="rounded"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        画像を削除
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="imageUpload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <UploadCloud
                          size={48}
                          className="text-gray-400 mb-2"
                        />
                        <p className="text-lg font-medium">
                          画像をアップロード
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          クリックして画像を選択またはドラッグ＆ドロップ
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          PNG, JPG, WEBP, GIF（最大10MB）
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="video" className="space-y-4 mt-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="videoUpload"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  {videoFile ? (
                    <div className="space-y-4">
                      <div className="bg-gray-100 rounded p-4">
                        <p className="font-medium">{videoFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setVideoFile(null)}
                      >
                        動画を削除
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="videoUpload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <UploadCloud
                          size={48}
                          className="text-gray-400 mb-2"
                        />
                        <p className="text-lg font-medium">
                          動画をアップロード
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          クリックして動画を選択またはドラッグ＆ドロップ
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          MP4, WEBM, MOV（最大100MB）
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </TabsContent>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "アップロード中..." : "コンテンツをアップロードする"}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  );
}
