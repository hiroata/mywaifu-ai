import { NextFont } from "next/dist/compiled/@next/font";
import { Inter } from "next/font/google";

// バックアップとしてInterフォントを使用
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// ダミーのSF Pro設定（テスト用）
export const fontSFPro = {
  variable: "--font-sf-pro",
};
