"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  BookMarked,
  BookmarkPlus,
  Flag,
  MoreHorizontal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type ContentDetail = {
  id: string;
  title: string;
  description: string;
  contentType: "story" | "image" | "video";
  contentUrl?: string;
  storyContent?: string;
  likes: number;
  views: number;
  createdAt: string;
  character: {
    id: string;
    name: string;
    profileImageUrl: string;
  };
  user: {
    id: string;
    name: string;
    image?: string;
  };
  comments: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      image?: string;
    };
  }[];
};

// コメントコンポーネント
const Comment = ({ comment }: { comment: ContentDetail["comments"][0] }) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="py-4">
      <div className="flex gap-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={comment.user.image || ""} />
          <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{comment.user.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString("ja-JP")}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem>
                  <Flag className="mr-2 h-4 w-4" />
                  <span>報告する</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="mt-2">{comment.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center gap-1 ${
                isLiked ? "text-blue-500" : ""
              }`}
            >
              <ThumbsUp
                size={14}
                className={isLiked ? "fill-blue-500" : ""}
              />
              <span className="text-xs">いいね</span>
            </button>
            <button className="flex items-center gap-1">
              <ThumbsDown size={14} />
              <span className="text-xs">よくないね</span>
            </button>
            <button className="flex items-center gap-1">
              <MessageCircle size={14} />
              <span className="text-xs">返信</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ContentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // コンテンツ情報の取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // APIからコンテンツ情報を取得
        const response = await fetch(`/api/content/${params.id}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "コンテンツの取得に失敗しました");
        }

        setContent(data.data);
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

  const handleLike = async () => {
    if (!content) return;

    try {
      const response = await fetch(`/api/content/${content.id}/like`, {
        method: "POST",
      });
      if (response.ok) {
        setIsLiked(!isLiked);
        setContent((prev) =>
          prev ? { ...prev, likes: prev.likes + (isLiked ? -1 : 1) } : null,
        );
      }
    } catch (error) {
      console.error("いいね処理に失敗しました", error);
    }
  };

  const handleBookmark = async () => {
    if (!content) return;

    try {
      const response = await fetch(`/api/content/${content.id}/bookmark`, {
        method: "POST",
      });
      if (response.ok) {
        setIsBookmarked(!isBookmarked);
      }
    } catch (error) {
      console.error("ブックマーク処理に失敗しました", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !content) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/content/${content.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: commentText }),
      });

      if (!response.ok) {
        throw new Error("コメントの投稿に失敗しました");
      }

      const data = await response.json();
      
      // コメント追加成功
      setContent((prev) => 
        prev ? { 
          ...prev, 
          comments: [...prev.comments, data.data] 
        } : null
      );
      setCommentText("");
    } catch (error) {
      console.error("コメント投稿に失敗しました", error);
    } finally {
      setIsSubmitting(false);
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

  if (!content) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            コンテンツが見つかりませんでした
          </h1>
          <Button onClick={() => router.push("/content")}>
            コンテンツ一覧に戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* ナビゲーション */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
      </div>

      {/* コンテンツ表示 */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{content.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Link href={`/characters/${content.character.id}`}>
                  <div className="flex items-center gap-2 text-sm">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={content.character.profileImageUrl} />
                      <AvatarFallback>
                        {content.character.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{content.character.name}</span>
                  </div>
                </Link>
                <span className="text-gray-500 text-sm mx-2">•</span>
                <div className="flex items-center gap-2 text-sm">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={content.user.image || ""} />
                    <AvatarFallback>{content.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{content.user.name}</span>
                </div>
                <span className="text-gray-500 text-sm mx-2">•</span>
                <span className="text-gray-500 text-sm">
                  {new Date(content.createdAt).toLocaleDateString("ja-JP")}
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  <span>共有</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Flag className="mr-2 h-4 w-4" />
                  <span>報告する</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          {content.description && (
            <p className="text-gray-700 mb-6">{content.description}</p>
          )}

          {content.contentType === "story" ? (
            <div className="prose max-w-none">
              {content.storyContent?.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : content.contentType === "image" ? (
            <div className="relative w-full max-w-3xl mx-auto">
              <Image
                src={content.contentUrl || ""}
                alt={content.title}
                width={800}
                height={600}
                className="rounded-lg object-cover"
              />
            </div>
          ) : (
            <div className="relative w-full max-w-3xl mx-auto aspect-video">
              <video
                controls
                className="rounded-lg w-full h-full"
                src={content.contentUrl}
              >
                お使いのブラウザはビデオタグをサポートしていません。
              </video>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t pt-4 flex flex-col items-stretch">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 ${
                  isLiked ? "text-pink-500" : ""
                }`}
              >
                <Heart
                  size={20}
                  className={isLiked ? "fill-pink-500" : ""}
                />
                <span>{content.likes + (isLiked ? 1 : 0)}</span>
              </button>
              <div className="flex items-center gap-2">
                <MessageCircle size={20} />
                <span>{content.comments.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBookmark}
                  className={isBookmarked ? "text-blue-500" : ""}
                >
                  {isBookmarked ? (
                    <BookMarked size={20} className="fill-blue-500" />
                  ) : (
                    <BookmarkPlus size={20} />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 size={16} />
                <span>共有</span>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* コメントセクション */}
      <Card>
        <CardHeader>
          <CardTitle>コメント ({content.comments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* コメント入力フォーム */}
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <div className="flex gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={content.user.image || ""} />
                <AvatarFallback>{content.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="コメントを入力..."
                  className="mb-2"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <Button type="submit" disabled={isSubmitting || !commentText.trim()}>
                  {isSubmitting ? "投稿中..." : "コメントする"}
                </Button>
              </div>
            </div>
          </form>

          {/* コメント一覧 */}
          {content.comments.length > 0 ? (
            <div>
              {content.comments.map((comment, index) => (
                <div key={comment.id}>
                  <Comment comment={comment} />
                  {index < content.comments.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              まだコメントはありません。最初のコメントを投稿しましょう！
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
