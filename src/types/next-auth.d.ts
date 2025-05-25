// src/types/next-auth.d.ts
import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role?: string
    }
  }
}
