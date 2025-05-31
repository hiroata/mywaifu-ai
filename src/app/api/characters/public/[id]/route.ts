import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {    const { id } = params;

    // 公開キャラクターをストレージから取得
    const character = await storage.findCharacterById(id);

    if (!character) {
      return NextResponse.json(
        {
          success: false,
          error: "キャラクターが見つかりません",
        },
        { status: 404 }
      );
    }

    // 公開キャラクターのみ返す
    if (!character.isPublic) {
      return NextResponse.json(
        {
          success: false,
          error: "このキャラクターは非公開です",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...character,
        tags: [], // ストレージシステムではタグ機能は無効化
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
