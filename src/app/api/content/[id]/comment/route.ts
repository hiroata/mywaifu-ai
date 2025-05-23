import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// コメントのバリデーションスキーマ
const commentSchema = z.object({
  comment: z.string().min(1, "コメントは必須です").max(500, "コメントは500文字以内で入力してください"),
});

export async function POST(
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
    const userId = session.user.id;
    
    // リクエストボディの取得
    const body = await request.json();
    
    // バリデーション
    const validatedData = commentSchema.parse(body);
    
    // コンテンツの存在確認
    const content = await db.characterContent.findUnique({
      where: {
        id: contentId,
      },
    });
    
    if (!content) {
      return NextResponse.json({ 
        success: false, 
        error: "コンテンツが見つかりませんでした" 
      }, { status: 404 });
    }
    
    // コメントの作成
    const comment = await db.contentComment.create({
      data: {
        contentId,
        userId,
        comment: validatedData.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    // レスポンスデータの整形
    const formattedComment = {
      id: comment.id,
      userId: comment.userId,
      userName: comment.user.name,
      userImage: comment.user.image,
      comment: comment.comment,
      createdAt: comment.createdAt,
    };
    
    return NextResponse.json({
      success: true,
      data: formattedComment,
    });
  } catch (error) {
    console.error("コメントエラー:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: error.errors[0].message,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: "コメントの投稿に失敗しました",
    }, { status: 500 });
  }
}

// コメント一覧の取得
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
    
    // コンテンツの存在確認
    const content = await db.characterContent.findUnique({
      where: {
        id: contentId,
      },
    });
    
    if (!content) {
      return NextResponse.json({ 
        success: false, 
        error: "コンテンツが見つかりませんでした" 
      }, { status: 404 });
    }
    
    // コメントの取得
    const comments = await db.contentComment.findMany({
      where: {
        contentId,
      },
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
    });
    
    // レスポンスデータの整形
    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      userId: comment.userId,
      userName: comment.user.name,
      userImage: comment.user.image,
      comment: comment.comment,
      createdAt: comment.createdAt,
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedComments,
    });
  } catch (error) {
    console.error("コメント取得エラー:", error);
    return NextResponse.json({
      success: false,
      error: "コメントの取得に失敗しました",
    }, { status: 500 });
  }
}
