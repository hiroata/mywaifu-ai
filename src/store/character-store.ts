// src/store/character-store.ts
import { create } from "zustand";
import { Character, CustomCharacter } from "@/types/character";

export const useCharacterStore = create<{
  characters: Character[];
  customCharacters: CustomCharacter[];
  favoriteCharacterIds: string[];
  isLoading: boolean;
  
  // アクション
  setCharacters: (characters: Character[]) => void;
  setCustomCharacters: (customCharacters: CustomCharacter[]) => void;
  setFavoriteCharacterIds: (ids: string[]) => void;
  addCharacter: (character: Character) => void;
  addCustomCharacter: (customCharacter: CustomCharacter) => void;
  updateCustomCharacter: (id: string, data: Partial<CustomCharacter>) => void;
  deleteCustomCharacter: (id: string) => void;
  toggleFavorite: (characterId: string) => void;
  setLoading: (isLoading: boolean) => void;
}>((set) => ({
  characters: [],
  customCharacters: [],
  favoriteCharacterIds: [],
  isLoading: false,
  
  // キャラクター一覧を設定
  setCharacters: (characters) => set({ characters }),
  
  // カスタムキャラクター一覧を設定
  setCustomCharacters: (customCharacters) => set({ customCharacters }),
  
  // お気に入りキャラクターIDリストを設定
  setFavoriteCharacterIds: (ids) => set({ favoriteCharacterIds: ids }),
  
  // キャラクターを追加
  addCharacter: (character) => 
    set((state) => ({ characters: [...state.characters, character] })),
  
  // カスタムキャラクターを追加
  addCustomCharacter: (customCharacter) => 
    set((state) => ({ 
      customCharacters: [...state.customCharacters, customCharacter] 
    })),
  
  // カスタムキャラクターを更新
  updateCustomCharacter: (id, data) => 
    set((state) => ({
      customCharacters: state.customCharacters.map(char => 
        char.id === id ? { ...char, ...data } : char
      )
    })),
  
  // カスタムキャラクターを削除
  deleteCustomCharacter: (id) => 
    set((state) => ({
      customCharacters: state.customCharacters.filter(char => char.id !== id)
    })),
  
  // お気に入り状態をトグル
  toggleFavorite: (characterId) => 
    set((state) => {
      const isFavorite = state.favoriteCharacterIds.includes(characterId);
      return {
        favoriteCharacterIds: isFavorite
          ? state.favoriteCharacterIds.filter(id => id !== characterId)
          : [...state.favoriteCharacterIds, characterId]
      };
    }),
  
  // ローディング状態を設定
  setLoading: (isLoading) => set({ isLoading }),
}));

// サーバーアクションから参照できるようにエクスポート
export const characterStore = useCharacterStore;
