// src/hooks/use-api.ts
import { useState } from "react";
import { APIResponse } from "@/types";

export function useApi<T, P = any>(
  apiFunction: (params: P) => Promise<Response>
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (params: P): Promise<APIResponse<T>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiFunction(params);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "APIリクエストに失敗しました");
      }
      
      setData(result.data);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "不明なエラーが発生しました";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    error,
    isLoading,
    execute,
  };
}
