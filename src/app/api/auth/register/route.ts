import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

// バリデーションスキーマ
const userSchema = z.object({
  name: z.string().min(2, "名前は2文字以上で入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    const validatedData = userSchema.parse(body);
    const { name, email, password } = validatedData;
    
    // メールアドレスの重複確認
    const existingUser = await db.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 409 }
      );
    }
    
    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // ユーザーの作成
    const user = await db.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });
    
    // レスポンスからパスワードを除外
    const { hashedPassword: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      { success: true, user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    console.error("ユーザー登録エラー:", error);
    return NextResponse.json(
      { error: "ユーザー登録に失敗しました" },
      { status: 500 }
    );
  }
}
