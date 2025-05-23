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
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, FileText, Image as ImageIcon, Video } from "lucide-react";
import Image from "next/image";

type Character = {
  id: string;
  name: string;
  profileImageUrl: string;
};

export default function ContentUploadForm({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [contentType, setContentType] = useState<"story" | "image" | "video">("story");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    storyContent: "",
    isPublic: true,
  });
  
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [character, setCharacter] = useState<Character | null>(null);
  
  // キャラクター情報の取得
  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const response = await fetch(`/api/characters/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          setCharacter(data.data);
        }
      } catch (err) {
        console.error("キャラクター情報の取得に失敗しました", err);
      }
    };
    
    fetchCharacter();
  }, [params.id]);
  
  // タグの追加
  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  // タグの削除
  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // ファイルの処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // 画像の場合はプレビュー表示
      if (contentType === "image" && selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreviewUrl("");
      }
    }
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = new FormData();
      
      // 基本情報
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("contentType", contentType);
      submitData.append("isPublic", formData.isPublic.toString());
      submitData.append("characterId", params.id);
      
      // コンテンツタイプに応じたデータの追加
      if (contentType === "story") {
        submitData.append("storyContent", formData.storyContent);
      } else if ((contentType === "image" || contentType === "video") && file) {
        submitData.append("contentFile", file);
      }
      
      // タグをJSON文字列に変換して追加
      submitData.append("tags", JSON.stringify(tags));
      
      // APIエンドポイントにPOSTリクエスト
      const response = await fetch("/api/content", {
        method: "POST",
        body: submitData,
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "コンテンツのアップロードに失敗しました");
      }
      
      // 成功した場合、キャラクター詳細ページに遷移
      router.push(`/characters/${params.id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "コンテンツのアップロードに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // フォーム入力の更新
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">コンテンツをアップロード</h1>
      
      {character && (
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={character.profileImageUrl}
              alt={character.name}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <span className="font-medium">{character.name}</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <Tabs value={contentType} onValueChange={(value) => setContentType(value as "story" | "image" | "video")}>
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="story" className="flex items-center gap-2">
            <FileText size={16} />
            <span>小説・ストーリー</span>
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <ImageIcon size={16} />
            <span>画像</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video size={16} />
            <span>動画</span>
          </TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 共通フィールド */}
          <div>
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="コンテンツのタイトル"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">説明 *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="コンテンツの説明"
              rows={3}
              required
            />
          </div>
          
          {/* コンテンツタイプ別フィールド */}
          <TabsContent value="story" className="space-y-6">
            <div>
              <Label htmlFor="storyContent">小説・ストーリー内容 *</Label>
              <Textarea
                id="storyContent"
                name="storyContent"
                value={formData.storyContent}
                onChange={handleChange}
                placeholder="小説・ストーリーの内容を入力してください"
                rows={15}
                required={contentType === "story"}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="image" className="space-y-6">
            <div>
              <Label htmlFor="imageFile">画像ファイル *</Label>
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="py-2"
                required={contentType === "image"}
              />
              {previewUrl && contentType === "image" && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">プレビュー:</p>
                  <div className="relative max-w-md h-[300px] rounded-lg overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Image preview"
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="video" className="space-y-6">
            <div>
              <Label htmlFor="videoFile">動画ファイル *</Label>
              <Input
                id="videoFile"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="py-2"
                required={contentType === "video"}
              />
              <p className="text-sm text-gray-500 mt-1">
                対応形式: MP4, WebM, OGG (最大サイズ: 100MB)
              </p>
            </div>
          </TabsContent>
          
          {/* タグ */}
          <div>
            <Label htmlFor="newTag">タグ</Label>
            <div className="flex items-center gap-2">
              <Input
                id="newTag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="タグを入力"
              />
              <Button type="button" onClick={addTag} variant="outline">
                追加
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded-full hover:bg-gray-200 p-1"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          
          {/* 公開設定 */}
          <div className="flex items-center gap-2">
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPublic: checked })
              }
            />
            <Label htmlFor="isPublic">公開する</Label>
          </div>
          
          {/* 送信ボタン */}
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "アップロード中..." : "コンテンツをアップロードする"}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}
