// src/lib/stripe.ts
import Stripe from "stripe";
import { db } from "./db";

// Stripe APIクライアント初期化
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// 料金プラン
export const PLANS = {
  FREE: {
    name: "無料プラン",
    description: "基本機能を利用可能",
    price: 0,
    features: [
      "プリセットキャラクターとの会話",
      "1日5回までのAI会話",
      "テキストチャットのみ",
    ],
    stripePriceId: "",
  },
  PREMIUM: {
    name: "プレミアムプラン",
    description: "より多機能を低価格で",
    price: 980, // 月額980円
    features: [
      "カスタムキャラクターの作成（最大3体）",
      "1日50回までのAI会話",
      "音声チャット機能",
      "優先サポート",
    ],
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
  },
  ULTIMATE: {
    name: "アルティメットプラン",
    description: "MyWaifuAIのすべての機能を利用可能",
    price: 1980, // 月額1980円
    features: [
      "無制限のカスタムキャラクター作成",
      "無制限のAI会話",
      "音声・画像生成機能",
      "VIP優先サポート",
      "最新機能への早期アクセス",
    ],
    stripePriceId: process.env.STRIPE_ULTIMATE_PRICE_ID,
  },
};

// チェックアウトセッションの作成
export async function createCheckoutSession({
  userId,
  planId,
  returnUrl,
}: {
  userId: string;
  planId: "PREMIUM" | "ULTIMATE";
  returnUrl: string;
}) {
  // ユーザー情報を取得
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { subscriptions: true },
  });

  if (!user) {
    throw new Error("ユーザーが見つかりません");
  }

  // Stripeの顧客IDを取得または作成
  let stripeCustomerId = user.subscriptions[0]?.stripeCustomerId;

  if (!stripeCustomerId) {
    // Stripe顧客を作成
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: {
        userId: user.id,
      },
    });
    stripeCustomerId = customer.id;
  }

  // プラン情報を取得
  const plan = PLANS[planId];

  // チェックアウトセッション作成
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${returnUrl}/dashboard?checkout=success`,
    cancel_url: `${returnUrl}/subscription?checkout=canceled`,
    metadata: {
      userId: user.id,
      planId,
    },
  });

  return session;
}

// サブスクリプションのキャンセル
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

// サブスクリプション管理ポータルセッションの作成
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}
