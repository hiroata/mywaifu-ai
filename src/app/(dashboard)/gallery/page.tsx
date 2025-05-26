"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { redirect } from "next/navigation";

export default function GalleryPage() {
  const { data: session, status } = useSession();
  const [filter, setFilter] = useState("all");
  const [showGenerateModal, setShowGenerateModal] = useState(false);

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

  const generateRandomImage = () => {
    const styles = ["アニメ", "リアル", "ファンタジー", "サイバーパンク", "水彩画"];
    const subjects = ["美しい女性", "かっこいい男性", "魔法使い", "ロボット", "風景"];
    const colors = ["ピンク", "ブルー", "パープル", "グリーン", "オレンジ"];
    
    const style = styles[Math.floor(Math.random() * styles.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return `${style}風の${subject}、${color}を基調とした美しいアート`;
  };

  const sampleImages = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `生成画像 #${i + 1}`,
    description: generateRandomImage(),
    category: ["anime", "realistic", "fantasy", "cyberpunk", "landscape"][Math.floor(Math.random() * 5)],
    gradient: [
      "from-pink-400 via-purple-500 to-blue-500",
      "from-green-400 via-blue-500 to-purple-600",
      "from-yellow-400 via-red-500 to-pink-500",
      "from-blue-400 via-purple-500 to-pink-500",
      "from-indigo-400 via-purple-500 to-pink-500",
    ][Math.floor(Math.random() * 5)],
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    likes: Math.floor(Math.random() * 100),
    downloads: Math.floor(Math.random() * 50),
  }));

  const filteredImages = sampleImages.filter(image => {
    if (filter === "all") return true;
    return image.category === filter;
  });

  const filters = [
    { id: "all", label: "すべて", icon: "🖼️" },
    { id: "anime", label: "アニメ", icon: "🎌" },
    { id: "realistic", label: "リアル", icon: "📷" },
    { id: "fantasy", label: "ファンタジー", icon: "🏰" },
    { id: "cyberpunk", label: "サイバーパンク", icon: "🤖" },
    { id: "landscape", label: "風景", icon: "🌄" },
  ];

  const quickPrompts = [
    "美しいアニメガール",
    "サイバーパンクシティ",
    "魔法の森",
    "未来的なロボット",
    "夕日の海岸",
    "スチームパンクな機械",
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">ギャラリー</h1>
          <button 
            onClick={() => setShowGenerateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>AIで画像生成</span>
          </button>
        </div>
        
        {/* フィルター */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {filters.map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  filter === filterOption.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                }`}
              >
                <span>{filterOption.icon}</span>
                <span>{filterOption.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* 画像グリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredImages.map((image) => (
            <div key={image.id} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group">
              <div className={`aspect-square bg-gradient-to-br ${image.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex space-x-2">
                    <button className="bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-colors backdrop-blur-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-colors backdrop-blur-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button className="bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-colors backdrop-blur-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-black bg-opacity-50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                    {image.title}
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm text-gray-400 truncate mb-2">
                  {image.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{image.createdAt.toLocaleDateString()}</span>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                      <span>{image.likes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>{image.downloads}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* 新規作成カード */}
          <div 
            onClick={() => setShowGenerateModal(true)}
            className="bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors cursor-pointer group"
          >
            <div className="aspect-square flex items-center justify-center">
              <div className="text-center group-hover:scale-105 transition-transform duration-300">
                <div className="text-4xl text-gray-500 mb-2 group-hover:text-blue-500 transition-colors">✨</div>
                <p className="text-gray-400 text-sm group-hover:text-blue-400 transition-colors">新しい画像を生成</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* ページネーション */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
              前へ
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              1
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
              2
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
              3
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
              次へ
            </button>
          </div>
        </div>
      </div>

      {/* 画像生成モーダル */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">AI画像生成</h2>
              <button 
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">プロンプト</label>
                <textarea
                  placeholder="生成したい画像を詳しく説明してください..."
                  className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">クイックプロンプト</label>
                <div className="grid grid-cols-2 gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded text-sm transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">スタイル</label>
                <select className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="anime">アニメ</option>
                  <option value="realistic">リアリスティック</option>
                  <option value="fantasy">ファンタジー</option>
                  <option value="cyberpunk">サイバーパンク</option>
                  <option value="watercolor">水彩画</option>
                </select>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors">
                  生成開始
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
