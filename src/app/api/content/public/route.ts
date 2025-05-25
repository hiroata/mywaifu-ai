import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get("characterId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const contentType = searchParams.get("type");

    const skip = (page - 1) * limit;

    // フィルター条件を構築
    const where: any = {
      isPublic: true,
    };    if (characterId) {
      where.OR = [
        { characterId },
        { character: { id: characterId } },
        { customCharacter: { id: characterId } },
      ];
    }

    if (contentType && ["story", "image", "video"].includes(contentType)) {
      where.contentType = contentType;
    }

    // コンテンツを取得
    const [contents, total] = await Promise.all([
      db.characterContent.findMany({
        where,
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
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      db.characterContent.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: contents,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Public content fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "コンテンツの取得に失敗しました",
      },
      { status: 500 }
    );
  }
}
