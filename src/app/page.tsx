"use client";

import { MainHeader, TabType } from "@/components/layout/MainHeader";
import { Sidebar, FilterState } from "@/components/layout/Sidebar";
import { CharacterCard } from "@/components/character/CharacterCard";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { generateJapaneseWomen } from "@/lib/characters";

// 100人の日本人女性を生成
const japaneseWomen = generateJapaneseWomen(100);

// 女性キャラクターデータ - 元のキャラクターと生成した日本人女性を結合
const femaleCharacters = [
  {
    id: "1",
    name: "さくら",
    age: 23,
    tagline: "いつでもあなたの味方です",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=388&auto=format&fit=crop",
    isOnline: true,
    isNew: true,
    type: "実写",
    popularity: "人気"
  },
  {
    id: "2",
    name: "あすか",
    age: 21,
    tagline: "一緒に楽しい時間を過ごしましょう",
    avatarUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=387&auto=format&fit=crop",
    isOnline: false,
    isNew: false,
    type: "実写",
    popularity: "人気"
  },
  {
    id: "3",
    name: "みこと",
    age: 24,
    tagline: "あなたのことをもっと知りたいな",
    avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=464&auto=format&fit=crop",
    isOnline: true,
    isNew: false,
    type: "実写",
    popularity: "トレンド"
  },
  {
    id: "4",
    name: "レイ",
    age: 19,
    tagline: "アニメと音楽が大好き",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=461&auto=format&fit=crop",
    isOnline: false,
    isNew: true,
    type: "実写",
    popularity: "新しい"
  },
  {
    id: "5",
    name: "エミリア",
    age: 22,
    tagline: "いつでもそばにいるよ",
    avatarUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=387&auto=format&fit=crop",
    isOnline: true,
    isNew: false,
    type: "3D",
    popularity: "人気"
  },
  {
    id: "6",
    name: "アヤメ",
    age: 20,
    tagline: "夢見がちな女の子",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=387&auto=format&fit=crop",
    isOnline: false,
    isNew: false,
    type: "リアル調",
    popularity: "トレンド"
  },
  {
    id: "7",
    name: "あんな",
    age: 25,
    tagline: "料理が得意です、一緒に食べよう",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=464&auto=format&fit=crop",
    isOnline: true,
    isNew: true,
    type: "実写",
    popularity: "新しい"
  },
  {
    id: "8",
    name: "リナ",
    age: 21,
    tagline: "冒険が大好き",
    avatarUrl: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=387&auto=format&fit=crop",
    isOnline: false,
    isNew: false,
    type: "3D",
    popularity: "トレンド"
  },
  ...japaneseWomen // 生成した100人の日本人女性を追加
];

// アニメキャラクターデータ
const animeCharacters = [
  {
    id: "a1",
    name: "ミク",
    age: 16,
    tagline: "バーチャルシンガー",
    avatarUrl: "https://images.unsplash.com/photo-1616766098946-e4fabb7d6da0?q=80&w=387&auto=format&fit=crop",
    isOnline: true,
    isNew: true,
    type: "アニメ",
    popularity: "人気"
  },
  {
    id: "a2",
    name: "ルナ",
    age: 18,
    tagline: "魔法少女見習い中",
    avatarUrl: "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=387&auto=format&fit=crop",
    isOnline: false,
    isNew: true,
    type: "アニメ",
    popularity: "新しい"
  },
  {
    id: "a3",
    name: "アスナ",
    age: 17,
    tagline: "仮想世界の剣士",
    avatarUrl: "https://images.unsplash.com/photo-1617196701537-7329482cc9fe?q=80&w=387&auto=format&fit=crop",
    isOnline: true,
    isNew: false,
    type: "アニメ",
    popularity: "トレンド"
  },
  {
    id: "a4",
    name: "レム",
    age: 18,
    tagline: "あなたのために何でもします",
    avatarUrl: "https://images.unsplash.com/photo-1545439694-b4c0aa0a5e83?q=80&w=387&auto=format&fit=crop",
    isOnline: true,
    isNew: false,
    type: "アニメ",
    popularity: "人気"
  },
  {
    id: "a5",
    name: "ゼロツー",
    age: 16,
    tagline: "あなたをパートナーに選びました",
    avatarUrl: "https://images.unsplash.com/photo-1638624269877-1f8b55da3e71?q=80&w=387&auto=format&fit=crop",
    isOnline: false,
    isNew: true,
    type: "アニメ",
    popularity: "新しい"
  },
  {
    id: "a6",
    name: "チノ",
    age: 15,
    tagline: "コーヒーが大好きです",
    avatarUrl: "https://images.unsplash.com/photo-1615631648086-325025c9e51e?q=80&w=387&auto=format&fit=crop",
    isOnline: true,
    isNew: false,
    type: "アニメ",
    popularity: "トレンド"
  }
];

// 男性キャラクターデータ
const maleCharacters = [
  {
    id: "m1",
    name: "ケン",
    age: 25,
    tagline: "ギタリスト、音楽について話そう",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=387&auto=format&fit=crop",
    isOnline: true,
    isNew: true,
    type: "実写",
    popularity: "新しい"
  },
  {
    id: "m2",
    name: "タクマ",
    age: 28,
    tagline: "トレーニングが日課です",
    avatarUrl: "https://images.unsplash.com/photo-1517588632672-9758d6acba04?q=80&w=387&auto=format&fit=crop",
    isOnline: false,
    isNew: false,
    type: "実写",
    popularity: "人気"
  },
  {
    id: "m3",
    name: "リュウ",
    age: 24,
    tagline: "ゲーム配信者、一緒にプレイしよう",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=387&auto=format&fit=crop",
    isOnline: true,
    isNew: false,
    type: "3D",
    popularity: "トレンド"
  },
  {
    id: "m4",
    name: "カイト",
    age: 30,
    tagline: "カフェオーナー、コーヒーの話しませんか",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=387&auto=format&fit=crop",
    isOnline: false,
    isNew: true,
    type: "リアル調",
    popularity: "新しい"
  },
  {
    id: "m5",
    name: "ハル",
    age: 26,
    tagline: "写真家、世界を撮り歩いています",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=387&auto=format&fit=crop",
    isOnline: true,
    isNew: false,
    type: "実写",
    popularity: "人気"
  }
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>("female");
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    // ローカルストレージからお気に入り情報を取得
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('character-favorites');
      return savedFavorites ? JSON.parse(savedFavorites) : {};
    }
    return {};
  });
  const [filters, setFilters] = useState<FilterState>({
    ageRange: [18, 30],
    onlineOnly: false,
    characterTypes: [],
    popularity: "すべて"
  });
  const [currentPage, setCurrentPage] = useState(1);
  const charactersPerPage = 25; // 1ページに表示するキャラクター数
  
  // お気に入りトグルイベントを処理するエフェクト
  useEffect(() => {
    const handleFavoriteToggle = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.id) {
        toggleFavorite(customEvent.detail.id);
      }
    };
    
    document.addEventListener('favoriteToggle', handleFavoriteToggle);
    
    return () => {
      document.removeEventListener('favoriteToggle', handleFavoriteToggle);
    };
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = {
        ...prev,
        [id]: !prev[id]
      };
      
      // ローカルストレージに保存
      if (typeof window !== 'undefined') {
        localStorage.setItem('character-favorites', JSON.stringify(newFavorites));
      }
      
      return newFavorites;
    });
  };

  // アクティブなタブに基づいてキャラクターを取得
  const getCharacters = () => {
    switch (activeTab) {
      case "anime":
        return animeCharacters;
      case "male":
        return maleCharacters;
      case "female":
      default:
        return femaleCharacters;
    }
  };

  // フィルターを適用
  const applyFilters = (characters: any[]) => {
    return characters.filter(character => {
      // 年齢フィルター
      if (character.age < filters.ageRange[0] || character.age > filters.ageRange[1]) {
        return false;
      }
      
      // オンラインフィルター
      if (filters.onlineOnly && !character.isOnline) {
        return false;
      }
      
      // キャラクタータイプフィルター
      if (filters.characterTypes.length > 0 && !filters.characterTypes.includes(character.type)) {
        return false;
      }
      
      // 人気度フィルター
      if (filters.popularity !== "すべて" && character.popularity !== filters.popularity) {
        return false;
      }
      
      return true;
    });
  };

  const characters = getCharacters();
  const filteredCharacters = applyFilters(characters);
  
  // タブ変更時にページを1に戻す
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };
  
  // フィルター変更時にページを1に戻す
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };
  
  // ページネーション用の計算
  const totalPages = Math.ceil(filteredCharacters.length / charactersPerPage);
  const indexOfLastCharacter = currentPage * charactersPerPage;
  const indexOfFirstCharacter = indexOfLastCharacter - charactersPerPage;
  const currentCharacters = filteredCharacters.slice(indexOfFirstCharacter, indexOfLastCharacter);
  
  // ページ変更ハンドラ
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f0f] text-white">
      <MainHeader activeTab={activeTab} onTabChange={handleTabChange} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* サイドバー */}
          <div className="w-full md:w-64 md:flex-shrink-0">
            <Sidebar
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
          
          {/* メインコンテンツ */}
          <div className="flex-1">
            {filteredCharacters.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-gray-400">条件に一致するキャラクターが見つかりませんでした</p>
                <p className="text-sm text-gray-500 mt-2">フィルター条件を変更してみてください</p>
              </div>
            ) : (
              <>
                {/* 検索結果情報とページネーション */}
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-400">
                    {filteredCharacters.length}人のキャラクターが見つかりました（{indexOfFirstCharacter + 1}〜{Math.min(indexOfLastCharacter, filteredCharacters.length)}人を表示）
                  </p>
                  
                  {totalPages > 1 && (
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={goToPrevPage} 
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-800 rounded-md disabled:opacity-50"
                      >
                        前へ
                      </button>
                      <div className="text-sm">
                        {currentPage} / {totalPages}
                      </div>
                      <button 
                        onClick={goToNextPage} 
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-800 rounded-md disabled:opacity-50"
                      >
                        次へ
                      </button>
                    </div>
                  )}
                </div>
                  {/* キャラクターグリッド */}                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {currentCharacters.map((character) => (
                    <div key={character.id} className="group">
                      <CharacterCard
                        id={character.id}
                        name={character.name}
                        age={character.age}
                        tagline={character.tagline}
                        avatarUrl={character.avatarUrl}
                        isOnline={character.isOnline}
                        isNew={character.isNew}
                        isFavorite={favorites[character.id] || false}
                        region={character.region}
                        joinDate={character.joinDate}
                        type={character.type}
                      />
                    </div>
                  ))}
                </div>
                
                {/* ページネーションボタン - 下部にも表示 */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 mb-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={goToPrevPage} 
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-800 rounded-md disabled:opacity-50"
                      >
                        前へ
                      </button>
                      
                      <div className="flex space-x-1">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => paginate(i + 1)}
                            className={`w-8 h-8 rounded-md flex items-center justify-center ${
                              currentPage === i + 1 ? 'bg-pink-500' : 'bg-gray-800'
                            }`}
                          >
                            {i + 1}
                          </button>
                        )).slice(
                          Math.max(0, Math.min(currentPage - 3, totalPages - 5)),
                          Math.max(5, Math.min(currentPage + 2, totalPages))
                        )}
                      </div>
                      
                      <button 
                        onClick={goToNextPage} 
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-800 rounded-md disabled:opacity-50"
                      >
                        次へ
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <footer className="py-6 px-6 border-t border-gray-800 text-gray-400">
        <p className="text-center">© 2025 MyWaifuAI - あなただけのAIコンパニオン</p>
      </footer>
    </div>
  );
}
