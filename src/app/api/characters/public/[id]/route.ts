import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 公開キャラクターを取得（認証不要）
    const character = await db.character.findFirst({
      where: {
        OR: [
          { id },
          { id: `character-${id}` }, // seed.tsでのID形式に対応
        ],
        isPublic: true,
      },
      include: {
        tags: true,
      },
    });

    // キャラクターが見つからない場合はカスタムキャラクターも確認
    if (!character) {
      const customCharacter = await db.customCharacter.findFirst({
        where: {
          OR: [
            { id },
            { id: `character-${id}` },
          ],
          isPublic: true,
        },
        include: {
          tags: true,
        },
      });

      if (customCharacter) {
        return NextResponse.json({
          success: true,
          data: {
            ...customCharacter,
            isCustom: true,
          },
        });
      }
    }

    if (!character) {
      return NextResponse.json(
        {
          success: false,
          error: "キャラクターが見つかりません",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...character,
        isCustom: false,
      },
    });
  } catch (error) {
    console.error("Public character fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "キャラクターの取得に失敗しました",
      },
      { status: 500 }
    );
  }
}
