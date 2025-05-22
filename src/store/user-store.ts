// src/store/user-store.ts
import { create } from "zustand";
import { ExtendedUser, Subscription } from "@/types";

export const useUserStore = create<{
  user: ExtendedUser | null;
  subscription: Subscription | null;
  isLoading: boolean;
  
  // アクション
  setUser: (user: ExtendedUser | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearUser: () => void;
  updateUserData: (userData: Partial<ExtendedUser>) => void;
}>((set) => ({
  user: null,
  subscription: null,
  isLoading: false,
  
  // ユーザー情報を設定
  setUser: (user) => set({ user }),
  
  // サブスクリプション情報を設定
  setSubscription: (subscription) => set({ subscription }),
  
  // ローディング状態を設定
  setLoading: (isLoading) => set({ isLoading }),
  
  // ユーザー情報をクリア（ログアウト時など）
  clearUser: () => set({ user: null, subscription: null }),
  
  // ユーザー情報の一部を更新
  updateUserData: (userData) => 
    set((state) => ({ 
      user: state.user ? { ...state.user, ...userData } : null 
    })),
}));
