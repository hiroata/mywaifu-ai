"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  Share2,
  FileText,
  ImageIcon,
  Video,
  Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Character = {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  age?: number;
  gender: "male" | "female" | "other";
  type: "real" | "anime";
  personality: string;
  profileImageUrl: string;
  tags: { id: string; name: string }[];
  isPublic: boolean;
  isCustom?: boolean;
};

type CharacterContent = {
  id: string;
  title: string;
  description: string;
  contentType: "story" | "image" | "video";
  contentUrl?: string;
  storyContent?: string;
  likes: number;
  views: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
};

// コンテンツカードコンポーネント
const ContentCard = ({ content }: { content: CharacterContent }) => {
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/content/${content.id}/like`, {
        method: "POST",
      });
      if (response.ok) {
        setLiked(!liked);
      }
    } catch (error) {
      console.error("いいね処理に失敗しました", error);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{content.title}</CardTitle>
          <div className="flex items-center gap-2">
            {content.contentType === "story" && <FileText size={16} />}
            {content.contentType === "image" && <ImageIcon size={16} />}
            {content.contentType === "video" && <Video size={16} />}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Avatar className="w-6 h-6">
            <AvatarImage src={content.user.image || ""} />
            <AvatarFallback>{content.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{content.user.name}</span>
          <span>•</span>
          <span>{new Date(content.createdAt).toLocaleDateString("ja-JP")}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        {content.contentType === "story" ? (
          <div className="text-sm line-clamp-4">{content.storyContent}</div>
        ) : content.contentType === "image" ? (
          <div className="relative h-48 w-full">
            <Image
              src={content.contentUrl || ""}
              alt={content.title}
              fill
              className="object-cover rounded"
            />
          </div>
        ) : (
          <div className="relative h-48 w-full bg-gray-100 rounded flex items-center justify-center">
            <Video size={24} className="text-gray-400" />
            <span className="text-sm text-gray-500 ml-2">動画コンテンツ</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t pt-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 ${liked ? "text-pink-500" : ""}`}
            >
              <Heart size={18} className={liked ? "fill-pink-500" : ""} />
              <span>{content.likes + (liked ? 1 : 0)}</span>
            </button>
            <div className="flex items-center gap-1">
              <MessageCircle size={18} />
              <span>0</span>
            </div>
          </div>
          <Link href={`/content/${content.id}`}>
            <Button variant="ghost" size="sm">
              詳細を見る
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default function CharacterDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [contents, setContents] = useState<CharacterContent[]>([]);
  const [contentType, setContentType] = useState<
    "all" | "story" | "image" | "video"
  >("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // キャラクターとコンテンツの取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // キャラクター情報を取得
        const characterResponse = await fetch(`/api/characters/${params.id}`);
        const characterData = await characterResponse.json();

        if (!characterData.success) {
          throw new Error(
            characterData.error || "キャラクターの取得に失敗しました",
          );
        }

        setCharacter(characterData.data);

        // キャラクターのコンテンツを取得
        const contentsResponse = await fetch(
          `/api/content?characterId=${params.id}`,
        );
        const contentsData = await contentsResponse.json();

        if (!contentsData.success) {
          throw new Error(
            contentsData.error || "コンテンツの取得に失敗しました",
          );
        }

        setContents(contentsData.data.items);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "データの取得に失敗しました",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // フィルター適用済みのコンテンツ
  const filteredContents =
    contentType === "all"
      ? contents
      : contents.filter((content) => content.contentType === contentType);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            キャラクターが見つかりませんでした
          </h1>
          <Button onClick={() => router.push("/characters")}>
            キャラクター一覧に戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* キャラクタープロフィールセクション */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/3">
            <div className="relative h-[300px] md:h-full w-full">
              <Image
                src={character.profileImageUrl}
                alt={character.name}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold">{character.name}</h1>
                <div className="flex items-center text-gray-600 mt-1">
                  {character.age && (
                    <span className="mr-3">{character.age}歳</span>
                  )}
                  <span className="mr-3">
                    {character.gender === "female"
                      ? "女性"
                      : character.gender === "male"
                        ? "男性"
                        : "その他"}
                  </span>
                  <span>{character.type === "real" ? "実写" : "アニメ"}</span>
                </div>
              </div>
              <Link href={`/chat/${params.id}`}>
                <Button>このキャラクターとチャットする</Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {character.tags.map((tag) => (
                <Badge key={tag.id}>{tag.name}</Badge>
              ))}
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-1">自己紹介</h3>
              <p className="text-gray-700">
                {character.shortDescription || character.description}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-1">性格</h3>
              <p className="text-gray-700">{character.personality}</p>
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツセクション */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">コンテンツ</h2>
          <Link href={`/characters/${params.id}/upload`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus size={16} />
              <span>アップロード</span>
            </Button>
          </Link>
        </div>

        <Tabs
          value={contentType}
          onValueChange={(value) =>
            setContentType(value as "all" | "story" | "image" | "video")
          }
        >
          <TabsList className="mb-6">
            <TabsTrigger value="all">すべて</TabsTrigger>
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

          <TabsContent value="all" className="mt-0">
            {filteredContents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContents.map((content) => (
                  <ContentCard key={content.id} content={content} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-medium mb-2">
                  コンテンツがありません
                </h3>
                <p className="text-gray-500 mb-4">
                  このキャラクターに関するコンテンツをアップロードしましょう
                </p>
                <Link href={`/characters/${params.id}/upload`}>
                  <Button>コンテンツをアップロード</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="story" className="mt-0">
            {filteredContents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContents.map((content) => (
                  <ContentCard key={content.id} content={content} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-medium mb-2">
                  小説コンテンツがありません
                </h3>
                <p className="text-gray-500 mb-4">
                  このキャラクターに関する小説を書いてみましょう
                </p>
                <Link href={`/characters/${params.id}/upload`}>
                  <Button>小説をアップロード</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="image" className="mt-0">
            {filteredContents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContents.map((content) => (
                  <ContentCard key={content.id} content={content} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-medium mb-2">
                  画像コンテンツがありません
                </h3>
                <p className="text-gray-500 mb-4">
                  このキャラクターに関する画像をアップロードしましょう
                </p>
                <Link href={`/characters/${params.id}/upload`}>
                  <Button>画像をアップロード</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="video" className="mt-0">
            {filteredContents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContents.map((content) => (
                  <ContentCard key={content.id} content={content} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-medium mb-2">
                  動画コンテンツがありません
                </h3>
                <p className="text-gray-500 mb-4">
                  このキャラクターに関する動画をアップロードしましょう
                </p>
                <Link href={`/characters/${params.id}/upload`}>
                  <Button>動画をアップロード</Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
