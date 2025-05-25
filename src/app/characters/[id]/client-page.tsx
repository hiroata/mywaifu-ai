"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Heart, MessageCircle, Share2, FileText, ImageIcon, Video, Plus, Star, Clock,
  Send, Bot, User, AlertTriangle, Flame
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// 型定義はファイル先頭に1回のみ

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

type Review = {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type ChatMessage = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

// レビューコンポーネント
const ReviewCard = ({ review }: { review: Review }) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 rounded-xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12 flex-shrink-0 ring-2 ring-purple-100">
            <AvatarImage src={review.userImage || ""} />
            <AvatarFallback>
              <div className="bg-gradient-to-br from-purple-400 to-pink-400 text-white w-full h-full flex items-center justify-center font-semibold">
                {review.userName.charAt(0)}
              </div>
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <span className="font-semibold text-gray-900">{review.userName}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {new Date(review.createdAt).toLocaleDateString("ja-JP")}
                </span>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
          </div>
        </div>
      </div>
    </Card>
  );
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
    <Card className="h-full flex flex-col bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/20 rounded-xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2 text-gray-800">{content.title}</CardTitle>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {content.contentType === "story" && (
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-2 rounded-full">
                <FileText size={16} className="text-blue-600" />
              </div>
            )}
            {content.contentType === "image" && (
              <div className="bg-gradient-to-r from-green-100 to-blue-100 p-2 rounded-full">
                <ImageIcon size={16} className="text-green-600" />
              </div>
            )}
            {content.contentType === "video" && (
              <div className="bg-gradient-to-r from-red-100 to-pink-100 p-2 rounded-full">
                <Video size={16} className="text-red-600" />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">          <Avatar className="w-6 h-6 ring-1 ring-purple-200">
            <AvatarImage src={content.user.image || ""} />
            <AvatarFallback>
              <div className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-xs w-full h-full flex items-center justify-center">
                {content.user.name.charAt(0)}
              </div>
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{content.user.name}</span>
          <span className="text-gray-400">•</span>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{new Date(content.createdAt).toLocaleDateString("ja-JP")}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pt-0">
        {content.contentType === "image" && content.contentUrl && (
          <div className="relative h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            <Image
              src={content.contentUrl}
              alt={content.title}
              fill
              style={{ objectFit: "cover" }}
              className="transition-transform duration-300 hover:scale-110"
            />
          </div>
        )}
        {content.contentType === "video" && content.contentUrl && (
          <div className="relative h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            <video
              src={content.contentUrl}
              className="w-full h-full object-cover"
              controls
              preload="metadata"
            />
          </div>
        )}
        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
          {content.description}
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-purple-50">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-all duration-300 ${
              liked ? "text-pink-500 scale-110" : "text-gray-500 hover:text-pink-500 hover:scale-105"
            }`}
          >
            <Heart size={18} className={liked ? "fill-pink-500" : ""} />
            <span className="text-sm font-medium">{content.likes + (liked ? 1 : 0)}</span>
          </button>
          <div className="flex items-center gap-2 text-gray-500">
            <MessageCircle size={18} />
            <span className="text-sm">0</span>
          </div>
        </div>
        <Link href={`/content/${content.id}`}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg font-medium transition-all duration-300"
          >
            詳細を見る
          </Button>
        </Link>
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [contentType, setContentType] = useState<
    "profile" | "reviews" | "content" | "related" | "chat"
  >("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // チャット機能のステート
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // キャラクター、コンテンツ、レビューの取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // キャラクター情報を取得（認証不要のAPIエンドポイント）
        const characterResponse = await fetch(`/api/characters/public/${params.id}`);
        const characterData = await characterResponse.json();

        if (!characterData.success) {
          throw new Error(
            characterData.error || "キャラクターの取得に失敗しました",
          );
        }

        setCharacter(characterData.data);

        // キャラクターのコンテンツを取得
        const contentsResponse = await fetch(
          `/api/content/public?characterId=${params.id}`,
        );
        const contentsData = await contentsResponse.json();

        if (contentsData.success) {
          setContents(contentsData.data.items || []);
        }

        // レビューを取得（サンプルデータ）
        setReviews([
          {
            id: "1",
            userId: "user1",
            userName: "ユーザー1",
            rating: 5,
            comment: "とても魅力的なキャラクターです！チャットが楽しいです。",
            createdAt: "2024-01-15",
          },
          {
            id: "2",
            userId: "user2",
            userName: "ユーザー2",
            rating: 4,
            comment: "性格設定がリアルで会話に引き込まれます。",
            createdAt: "2024-01-10",
          },
          {
            id: "3",
            userId: "user3",
            userName: "ユーザー3",
            rating: 5,
            comment: "毎日話しかけたくなるキャラクターです。",
            createdAt: "2024-01-05",
          },
        ]);
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
  const storyContents = contents.filter((content) => content.contentType === "story");
  const imageContents = contents.filter((content) => content.contentType === "image");
  const videoContents = contents.filter((content) => content.contentType === "video");

  // チャット送信機能
  const sendMessage = async () => {
    if (!chatInput.trim() || isChatLoading || !character) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: chatInput.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsChatLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatInput.trim(),
          characterId: character.id,
          characterName: character.name,
          characterPersonality: character.personality,
          characterDescription: character.description,
        }),
      });

      if (!response.ok) {
        throw new Error('チャットの送信に失敗しました');
      }

      const data = await response.json();
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.message || "申し訳ございません。今お返事できません。",
        isUser: false,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('チャットエラー:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "申し訳ございません。エラーが発生しました。もう一度お試しください。",
        isUser: false,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
          <Button onClick={() => router.push("/")}>
            ホームに戻る
          </Button>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto py-8 px-4 lg:px-8">
        {/* キャラクタープロフィールセクション */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden mb-8 border border-white/20">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/3 relative">
              <div className="relative h-[320px] lg:h-[520px] w-full overflow-hidden">
                <Image
                  src={character.profileImageUrl}
                  alt={character.name}
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-t-2xl lg:rounded-tr-none lg:rounded-l-2xl transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent lg:hidden" />
              </div>
              {/* モバイル用の浮遊効果 */}
              <div className="absolute bottom-4 left-4 lg:hidden">
                <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(averageRating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-2/3 p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6">
                <div className="mb-6 lg:mb-0">
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    {character.name}
                  </h1>
                  <div className="flex flex-wrap items-center text-gray-600 mb-3 gap-3">
                    {character.age && (
                      <div className="flex items-center gap-1 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium">{character.age}歳</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium">
                        {character.gender === "female"
                          ? "女性"
                          : character.gender === "male"
                            ? "男性"
                            : "その他"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-gradient-to-r from-green-100 to-blue-100 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium">{character.type === "real" ? "実写" : "アニメ"}</span>
                    </div>
                  </div>
                  <div className="hidden lg:flex items-center gap-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(averageRating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {averageRating.toFixed(1)} ({reviews.length}件のレビュー)
                    </span>
                  </div>
                </div>
                <Link href={`/register?redirect=/chat/${params.id}`} className="w-full lg:w-auto">
                  <Button 
                    size="lg"
                    className="w-full lg:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    このキャラクターとチャットする
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {character.tags.map((tag) => (
                  <Badge 
                    key={tag.id} 
                    variant="secondary"
                    className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 hover:from-purple-200 hover:to-pink-200 transition-all duration-300 px-3 py-1"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    自己紹介
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {character.shortDescription || character.description}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-500" />
                    性格
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{character.personality}</p>
                </div>
              </div>
            </div>
          </div>
        </div>        {/* タブ式コンテンツセクション */}
        <div className="mb-8">          <Tabs
            value={contentType}
            onValueChange={(value) =>
              setContentType(value as "profile" | "reviews" | "content" | "related" | "chat")
            }
          >
            <TabsList className="mb-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-1">
              <TabsTrigger 
                value="profile"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg font-medium transition-all duration-300"
              >
                プロフィール
              </TabsTrigger>
              <TabsTrigger 
                value="chat"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg font-medium transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                チャット
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg font-medium transition-all duration-300"
              >
                口コミ ({reviews.length})
              </TabsTrigger>
              <TabsTrigger 
                value="content"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg font-medium transition-all duration-300"
              >
                関連小説 ({storyContents.length})
              </TabsTrigger>
              <TabsTrigger 
                value="related"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg font-medium transition-all duration-300"
              >
                関連動画 ({videoContents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-0">
              <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 h-[600px] flex flex-col">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 ring-2 ring-purple-200">
                      <AvatarImage src={character?.profileImageUrl} />
                      <AvatarFallback>
                        <div className="bg-gradient-to-br from-purple-400 to-pink-400 text-white w-full h-full flex items-center justify-center font-semibold">
                          {character?.name.charAt(0)}
                        </div>
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-800">{character?.name}とのチャット</h3>
                      <p className="text-sm text-gray-600">
                        {isTyping ? "入力中..." : "オンライン"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                        <MessageCircle className="w-10 h-10 text-purple-500" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        {character?.name}と話してみましょう！
                      </h4>
                      <p className="text-gray-600 max-w-md">
                        何でも気軽に話しかけてください。{character?.name}があなたとの会話を楽しみにしています。
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                        <div className={`flex gap-3 max-w-[80%] ${message.isUser ? "flex-row-reverse" : "flex-row"}`}>
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            {message.isUser ? (
                              <AvatarFallback>
                                <User className="w-4 h-4" />
                              </AvatarFallback>
                            ) : (
                              <AvatarImage src={character?.profileImageUrl} />
                            )}
                            {!message.isUser && (
                              <AvatarFallback>
                                <Bot className="w-4 h-4" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className={`rounded-2xl px-4 py-3 ${
                            message.isUser
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.isUser ? "text-purple-100" : "text-gray-500"
                            }`}>
                              {message.timestamp.toLocaleTimeString("ja-JP", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[80%]">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={character?.profileImageUrl} />
                          <AvatarFallback>
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 rounded-2xl px-4 py-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="border-t border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-b-2xl">
                  <div className="flex gap-3 w-full">
                    <Input
                      placeholder={`${character?.name}にメッセージを送る...`}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isChatLoading}
                      className="flex-1 rounded-xl border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!chatInput.trim() || isChatLoading}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-6 transition-all duration-300"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>              </Card>
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <Card className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  詳細プロフィール
                </h3>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                    <h4 className="font-semibold text-lg mb-4 text-gray-800 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-purple-500" />
                      基本情報
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/60 rounded-lg p-4">
                        <span className="text-gray-600 text-sm">名前</span>
                        <div className="font-medium text-gray-800 mt-1">{character.name}</div>
                      </div>
                      {character.age && (
                        <div className="bg-white/60 rounded-lg p-4">
                          <span className="text-gray-600 text-sm">年齢</span>
                          <div className="font-medium text-gray-800 mt-1">{character.age}歳</div>
                        </div>
                      )}
                      <div className="bg-white/60 rounded-lg p-4">
                        <span className="text-gray-600 text-sm">性別</span>
                        <div className="font-medium text-gray-800 mt-1">
                          {character.gender === "female"
                            ? "女性"
                            : character.gender === "male"
                              ? "男性"
                              : "その他"}
                        </div>
                      </div>
                      <div className="bg-white/60 rounded-lg p-4">
                        <span className="text-gray-600 text-sm">タイプ</span>
                        <div className="font-medium text-gray-800 mt-1">
                          {character.type === "real" ? "実写" : "アニメ"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <h4 className="font-semibold text-lg mb-4 text-gray-800 flex items-center gap-2">
                      <Star className="w-5 h-5 text-blue-500" />
                      性格・特徴
                    </h4>
                    <div className="bg-white/60 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">
                        {character.personality}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
                    <h4 className="font-semibold text-lg mb-4 text-gray-800 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-500" />
                      詳細説明
                    </h4>
                    <div className="bg-white/60 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">
                        {character.description}
                      </p>
                    </div>                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-0">
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {/* レビュー統計とキャラクター画像ギャラリー */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                    <div className="grid lg:grid-cols-2 gap-8">
                      {/* レビュー統計 */}
                      <div className="flex items-center gap-6">
                        <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {averageRating.toFixed(1)}
                        </div>
                        <div>
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-6 h-6 ${
                                  i < Math.floor(averageRating)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-600 font-medium">
                            {reviews.length}件のレビュー
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            ユーザーからの評価
                          </p>
                        </div>
                      </div>
                      
                      {/* キャラクター画像ギャラリー */}
                      <div>
                        <h4 className="text-lg font-semibold mb-3 text-gray-800">
                          {character.name}のギャラリー
                        </h4>
                        <div className="grid grid-cols-5 gap-2">
                          {[1,2,3,4,5].map((index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                              <Image
                                src={character.profileImageUrl}
                                alt={`${character.name} - 画像 ${index}`}
                                fill
                                style={{ objectFit: "cover" }}
                                className="transition-transform duration-300 hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-12 h-12 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    まだレビューがありません
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    最初のレビューを投稿してみませんか？このキャラクターとチャットして、体験をシェアしてください。
                  </p>
                  <Link href={`/register?redirect=/chat/${params.id}`}>
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      チャットしてレビューする
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="content" className="mt-0">
              {storyContents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {storyContents.map((content) => (
                    <ContentCard key={content.id} content={content} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-12 h-12 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    関連小説がありません
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    このキャラクターに関する小説がまだ投稿されていません。あなたが最初の作者になりませんか？
                  </p>
                  <Link href={`/register?redirect=/characters/${params.id}/upload`}>
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      小説を投稿する
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="related" className="mt-0">
              {videoContents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {videoContents.map((content) => (
                    <ContentCard key={content.id} content={content} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                  <div className="bg-gradient-to-r from-red-100 to-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Video className="w-12 h-12 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    関連動画がありません
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    このキャラクターに関する動画がまだ投稿されていません。創造性を発揮して動画を作成してみませんか？
                  </p>
                  <Link href={`/register?redirect=/characters/${params.id}/upload`}>
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      動画を投稿する
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
