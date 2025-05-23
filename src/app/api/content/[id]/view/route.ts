import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

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
    
    // 閲覧数を増やす
    const updatedContent = await db.characterContent.update({
      where: { id: contentId },
      data: { views: { increment: 1 } },
    });
    
    return NextResponse.json({
      success: true,
      data: { 
        views: updatedContent.views
      },
    });
  } catch (error) {
    console.error("閲覧数カウントエラー:", error);
    return NextResponse.json({
      success: false,
      error: "閲覧数のカウントに失敗しました",
    }, { status: 500 });
  }
}
