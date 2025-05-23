import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ユーザー認証の確認
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "認証が必要です" }, { status: 401 });
    }
    
    const contentId = params.id;
    
    // コンテンツの取得
    const content = await db.characterContent.findUnique({
      where: {
        id: contentId,
        OR: [
          { isPublic: true },
          { userId: session.user.id },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        character: {
          select: {
            id: true,
            name: true,
            profileImageUrl: true,
          },
        },
        customCharacter: {
          select: {
            id: true,
            name: true,
            profileImageUrl: true,
          },
        },
        contentTags: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
    
    if (!content) {
      return NextResponse.json({ 
        success: false, 
        error: "コンテンツが見つかりませんでした" 
      }, { status: 404 });
    }
    
    // レスポンスデータの整形
    const formattedContent = {
      id: content.id,
      title: content.title,
      description: content.description,
      contentType: content.contentType,
      contentUrl: content.contentUrl,
      storyContent: content.contentType === "story" ? content.storyContent : undefined,
      likes: content.likes,
      views: content.views,
      createdAt: content.createdAt,
      user: content.user,
      character: content.character || content.customCharacter,
      tags: content.contentTags.map((tag) => tag.name),
      comments: content.comments.map((comment) => ({
        id: comment.id,
        userId: comment.userId,
        userName: comment.user.name,
        userImage: comment.user.image,
        comment: comment.comment,
        createdAt: comment.createdAt,
      })),
    };
    
    return NextResponse.json({
      success: true,
      data: formattedContent,
    });
  } catch (error) {
    console.error("コンテンツ詳細取得エラー:", error);
    return NextResponse.json({
      success: false,
      error: "コンテンツの取得に失敗しました",
    }, { status: 500 });
  }
}
