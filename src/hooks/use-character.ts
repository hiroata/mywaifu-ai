// src/hooks/use-character.ts
import { useCallback } from "react";
import { useCharacterStore } from "@/store/character-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Character, CustomCharacter, CharacterFormData } from "@/types/character";

export function useCharacters() {
  const { characters, setCharacters, isLoading, setLoading } = useCharacterStore();
  const queryClient = useQueryClient();

  // キャラクター一覧取得
  const { data, isLoading: isQueryLoading, refetch } = useQuery({
    queryKey: ["characters"],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/characters");
        if (!response.ok) {
          throw new Error("キャラクター一覧の取得に失敗しました");
        }
        const data = await response.json();
        setCharacters(data.data);
        return data.data;
      } finally {
        setLoading(false);
      }
    },
  });

  return {
    characters: characters.length ? characters : data || [],
    isLoading: isLoading || isQueryLoading,
    refetch,
  };
}

export function useCustomCharacters() {
  const {
    customCharacters,
    setCustomCharacters,
    addCustomCharacter,
    updateCustomCharacter,
    deleteCustomCharacter,
    isLoading,
    setLoading,
  } = useCharacterStore();
  const queryClient = useQueryClient();

  // カスタムキャラクター一覧取得
  const { data, isLoading: isQueryLoading, refetch } = useQuery({
    queryKey: ["customCharacters"],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/custom-characters");
        if (!response.ok) {
          throw new Error("カスタムキャラクター一覧の取得に失敗しました");
        }
        const data = await response.json();
        setCustomCharacters(data.data);
        return data.data;
      } finally {
        setLoading(false);
      }
    },
  });

  // カスタムキャラクター作成ミューテーション
  const createMutation = useMutation({
    mutationFn: async (formData: CharacterFormData) => {
      const form = new FormData();
      
      // テキストフィールドをFormDataに追加
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "profileImage" && key !== "tags" && value !== undefined) {
          form.append(key, String(value));
        }
      });
      
      // 画像ファイルを追加
      if (formData.profileImage) {
        form.append("profileImage", formData.profileImage);
      }
      
      // タグを追加
      if (formData.tags && formData.tags.length > 0) {
        form.append("tags", JSON.stringify(formData.tags));
      }
      
      const response = await fetch("/api/custom-characters", {
        method: "POST",
        body: form,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "キャラクター作成に失敗しました");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      addCustomCharacter(data.data);
      queryClient.invalidateQueries({ queryKey: ["customCharacters"] });
    },
  });

  // カスタムキャラクター更新ミューテーション
  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: CharacterFormData }) => {
      const form = new FormData();
      
      // テキストフィールドをFormDataに追加
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "profileImage" && key !== "tags" && value !== undefined) {
          form.append(key, String(value));
        }
      });
      
      // 画像ファイルを追加
      if (formData.profileImage) {
        form.append("profileImage", formData.profileImage);
      }
      
      // タグを追加
      if (formData.tags && formData.tags.length > 0) {
        form.append("tags", JSON.stringify(formData.tags));
      }
      
      const response = await fetch(`/api/custom-characters/${id}`, {
        method: "PUT",
        body: form,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "キャラクター更新に失敗しました");
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      updateCustomCharacter(variables.id, data.data);
      queryClient.invalidateQueries({ queryKey: ["customCharacters"] });
    },
  });

  // カスタムキャラクター削除ミューテーション
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/custom-characters/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "キャラクター削除に失敗しました");
      }
      
      return response.json();
    },
    onSuccess: (_, id) => {
      deleteCustomCharacter(id);
      queryClient.invalidateQueries({ queryKey: ["customCharacters"] });
    },
  });

  return {
    customCharacters: customCharacters.length ? customCharacters : data || [],
    isLoading: isLoading || isQueryLoading,
    refetch,
    createCharacter: createMutation.mutateAsync,
    updateCharacter: updateMutation.mutateAsync,
    deleteCharacter: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
