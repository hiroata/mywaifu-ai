// src/server/actions/chat.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// メッセージ送信スキーマ
const messageSchema = z.object({
  content: z.string().min(1, "メッセージを入力してください").max(1000, "メッセージは1000文字以内で入力してください"),
  imagePrompt: z.string().max(200, "画像プロンプトは200文字以内で入力してください").optional(),
  generateVoice: z.boolean().optional(),
  aiProvider: z.enum(["openai", "xai"]).optional().default("openai"),
});

// 新しい会話の作成
export async function createConversation(characterId: string, isCustom: boolean = false) {
  const session = await auth();
  if (!session || !session.user) {
    return {
      success: false,
      error: "認証が必要です",
    };
  }

  try {
    let character;
    
    // キャラクターの取得
    if (isCustom) {
      character = await db.customCharacter.findUnique({
        where: {
          id: characterId,
          OR: [
            { userId: session.user.id }, // 自分が作成したカスタムキャラクター
            { isPublic: true }, // または公開されているカスタムキャラクター
          ],
        },
      });
      
      if (!character) {
        return {
          success: false,
          error: "カスタムキャラクターが見つからないか、アクセス権限がありません",
        };
      }
    } else {
      character = await db.character.findUnique({
        where: {
          id: characterId,
          isPublic: true, // 公開されているキャラクターのみ
        },
      });
      
      if (!character) {
        return {
          success: false,
          error: "キャラクターが見つかりません",
        };
      }
    }
    
    // 会話のタイトルを設定
    const title = `${character.name}との会話`;
    
    // 会話の作成
    const conversation = await db.conversation.create({
      data: {
        title,
        userId: session.user.id,
        ...(isCustom
          ? { customCharacterId: characterId }
          : { characterId }),
        relationship: {
          create: {
            details: "初対面",
            loveLevel: 0,
            mood: "friendly",
          },
        },
      },
    });
    
    // キャッシュの再検証
    revalidatePath("/chat");
    
    return {
      success: true,
      data: conversation,
    };
  } catch (error) {
    console.error("会話作成エラー:", error);
    return {
      success: false,
      error: "会話の作成に失敗しました",
    };
  }
}

// メッセージの送信
export async function sendMessage(conversationId: string, input: z.infer<typeof messageSchema>) {
  const session = await auth();
  if (!session || !session.user) {
    return {
      success: false,
      error: "認証が必要です",
    };
  }

  try {
    // 入力データのバリデーション
    const validatedData = messageSchema.parse(input);
    
    // チャットAPIを使用（RESTful APIエンドポイント経由）
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId,
        content: validatedData.content,
        imagePrompt: validatedData.imagePrompt,
        shouldGenerateVoice: validatedData.generateVoice,
        aiProvider: validatedData.aiProvider,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "メッセージの送信に失敗しました");
    }
    
    const result = await response.json();
    
    // キャッシュの再検証
    revalidatePath(`/chat/${conversationId}`);
    
    return result;
  } catch (error) {
    console.error("メッセージ送信エラー:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    
    return {
      success: false,
      error: (error as Error).message || "メッセージの送信に失敗しました",
    };  }
}

// 会話の取得
export async function getConversationById(id: string) {
  const session = await auth();
  if (!session || !session.user) {
    return null;
  }
  
  return db.conversation.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      character: {
        include: {
          tags: true,
          characterVoices: true,
        },
      },
      customCharacter: {
        include: {
          tags: true,
          characterVoices: true,
        },
      },
      relationship: true,
    },
  });
}

// 会話一覧の取得
export async function getUserConversations() {
  const session = await auth();
  if (!session || !session.user) {
    return [];
  }
  
  return db.conversation.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      character: {
        select: {
          name: true,
          profileImageUrl: true,
        },
      },
      customCharacter: {
        select: {
          name: true,
          profileImageUrl: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

// 会話の削除
export async function deleteConversation(id: string) {
  const session = await auth();
  if (!session || !session.user) {
    return {
      success: false,
      error: "認証が必要です",
    };
  }

  try {
    // 会話の存在確認と所有権チェック
    const conversation = await db.conversation.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });
    
    if (!conversation) {
      return {
        success: false,
        error: "会話が見つからないか、アクセス権限がありません",
      };
    }
    
    // 会話の削除
    await db.conversation.delete({
      where: { id },
    });
    
    // キャッシュの再検証
    revalidatePath("/chat");
    
    return {
      success: true,
      message: "会話を削除しました",
    };
  } catch (error) {
    console.error("会話削除エラー:", error);
    return {
      success: false,
      error: "会話の削除に失敗しました",
    };
  }
}
