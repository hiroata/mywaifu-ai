"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, ArrowLeft, ThumbsUp, ThumbsDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type ContentDetail = {
  id: string;
  title: string;
  description: string;
  contentType: 'story' | 'image' | 'video';
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
  character: {
    id: string;
    name: string;
    profileImageUrl: string;
  };
  comments: {
    id: string;
    userId: string;
    userName: string;
    userImage?: string;
    comment: string;
    createdAt: string;
  }[];
};

export default function ContentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [liked, setLiked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // コンテンツデータの取得
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/content/${params.id}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "コンテンツの取得に失敗しました");
        }
        
        setContent(data.data);
        
        // 閲覧数をカウント
        fetch(`/api/content/${params.id}/view`, {
          method: "POST",
        }).catch(console.error);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "コンテンツの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [params.id]);
  
  // いいね機能
  const handleLike = async () => {
    if (!content) return;
    
    try {
      const response = await fetch(`/api/content/${content.id}/like`, {
        method: "POST",
      });
      
      if (response.ok) {
        setLiked(!liked);
        setContent({
          ...content,
          likes: liked ? content.likes - 1 : content.likes + 1,
        });
      }
    } catch (error) {
      console.error("いいね処理に失敗しました", error);
    }
  };
    // コメント投稿
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !newComment.trim()) return;
    
    try {
      const response = await fetch(`/api/content/${content.id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: newComment }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // コメントを追加して表示を更新
        setContent({
          ...content,
          comments: [
            ...content.comments,
            {
              id: data.data.id,
              userId: data.data.userId,
              userName: data.data.userName,
              userImage: data.data.userImage,
              comment: newComment,
              createdAt: new Date().toISOString(),
            },
          ],
        });
        setNewComment("");
      }
    } catch (error) {
      console.error("コメント投稿に失敗しました", error);
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
          <h1 className="text-2xl font-bold mb-4">コンテンツが見つかりませんでした</h1>
          <Button onClick={() => router.push("/")}>
            トップページに戻る
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      {/* 戻るボタン */}
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft size={16} className="mr-2" />
        戻る
      </Button>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          {/* コンテンツヘッダー */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Link href={`/characters/${content.character.id}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={content.character.profileImageUrl} />
                  <AvatarFallback>{content.character.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link href={`/characters/${content.character.id}`} className="font-medium hover:underline">
                  {content.character.name}
                </Link>
                <div className="flex items-center text-sm text-gray-500">
                  <Avatar className="h-5 w-5 mr-1">
                    <AvatarImage src={content.user.image} />
                    <AvatarFallback>{content.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{content.user.name}</span>
                  <span className="mx-1">•</span>
                  <span>{new Date(content.createdAt).toLocaleDateString("ja-JP")}</span>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
            <p className="text-gray-700">{content.description}</p>
          </div>
          
          {/* コンテンツ本体 */}
          <div className="mb-8">
            {content.contentType === "story" ? (
              <div className="prose prose-lg max-w-none">
                {content.storyContent?.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : content.contentType === "image" ? (
              <div className="flex justify-center">
                <div className="relative max-w-2xl w-full h-[500px]">
                  <Image
                    src={content.contentUrl || ""}
                    alt={content.title}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <video
                  controls
                  className="max-w-2xl w-full"
                  src={content.contentUrl}
                >
                  お使いのブラウザは動画再生をサポートしていません。
                </video>
              </div>
            )}
          </div>
          
          {/* アクションバー */}
          <div className="flex items-center justify-between border-t border-b py-4 mb-6">
            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 ${liked ? "text-pink-500" : ""}`}
              >
                <Heart size={20} className={liked ? "fill-pink-500" : ""} />
                <span>{content.likes}</span>
              </button>
              <div className="flex items-center gap-2">
                <MessageCircle size={20} />
                <span>{content.comments.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 size={20} />
                <span>シェア</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              閲覧数: {content.views}
            </div>
          </div>
          
          {/* コメントセクション */}
          <div>
            <h2 className="text-xl font-bold mb-4">コメント</h2>
            
            {/* コメント入力 */}
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex gap-4">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="コメントを入力..."
                  className="flex-grow"
                />
                <Button type="submit" disabled={!newComment.trim()}>
                  投稿
                </Button>
              </div>
            </form>
            
            {/* コメント一覧 */}
            {content.comments.length > 0 ? (
              <div className="space-y-4">
                {content.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.userImage} />
                      <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{comment.userName}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString("ja-JP")}
                          </span>
                        </div>
                        <p>{comment.comment}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <button className="flex items-center gap-1 hover:text-gray-700">
                          <ThumbsUp size={14} />
                          <span>いいね</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-gray-700">
                          <ThumbsDown size={14} />
                          <span>よくないね</span>
                        </button>
                        <button className="hover:text-gray-700">返信</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">コメントはまだありません</p>
                <p className="text-sm text-gray-400 mt-1">最初のコメントを投稿しましょう</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
