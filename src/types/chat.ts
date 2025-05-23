// src/types/chat.ts
import { Character, CustomCharacter } from "./character";

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: "user" | "assistant";
  hasImage: boolean;
  imageUrl?: string | null;
  hasVoice: boolean;
  voiceUrl?: string | null;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  characterId?: string | null;
  customCharacterId?: string | null;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
  character?: Character | null;
  customCharacter?: CustomCharacter | null;
  relationship?: Relationship | null;
}

export interface Relationship {
  id: string;
  conversationId: string;
  details: string;
  loveLevel: number;
  mood: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageInput = {
  content: string;
  imagePrompt?: string;
  generateVoice?: boolean;
  aiProvider?: "openai" | "xai";
};

export type ChatState = {
  messages: Message[];
  isLoading: boolean;
  conversation: Conversation | null;
  character: Character | CustomCharacter | null;
  relationship: Relationship | null;
};
