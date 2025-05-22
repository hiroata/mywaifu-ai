// src/hooks/use-subscription.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/user-store";
import { PLANS } from "@/lib/stripe";
import { Subscription } from "@/types";

export function useSubscription() {
  const { subscription, setSubscription } = useUserStore();

  // サブスクリプション情報取得
  const { isLoading, refetch } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const response = await fetch("/api/subscription");
      if (!response.ok) {
        throw new Error("サブスクリプション情報の取得に失敗しました");
      }
      const data = await response.json();
      setSubscription(data.data);
      return data.data;
    },
  });

  // チェックアウトセッション作成ミューテーション
  const checkoutMutation = useMutation({
    mutationFn: async ({ planId }: { planId: "PREMIUM" | "ULTIMATE" }) => {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "チェックアウトセッションの作成に失敗しました");
      }
      
      return response.json();
    },
  });

  // 管理ポータルセッション作成ミューテーション
  const portalMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/subscription/portal", {
        method: "POST",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "ポータルセッションの作成に失敗しました");
      }
      
      return response.json();
    },
  });

  // 現在のプラン情報を取得
  const currentPlan = subscription
    ? PLANS[subscription.plan as keyof typeof PLANS]
    : PLANS.FREE;

  // サブスクリプションが有効かどうかをチェック
  const isActive = subscription?.status === "active";

  // 利用可能な機能をチェック
  const canCreateCustomCharacter = isActive && (subscription?.plan === "PREMIUM" || subscription?.plan === "ULTIMATE");
  const hasUnlimitedMessages = isActive && subscription?.plan === "ULTIMATE";
  const canGenerateImages = isActive && subscription?.plan === "ULTIMATE";
  const canUseVoice = isActive && (subscription?.plan === "PREMIUM" || subscription?.plan === "ULTIMATE");

  // カスタムキャラクター作成の制限
  const maxCustomCharacters = 
    subscription?.plan === "ULTIMATE" ? Infinity :
    subscription?.plan === "PREMIUM" ? 3 :
    0;

  // 1日あたりのメッセージ制限
  const maxMessagesPerDay =
    subscription?.plan === "ULTIMATE" ? Infinity :
    subscription?.plan === "PREMIUM" ? 50 :
    5;

  return {
    subscription,
    isLoading,
    refetch,
    createCheckoutSession: checkoutMutation.mutateAsync,
    createPortalSession: portalMutation.mutateAsync,
    isCheckoutLoading: checkoutMutation.isPending,
    isPortalLoading: portalMutation.isPending,
    currentPlan,
    isActive,
    canCreateCustomCharacter,
    hasUnlimitedMessages,
    canGenerateImages,
    canUseVoice,
    maxCustomCharacters,
    maxMessagesPerDay,
  };
}
