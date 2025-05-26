// NextAuth configuration
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import GoogleProvider from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  debug: process.env.AUTH_DEBUG === "true",
  trustHost: true,
  providers: [    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: (profile as any).role ?? "user",
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("🔐 Auth signIn callback:", {
        provider: account?.provider,
        email: user?.email,
        userExists: !!user,
      });
      return true;
    },    async redirect({ url, baseUrl }) {
      console.log("🔄 Auth redirect callback:", { url, baseUrl });
      
      // Allow specific error handling URLs
      if (url.includes("/auth/error")) {
        return url;
      }
      
      // Prevent infinite redirects to auth API endpoints
      if (url.includes("/api/auth/") && !url.includes("/auth/error")) {
        console.log("⚠️ Preventing redirect to auth API, defaulting to dashboard");
        return `${baseUrl}/dashboard`;
      }
      
      // Handle successful authentication redirects
      if (url === baseUrl || url === `${baseUrl}/` || url === `${baseUrl}/login` || url === `${baseUrl}/register`) {
        console.log("✅ Successful auth, redirecting to dashboard");
        return `${baseUrl}/dashboard`;
      }
      
      // Allow relative URLs (within the same domain)
      if (url.startsWith("/") && !url.startsWith("//")) {
        return `${baseUrl}${url}`;
      }
      
      // Allow absolute URLs on the same domain
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // Default fallback
      console.log("🏠 Default redirect to dashboard");
      return `${baseUrl}/dashboard`;
    },
    async session({ session, token, user }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token?.role && session.user) {
        session.user.role = token.role as string;
      }
      // If using database strategy, user object from DB is available
      if (user?.role && session.user) {
        session.user.role = user.role;
      }
      if (user?.id && session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        // This block runs on sign-in
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        // Ensure role from user object (potentially from profile mapping) is added to token
        token.role = (user as any).role || "user";
      }
      return token;
    },
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? `__Secure-next-auth.session-token`
          : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // Remove domain setting for Render.com compatibility
      },
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === "production"
          ? `__Secure-next-auth.callback-url`
          : `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === "production"
          ? `__Host-next-auth.csrf-token`
          : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/auth/error",
  },
  events: {
    async signIn(message) {
      console.log("✅ User signed in:", {
        user: message.user,
        account: message.account,
      });
    },
    async signOut(message) {
      // For signOut, the message object might be { session: AdapterSession | undefined } or { token: JWT | undefined }
      // depending on the session strategy and how signOut is called.
      // It's safer to check for properties before accessing them.
      if ("session" in message) {
        console.log("👋 User signed out (session event):", {
          session: message.session,
        });
      }
      if ("token" in message) {
        console.log("👋 User signed out (token event):", { token: message.token });
      }
    },
    async createUser(message) {
      console.log("👤 New user created:", { user: message.user });
    },
    async session(message) {
      // For session event, message is { session: AdapterSession, token: JWT }
      console.log("🔄 Session event:", { session: message.session, token: message.token });
    },
    async linkAccount(message) {
      console.log("🔗 Account linked:", {
        user: message.user,
        account: message.account,
        profile: message.profile,
      });
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
