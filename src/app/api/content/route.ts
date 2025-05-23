import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// コンテンツのバリデーションスキーマ
const contentSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(100, "タイトルは100文字以内で入力してください"),
  description: z.string().min(1, "説明は必須です").max(500, "説明は500文字以内で入力してください"),
  contentType: z.enum(["story", "image", "video"], {
    invalid_type_error: "コンテンツタイプが無効です",
  }),
  characterId: z.string().optional(),
  customCharacterId: z.string().optional(),
  isPublic: z.boolean().default(true),
  storyContent: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // ユーザー認証の確認
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "認証が必要です" }, { status: 401 });
    }
    
    // FormDataを取得
    const formData = await request.formData();
    
    // フォームデータから各フィールドを取得
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const contentType = formData.get("contentType") as "story" | "image" | "video";
    const characterIdRaw = formData.get("characterId") as string | null;
    const customCharacterIdRaw = formData.get("customCharacterId") as string | null;
    const isPublicRaw = formData.get("isPublic") as string;
    const storyContent = formData.get("storyContent") as string | undefined;
    const tagsRaw = formData.get("tags") as string | undefined;
    
    // characterIdかcustomCharacterIdのどちらかは必要
    const characterId = characterIdRaw || undefined;
    const customCharacterId = customCharacterIdRaw || undefined;
    
    if (!characterId && !customCharacterId) {
      return NextResponse.json({
        success: false,
        error: "キャラクターIDが必要です",
      }, { status: 400 });
    }
    
    // isPublicをbooleanに変換
    const isPublic = isPublicRaw === "true";
    
    // ストーリーコンテンツの確認
    if (contentType === "story" && !storyContent) {
      return NextResponse.json({
        success: false,
        error: "ストーリーコンテンツが必要です",
      }, { status: 400 });
    }
    
    // 画像・動画ファイルの処理
    let contentUrl = undefined;
    
    if (contentType === "image" || contentType === "video") {
      const contentFile = formData.get("contentFile") as File;
      
      if (!contentFile || contentFile.size === 0) {
        return NextResponse.json({
          success: false,
          error: `${contentType === "image" ? "画像" : "動画"}ファイルが必要です`,
        }, { status: 400 });
      }
      
      // ファイルサイズの制限チェック
      const maxSize = contentType === "image" ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 画像: 10MB, 動画: 100MB
      if (contentFile.size > maxSize) {
        return NextResponse.json({
          success: false,
          error: `ファイルサイズが大きすぎます。${contentType === "image" ? "画像は10MB" : "動画は100MB"}以下にしてください`,
        }, { status: 400 });
      }
      
      // ファイル名をランダムに生成して保存
      const fileExt = contentFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const contentDir = contentType === "image" ? "images" : "videos";
      const filePath = path.join(process.cwd(), "public", "uploads", contentDir, fileName);
      
      // ファイルを保存
      const buffer = Buffer.from(await contentFile.arrayBuffer());
      await writeFile(filePath, buffer);
      
      // コンテンツURLを設定
      contentUrl = `/uploads/${contentDir}/${fileName}`;
    }
    
    // バリデーション
    const validatedData = contentSchema.parse({
      title,
      description,
      contentType,
      characterId,
      customCharacterId,
      isPublic,
      storyContent,
    });
    
    // タグの処理
    const tags = tagsRaw ? JSON.parse(tagsRaw) as string[] : [];
    
    // データベースにコンテンツを保存
    const content = await db.characterContent.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        contentType: validatedData.contentType,
        characterId: validatedData.characterId,
        customCharacterId: validatedData.customCharacterId,
        contentUrl,
        storyContent: validatedData.storyContent,
        isPublic: validatedData.isPublic,
        userId: session.user.id,
        // タグの作成
        contentTags: {
          create: tags.map((tag: string) => ({
            name: tag,
          })),
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("コンテンツ作成エラー:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: error.errors[0].message,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: "コンテンツの作成に失敗しました",
    }, { status: 500 });
  }
}

// コンテンツ一覧の取得
export async function GET(request: NextRequest) {
  try {
    // ユーザー認証の確認
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "認証が必要です" }, { status: 401 });
    }
    
    // クエリパラメータ
    const searchParams = request.nextUrl.searchParams;
    const characterId = searchParams.get("characterId");
    const customCharacterId = searchParams.get("customCharacterId");
    const type = searchParams.get("type") as "story" | "image" | "video" | null;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    
    // 検索条件
    const where: any = {
      OR: [
        { isPublic: true },
        { userId: session.user.id },
      ],
    };
    
    if (characterId) {
      where.characterId = characterId;
    }
    
    if (customCharacterId) {
      where.customCharacterId = customCharacterId;
    }
    
    if (type) {
      where.contentType = type;
    }
    
    // コンテンツの総数を取得
    const total = await db.characterContent.count({ where });
    
    // ページネーション
    const contents = await db.characterContent.findMany({
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
        customCharacter: {
          select: {
            id: true,
            name: true,
            profileImageUrl: true,
          },
        },
        contentTags: true,
        comments: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    
    // レスポンスデータの整形
    const items = contents.map((content) => ({
      id: content.id,
      title: content.title,
      description: content.description,
      contentType: content.contentType,
      contentUrl: content.contentUrl,
      storyContent: content.contentType === "story" ? content.storyContent : undefined,
      likes: content.likes,
      views: content.views,
      createdAt: content.createdAt,
      user: content.user,
      character: content.character || content.customCharacter,
      tags: content.contentTags.map((tag) => tag.name),
      commentCount: content.comments.length,
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("コンテンツ取得エラー:", error);
    return NextResponse.json({
      success: false,
      error: "コンテンツの取得に失敗しました",
    }, { status: 500 });
  }
}
