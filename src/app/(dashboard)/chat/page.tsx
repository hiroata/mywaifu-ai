"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { redirect } from "next/navigation";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "こんにちは！AIキャラクターと会話を始めましょう。何について話したいですか？",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState("桜子");

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

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");

    // AI応答をシミュレート
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        content: getRandomResponse(),
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getRandomResponse = () => {
    const responses = [
      "それは面白いですね！もっと詳しく聞かせてください。",
      "なるほど、そういう考え方もありますね。私はこう思います...",
      "あなたの話を聞いていると、とても勉強になります！",
      "そのトピックについて、一緒に考えてみましょう。",
      "素晴らしい質問ですね！私の経験から言うと...",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const chatHistory = [
    { title: "新しい会話", time: "今日", active: true },
    { title: "魔法について", time: "昨日", active: false },
    { title: "料理のレシピ", time: "2日前", active: false },
    { title: "映画の話", time: "3日前", active: false },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">AIチャット</h1>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedCharacter}
              onChange={(e) => setSelectedCharacter(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="桜子">桜子 (元気な女の子)</option>
              <option value="健太">健太 (知識豊富)</option>
              <option value="エルフィー">エルフィー (ファンタジー)</option>
            </select>
            <div className="text-sm text-gray-400">
              {session?.user?.name}さん
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* チャット履歴サイドバー */}
          <div className="lg:col-span-1 bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">チャット履歴</h2>
              <button className="bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {chatHistory.map((chat, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    chat.active ? 'bg-pink-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium">{chat.title}</div>
                  <div className="text-sm text-gray-400">{chat.time}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* メインチャットエリア */}
          <div className="lg:col-span-3 bg-gray-800 rounded-lg flex flex-col h-[600px]">
            {/* チャットヘッダー */}
            <div className="border-b border-gray-700 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-lg">
                    {selectedCharacter === "桜子" ? "🌸" : 
                     selectedCharacter === "健太" ? "👨‍💼" : "🧝‍♀️"}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{selectedCharacter}</h3>
                  <p className="text-sm text-green-400">オンライン</p>
                </div>
              </div>
            </div>
            
            {/* チャットメッセージエリア */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === "user" 
                        ? "bg-pink-600 text-white" 
                        : "bg-gray-700 text-white"
                    }`}>
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* メッセージ入力エリア */}
            <div className="border-t border-gray-700 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="メッセージを入力..."
                  className="flex-1 bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button 
                  onClick={handleSendMessage}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  送信
                </button>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
