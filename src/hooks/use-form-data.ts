// src/hooks/use-form-data.ts
import { useState } from "react";

export interface UseFormDataOptions<T> {
  initialData: T;
  onSubmit: (formData: FormData) => Promise<void>;
}

export function useFormData<T extends Record<string, any>>({
  initialData,
  onSubmit,
}: UseFormDataOptions<T>) {
  const [formData, setFormData] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? Number(value)
          : type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent,
    additionalData?: Record<string, any>,
  ) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = new FormData();

      Object.entries({ ...formData, ...additionalData }).forEach(
        ([key, value]) => {
          if (value !== null && value !== undefined) {
            submitData.append(key, value.toString());
          }
        },
      );

      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    error,
    setError,
    handleChange,
    handleSubmit,
  };
}
