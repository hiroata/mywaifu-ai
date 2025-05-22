// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // テストモードだけ対応
    return NextResponse.json({
      success: true,
      data: {
        totalMessages: 1000,
        openAIMessages: 800,
        xAIMessages: 200,
        totalUsers: 50,
        premiumUsers: 20,
        ultimateUsers: 5,
        recentCharacters: [],
        recentActivity: []
      }
    });
  } catch (error) {
    console.error("統計API エラー:", error);
    return NextResponse.json(
      { error: "統計の取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
