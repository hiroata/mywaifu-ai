import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // ユーザー認証の確認
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "認証が必要です" },
        { status: 401 },
      );
    }

    const contentId = params.id;
    const userId = session.user.id;

    // コンテンツの存在確認
    const content = await db.characterContent.findUnique({
      where: {
        id: contentId,
      },
    });

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          error: "コンテンツが見つかりませんでした",
        },
        { status: 404 },
      );
    }

    // ユーザーがすでにいいねしているか確認
    const existingLike = await db.contentLike.findUnique({
      where: {
        userId_contentId: {
          userId,
          contentId,
        },
      },
    });

    if (existingLike) {
      // いいねを解除
      await db.contentLike.delete({
        where: {
          userId_contentId: {
            userId,
            contentId,
          },
        },
      });

      // いいね数を減らす
      const updatedContent = await db.characterContent.update({
        where: { id: contentId },
        data: { likes: { decrement: 1 } },
      });

      return NextResponse.json({
        success: true,
        data: {
          liked: false,
          likes: updatedContent.likes,
        },
      });
    } else {
      // いいねを追加
      await db.contentLike.create({
        data: {
          userId,
          contentId,
        },
      });

      // いいね数を増やす
      const updatedContent = await db.characterContent.update({
        where: { id: contentId },
        data: { likes: { increment: 1 } },
      });

      return NextResponse.json({
        success: true,
        data: {
          liked: true,
          likes: updatedContent.likes,
        },
      });
    }
  } catch (error) {
    console.error("いいねエラー:", error);
    return NextResponse.json(
      {
        success: false,
        error: "いいねの処理に失敗しました",
      },
      { status: 500 },
    );
  }
}
