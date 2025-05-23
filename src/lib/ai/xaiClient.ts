// src/lib/ai/xaiClient.ts
export class XAIClient {
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  async generateContent(prompt: string, model: string) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024
      })
    });
    if (!res.ok) throw new Error("Grok API error");
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }
}
