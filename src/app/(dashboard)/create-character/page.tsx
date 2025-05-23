"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import Image from "next/image";

export default function CharacterUploadForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    age: 18,
    gender: "female",
    type: "real",
    personality: "",
    isPublic: true,
  });

  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // プロフィール画像の処理
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = new FormData();

      // フォームデータをFormDataに追加
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString());
      });

      // タグをJSON文字列に変換して追加
      submitData.append("tags", JSON.stringify(tags));

      // プロフィール画像を追加
      if (profileImage) {
        submitData.append("profileImage", profileImage);
      }

      // APIエンドポイントにPOSTリクエスト
      const response = await fetch("/api/characters/custom", {
        method: "POST",
        body: submitData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "キャラクターの作成に失敗しました");
      }

      // 成功した場合、キャラクター一覧ページに遷移
      router.push("/characters");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "キャラクターの作成に失敗しました",
      );
    } finally {
      setLoading(false);
    }
  };

  // フォーム入力の更新
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        新しいキャラクターを作成
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 名前 */}
        <div>
          <Label htmlFor="name">名前 *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="キャラクターの名前"
            required
          />
        </div>

        {/* 年齢 */}
        <div>
          <Label htmlFor="age">年齢 *</Label>
          <Input
            id="age"
            name="age"
            type="number"
            min={18}
            max={100}
            value={formData.age}
            onChange={handleChange}
            required
          />
        </div>

        {/* 性別 */}
        <div>
          <Label htmlFor="gender">性別 *</Label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="female">女性</option>
            <option value="male">男性</option>
            <option value="other">その他</option>
          </select>
        </div>

        {/* キャラクタータイプ */}
        <div>
          <Label htmlFor="type">タイプ *</Label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="real">実写</option>
            <option value="anime">アニメ</option>
          </select>
        </div>

        {/* 短い説明 */}
        <div>
          <Label htmlFor="shortDescription">短い説明</Label>
          <Input
            id="shortDescription"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="キャラクターの一言紹介（最大100文字）"
            maxLength={100}
          />
        </div>

        {/* 詳細な説明 */}
        <div>
          <Label htmlFor="description">詳細な説明 *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="キャラクターの詳細な説明（10〜1000文字）"
            rows={5}
            required
          />
        </div>

        {/* 性格 */}
        <div>
          <Label htmlFor="personality">性格 *</Label>
          <Textarea
            id="personality"
            name="personality"
            value={formData.personality}
            onChange={handleChange}
            placeholder="キャラクターの性格（10〜500文字）"
            rows={3}
            required
          />
        </div>

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

        {/* プロファイル画像 */}
        <div>
          <Label htmlFor="profileImage">プロファイル画像 *</Label>
          <Input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="py-2"
            required
          />
          {previewUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-1">プレビュー:</p>
              <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Profile preview"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          )}
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
            {loading ? "作成中..." : "キャラクターを作成する"}
          </Button>
        </div>
      </form>
    </div>
  );
}
