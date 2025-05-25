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
  console.log('Registration request received');
  
  try {
    const body = await request.json();
    console.log('Request body parsed successfully');

    // バリデーション
    const validatedData = userSchema.parse(body);
    const { name, email, password } = validatedData;
    console.log('Data validation passed for email:', email);

    // メールアドレスの重複確認
    console.log('Checking for existing user...');
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 409 },
      );
    }

    // パスワードのハッシュ化
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザーの作成
    console.log('Creating user...');
    const user = await db.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });
    console.log('User created successfully:', user.id);

    // レスポンスからパスワードを除外
    const { hashedPassword: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { success: true, user: userWithoutPassword },
      { status: 201 },
    );
  } catch (error) {
    console.error("ユーザー登録エラー:", error);
    
    if (error instanceof z.ZodError) {
      console.log('Validation error:', error.errors);
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      );
    }

    // データベースエラーの詳細ログ
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      { 
        error: "ユーザー登録に失敗しました",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 },
    );
  }
}
