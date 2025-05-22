// src/types/index.ts
import { User } from "@prisma/client";

export interface Tag {
  id: string;
  name: string;
}

export interface ExtendedUser extends User {
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionEndsAt?: Date | null;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId?: string | null;
  stripePriceId?: string | null;
  stripeSubscriptionId?: string | null;
  status: string;
  plan: string;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type APIResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  nextCursor?: string;
};
