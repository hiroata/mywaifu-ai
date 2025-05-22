// src/lib/__mocks__/openai.ts
export const createSystemPrompt = (character: any) => {
  return `あなたは${character.name}というキャラクターです。`;
};

export async function createChatCompletion() {
  return {
    choices: [
      {
        message: {
          content: "これはテスト応答です。",
        },
      },
    ],
  };
}
