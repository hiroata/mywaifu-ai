"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { redirect } from "next/navigation";

export default function CharactersPage() {
  const { data: session, status } = useSession();
  const [filter, setFilter] = useState("all");

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  const characters = [
    {
      id: 1,
      name: "桜子",
      description: "明るくて元気な女の子。いつも笑顔で話しかけてくれます。アニメや漫画が大好きで、一緒に語り合うのが得意です。",
      emoji: "🌸",
      category: "anime",
      personality: ["明るい", "元気", "フレンドリー"],
      gradient: "from-pink-500 to-rose-400"
    },
    {
      id: 2,
      name: "健太",
      description: "知識豊富で冷静。どんな質問にも丁寧に答えてくれます。ビジネスや学習のサポートが得意です。",
      emoji: "👨‍💼",
      category: "realistic",
      personality: ["知的", "冷静", "サポート"],
      gradient: "from-blue-500 to-cyan-400"
    },
    {
      id: 3,
      name: "エルフィー",
      description: "ファンタジー世界から来たエルフ。魔法について教えてくれます。創作活動やストーリーテリングが得意。",
      emoji: "🧝‍♀️",
      category: "fantasy",
      personality: ["神秘的", "創造的", "優雅"],
      gradient: "from-green-500 to-emerald-400"
    },
    {
      id: 4,
      name: "ロボ助",
      description: "未来から来たアンドロイド。テクノロジーとプログラミングの専門家。論理的な思考が得意です。",
      emoji: "🤖",
      category: "sci-fi",
      personality: ["論理的", "効率的", "テック"],
      gradient: "from-gray-500 to-slate-400"
    },
    {
      id: 5,
      name: "ミア",
      description: "アーティスト魂を持つクリエイティブな女性。絵画や音楽について情熱的に語ります。",
      emoji: "🎨",
      category: "creative",
      personality: ["芸術的", "情熱的", "感性"],
      gradient: "from-purple-500 to-violet-400"
    },
    {
      id: 6,
      name: "シェフ太郎",
      description: "料理の達人。世界各国の料理レシピや食材について詳しく教えてくれます。",
      emoji: "👨‍🍳",
      category: "lifestyle",
      personality: ["情熱的", "親切", "グルメ"],
      gradient: "from-orange-500 to-amber-400"
    }
  ];

  const filteredCharacters = characters.filter(character => {
    if (filter === "all") return true;
    return character.category === filter;
  });

  const categories = [
    { id: "all", label: "すべて", count: characters.length },
    { id: "anime", label: "アニメ", count: characters.filter(c => c.category === "anime").length },
    { id: "realistic", label: "リアル", count: characters.filter(c => c.category === "realistic").length },
    { id: "fantasy", label: "ファンタジー", count: characters.filter(c => c.category === "fantasy").length },
    { id: "sci-fi", label: "SF", count: characters.filter(c => c.category === "sci-fi").length },
    { id: "creative", label: "クリエイティブ", count: characters.filter(c => c.category === "creative").length },
    { id: "lifestyle", label: "ライフスタイル", count: characters.filter(c => c.category === "lifestyle").length },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">キャラクター一覧</h1>
          <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>新しいキャラクター作成</span>
          </button>
        </div>

        {/* カテゴリフィルター */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setFilter(category.id)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  filter === category.id
                    ? "bg-pink-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                }`}
              >
                <span>{category.label}</span>
                <span className="bg-gray-600 text-xs px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* キャラクターグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCharacters.map((character) => (
            <div key={character.id} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300 group">
              <div className={`aspect-square bg-gradient-to-br ${character.gradient} flex items-center justify-center relative overflow-hidden`}>
                <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                  {character.emoji}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg backdrop-blur-sm hover:bg-opacity-30 transition-colors">
                    詳細を見る
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{character.name}</h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-green-400">オンライン</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {character.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {character.personality.map((trait, index) => (
                    <span key={index} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                      {trait}
                    </span>
                  ))}
                </div>
                <div className="space-y-2">
                  <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded transition-colors">
                    会話を始める
                  </button>
                  <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors">
                    プロフィール
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* 新規作成カード */}
          <div className="bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 hover:border-pink-500 transition-colors cursor-pointer group">
            <div className="aspect-square flex items-center justify-center">
              <div className="text-center group-hover:scale-105 transition-transform duration-300">
                <div className="text-4xl text-gray-500 mb-2 group-hover:text-pink-500 transition-colors">+</div>
                <p className="text-gray-400 group-hover:text-pink-400 transition-colors">新しいキャラクター</p>
              </div>
            </div>
            <div className="p-4">
              <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded transition-colors">
                キャラクター作成
              </button>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-pink-500 mb-2">{characters.length}</div>
            <div className="text-gray-400">利用可能なキャラクター</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">∞</div>
            <div className="text-gray-400">会話の可能性</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">24/7</div>
            <div className="text-gray-400">いつでもオンライン</div>
          </div>
        </div>
      </div>
    </div>
  );
}
