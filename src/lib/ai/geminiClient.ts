// src/lib/ai/geminiClient.ts
export class GeminiClient {
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  async generateContent(prompt: string, model: string) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    if (!res.ok) throw new Error("Gemini API error");
    const data = await res.json();
    // Geminiのレスポンス構造に応じて修正
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
}
