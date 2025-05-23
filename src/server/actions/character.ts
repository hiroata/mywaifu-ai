// src/server/actions/character.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { characterStore } from "@/store/character-store";
import { useCharacterStore } from "@/store/character-store";
import { useCharacterStore } from "@/store/character-store";

// キャラクター作成スキーマ
const characterSchema = z.object({
  name: z
    .string()
    .min(1, "名前は必須です")
    .max(50, "名前は50文字以内で入力してください"),
  description: z
    .string()
    .min(10, "説明は10文字以上で入力してください")
    .max(1000, "説明は1000文字以内で入力してください"),
  shortDescription: z
    .string()
    .max(100, "短い説明は100文字以内で入力してください")
    .optional(),
  age: z
    .number()
    .int()
    .min(18, "年齢は18歳以上で入力してください")
    .max(100, "年齢は100歳以下で入力してください")
    .optional(),
  gender: z.enum(["male", "female", "other"]),
  type: z.enum(["real", "anime"]),
  personality: z
    .string()
    .min(10, "性格は10文字以上で入力してください")
    .max(500, "性格は500文字以内で入力してください"),
  tags: z.array(z.string()).optional(),
});

// カスタムキャラクターの作成
export async function createCustomCharacter(formData: FormData) {
  const session = await auth();
  if (!session || !session.user) {
    return {
      success: false,
      error: "認証が必要です",
    };
  }

  try {
    // フォームデータを取得
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const shortDescription = formData.get("shortDescription") as
      | string
      | undefined;
    const age = formData.get("age")
      ? parseInt(formData.get("age") as string, 10)
      : undefined;
    const gender = formData.get("gender") as string;
    const type = formData.get("type") as string;
    const personality = formData.get("personality") as string;
    const tagsStr = formData.get("tags") as string | undefined;
    const tags = tagsStr ? JSON.parse(tagsStr) : [];

    // 入力データのバリデーション
    const validatedData = characterSchema.parse({
      name,
      description,
      shortDescription,
      age,
      gender,
      type,
      personality,
      tags,
    });

    // プロファイル画像の処理
    const profileImage = formData.get("profileImage") as File;
    let profileImageUrl = "/assets/default-character.png"; // デフォルト画像

    if (profileImage && profileImage.size > 0) {
      // 画像ファイル名をランダムに生成
      const fileExt = profileImage.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);

      // 画像をファイルとして保存
      const buffer = Buffer.from(await profileImage.arrayBuffer());
      await writeFile(filePath, buffer);

      // 画像URLを設定
      profileImageUrl = `/uploads/${fileName}`;
    }

    // サブスクリプションのチェック
    const subscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "active",
      },
    });

    // 無料プランの場合、カスタムキャラクター作成を制限
    if (!subscription || subscription.plan === "FREE") {
      return {
        success: false,
        error:
          "カスタムキャラクターの作成にはプレミアムまたはアルティメットプランへのアップグレードが必要です",
      };
    }

    // プレミアムプランの場合、カスタムキャラクター数を制限
    if (subscription.plan === "PREMIUM") {
      const customCharacterCount = await db.customCharacter.count({
        where: {
          userId: session.user.id,
        },
      });

      if (customCharacterCount >= 3) {
        return {
          success: false,
          error:
            "プレミアムプランでは最大3体のカスタムキャラクターを作成できます。無制限の作成にはアルティメットプランへのアップグレードが必要です",
        };
      }
    }

    // タグの処理（既存のタグを検索し、存在しなければ作成）
    const tagObjects = [];
    for (const tagName of tags) {
      const existingTag = await db.tag.findUnique({
        where: { name: tagName },
      });

      if (existingTag) {
        tagObjects.push({ id: existingTag.id });
      } else {
        const newTag = await db.tag.create({
          data: { name: tagName },
        });
        tagObjects.push({ id: newTag.id });
      }
    }

    // カスタムキャラクターの作成
    const customCharacter = await db.customCharacter.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        shortDescription: validatedData.shortDescription,
        age: validatedData.age,
        gender: validatedData.gender,
        type: validatedData.type,
        personality: validatedData.personality,
        profileImageUrl,
        userId: session.user.id,
        isPublic: false,
        tags: {
          connect: tagObjects,
        },
      },
      include: {
        tags: true,
      },
    });

    // キャッシュの再検証
    revalidatePath("/characters");
    revalidatePath("/create-character");

    return {
      success: true,
      data: customCharacter,
    };
  } catch (error) {
    console.error("カスタムキャラクター作成エラー:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    return {
      success: false,
      error: "カスタムキャラクターの作成に失敗しました",
    };
  }
}

// カスタムキャラクターの更新
export async function updateCustomCharacter(id: string, formData: FormData) {
  const session = await auth();
  if (!session || !session.user) {
    return {
      success: false,
      error: "認証が必要です",
    };
  }

  try {
    // キャラクターの存在確認と所有権チェック
    const existingCharacter = await db.customCharacter.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingCharacter) {
      return {
        success: false,
        error: "キャラクターが見つからないか、アクセス権限がありません",
      };
    }

    // フォームデータを取得
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const shortDescription = formData.get("shortDescription") as
      | string
      | undefined;
    const age = formData.get("age")
      ? parseInt(formData.get("age") as string, 10)
      : undefined;
    const gender = formData.get("gender") as string;
    const type = formData.get("type") as string;
    const personality = formData.get("personality") as string;
    const tagsStr = formData.get("tags") as string | undefined;
    const tags = tagsStr ? JSON.parse(tagsStr) : [];

    // 入力データのバリデーション
    const validatedData = characterSchema.parse({
      name,
      description,
      shortDescription,
      age,
      gender,
      type,
      personality,
      tags,
    });

    // プロファイル画像の処理
    const profileImage = formData.get("profileImage") as File;
    let profileImageUrl = existingCharacter.profileImageUrl; // 既存の画像を維持

    if (profileImage && profileImage.size > 0) {
      // 画像ファイル名をランダムに生成
      const fileExt = profileImage.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);

      // 画像をファイルとして保存
      const buffer = Buffer.from(await profileImage.arrayBuffer());
      await writeFile(filePath, buffer);

      // 新しい画像URLを設定
      profileImageUrl = `/uploads/${fileName}`;
    }

    // タグの処理（既存のタグを検索し、存在しなければ作成）
    const tagObjects = [];
    for (const tagName of tags) {
      const existingTag = await db.tag.findUnique({
        where: { name: tagName },
      });

      if (existingTag) {
        tagObjects.push({ id: existingTag.id });
      } else {
        const newTag = await db.tag.create({
          data: { name: tagName },
        });
        tagObjects.push({ id: newTag.id });
      }
    }

    // カスタムキャラクターの更新
    const updatedCharacter = await db.customCharacter.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        shortDescription: validatedData.shortDescription,
        age: validatedData.age,
        gender: validatedData.gender,
        type: validatedData.type,
        personality: validatedData.personality,
        profileImageUrl,
        tags: {
          set: [], // 既存のタグをクリア
          connect: tagObjects, // 新しいタグを接続
        },
      },
      include: {
        tags: true,
      },
    });

    // キャッシュの再検証
    revalidatePath("/characters");
    revalidatePath(`/characters/${id}`);

    return {
      success: true,
      data: updatedCharacter,
    };
  } catch (error) {
    console.error("カスタムキャラクター更新エラー:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    return {
      success: false,
      error: "カスタムキャラクターの更新に失敗しました",
    };
  }
}

// カスタムキャラクターの削除
export async function deleteCustomCharacter(id: string) {
  const session = await auth();
  if (!session || !session.user) {
    return {
      success: false,
      error: "認証が必要です",
    };
  }

  try {
    // キャラクターの存在確認と所有権チェック
    const existingCharacter = await db.customCharacter.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingCharacter) {
      return {
        success: false,
        error: "キャラクターが見つからないか、アクセス権限がありません",
      };
    }

    // カスタムキャラクターの削除
    await db.customCharacter.delete({
      where: { id },
    });

    // キャッシュの再検証
    revalidatePath("/characters");

    return {
      success: true,
      message: "カスタムキャラクターを削除しました",
    };
  } catch (error) {
    console.error("カスタムキャラクター削除エラー:", error);
    return {
      success: false,
      error: "カスタムキャラクターの削除に失敗しました",
    };
  }
}

// キャラクターをお気に入りに追加/削除
export async function toggleFavoriteCharacter(characterId: string) {
  const session = await auth();
  if (!session || !session.user) {
    return {
      success: false,
      error: "認証が必要です",
    };
  }

  try {
    // キャラクターの存在確認
    const character = await db.character.findUnique({
      where: { id: characterId },
      include: {
        users: {
          where: { id: session.user.id },
        },
      },
    });

    if (!character) {
      return {
        success: false,
        error: "キャラクターが見つかりません",
      };
    }

    // すでにお気に入りに追加されているかチェック
    const isFavorite = character.users.length > 0;

    if (isFavorite) {
      // お気に入りから削除
      await db.character.update({
        where: { id: characterId },
        data: {
          users: {
            disconnect: { id: session.user.id },
          },
        },
      });
    } else {
      // お気に入りに追加
      await db.character.update({
        where: { id: characterId },
        data: {
          users: {
            connect: { id: session.user.id },
          },
        },
      });
    }

    // キャッシュの再検証
    revalidatePath("/characters");

    return {
      success: true,
      isFavorite: !isFavorite,
    };
  } catch (error) {
    console.error("お気に入りトグルエラー:", error);
    return {
      success: false,
      error: "お気に入りの更新に失敗しました",
    };
  }
}

// サーバーアクションとストアを連携させるユーティリティ
export function syncServerStateWithStore(
  characterId: string,
  action: "add" | "update" | "delete" | "favorite",
  data?: any,
) {
  try {
    // SSRの場合はスキップ
    if (typeof window === "undefined") return;

    // ストアの操作
    switch (action) {
      case "add":
        characterStore.getState().addCustomCharacter(data);
        break;
      case "update":
        characterStore.getState().updateCustomCharacter(characterId, data);
        break;
      case "delete":
        characterStore.getState().deleteCustomCharacter(characterId);
        break;
      case "favorite":
        characterStore.getState().toggleFavorite(characterId);
        break;
    }
  } catch (error) {
    console.error("Failed to sync state with store:", error);
  }
}
