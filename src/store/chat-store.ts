// src/store/chat-store.ts
import { create } from "zustand";
import { Message, ChatState, Conversation, Relationship } from "@/types/chat";
import { Character, CustomCharacter } from "@/types/character";

export const useChatStore = create<{
  messages: Message[];
  isLoading: boolean;
  conversation: Conversation | null;
  character: Character | CustomCharacter | null;
  relationship: Relationship | null;
  
  // アクション
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  addMessages: (messages: Message[]) => void;
  setLoading: (isLoading: boolean) => void;
  setConversation: (conversation: Conversation) => void;
  setCharacter: (character: Character | CustomCharacter) => void;
  setRelationship: (relationship: Relationship) => void;
  clearChat: () => void;
}>((set) => ({
  messages: [],
  isLoading: false,
  conversation: null,
  character: null,
  relationship: null,
  
  // メッセージを設定
  setMessages: (messages) => set({ messages }),
  
  // 新しいメッセージを追加
  addMessage: (message) => 
    set((state) => ({ messages: [...state.messages, message] })),
  
  // 複数のメッセージを追加
  addMessages: (newMessages) => 
    set((state) => ({ 
      messages: [...newMessages, ...state.messages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    })),
  
  // ローディング状態を設定
  setLoading: (isLoading) => set({ isLoading }),
  
  // 会話を設定
  setConversation: (conversation) => set({ conversation }),
  
  // キャラクターを設定
  setCharacter: (character) => set({ character }),
  
  // 関係性を設定
  setRelationship: (relationship) => set({ relationship }),
  
  // チャットをクリア
  clearChat: () => set({ 
    messages: [],
    conversation: null,
    character: null,
    relationship: null,
  }),
}));
