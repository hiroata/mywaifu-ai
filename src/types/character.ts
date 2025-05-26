// src/types/character.ts
import { Tag } from "./index";

export interface Character {
  id: string;
  name: string;
  description: string;
  shortDescription?: string | null;
  age?: number | null;
  gender: "male" | "female" | "other";
  type: "real" | "anime";
  personality: string;
  profileImageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: Tag[];
}

export interface CustomCharacter extends Character {
  userId: string;
}

export interface CharacterImage {
  id: string;
  characterId: string;
  imageUrl: string;
  isProfileImage: boolean;
  type: string; // "default", "casual", "swimsuit", etc.
}

export interface CharacterVoice {
  id: string;
  characterId: string;
  voiceId: string;
  sampleUrl: string;
}

export type CharacterFormData = {
  name: string;
  description: string;
  shortDescription?: string;
  age?: number;
  gender: "male" | "female" | "other";
  type: "real" | "anime";
  personality: string;
  profileImage?: File;
  tags: string[];
};
