import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { validateApiRequest, createApiErrorResponse, createApiSuccessResponse } from "@/lib/security/api-security";
import { logSecurityEvent, SecurityEvent } from "@/lib/security/security-logger";
import { validateInput } from "@/lib/content-filter";

// 強化されたバリデーションスキーマ
const userRegistrationSchema = z.object({
  name: z.string()
    .min(2, "名前は2文字以上で入力してください")
    .max(50, "名前は50文字以内で入力してください")
    .regex(/^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s\-_]+$/, "名前に無効な文字が含まれています"),
  email: z.string()
    .email("有効なメールアドレスを入力してください")
    .max(254, "メールアドレスが長すぎます")
    .toLowerCase(),
  password: z.string()
    .min(8, "パスワードは8文字以上で入力してください")
    .max(128, "パスワードは128文字以内で入力してください")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "パスワードは小文字、大文字、数字を含む必要があります"),
});

export async function POST(request: NextRequest) {
  console.log('Registration request received');
  
  try {
    // リクエストボディのサイズと型を確認
    const contentType = request.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      console.log('Invalid content type, expected application/json');
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 },
      );
    }

    const rawBody = await request.text();
    console.log('Raw body length:', rawBody.length);
    console.log('Raw body (first 100 chars):', rawBody.substring(0, 100));
    
    if (!rawBody || rawBody.trim() === '') {
      console.log('Empty request body');
      return NextResponse.json(
        { error: "Request body is empty" },
        { status: 400 },
      );
    }

    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: "Invalid JSON format", details: parseError instanceof Error ? parseError.message : 'Unknown parse error' },
        { status: 400 },
      );
    }

    // バリデーション
    const validatedData = userRegistrationSchema.parse(body);
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
