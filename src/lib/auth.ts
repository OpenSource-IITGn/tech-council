import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// List of authorized admin emails
const ADMIN_EMAILS = [
  "mukul.meena@iitgn.ac.in",
  "technical.secretary@iitgn.ac.in",
];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Check if user email is in the admin list
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        return true;
      }

      // Reject sign-in for non-admin users
      return false;
    },
    async session({ session }) {
      // Add admin flag to session
      if (session.user?.email && ADMIN_EMAILS.includes(session.user.email)) {
        session.user.isAdmin = true;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Add admin flag to token
      if (user?.email && ADMIN_EMAILS.includes(user.email)) {
        token.isAdmin = true;
      }
      return token;
    },
  },
  pages: {
    signIn: "/api/auth/signin",
    error: "/admin/error",
  },
  session: {
    strategy: "jwt",
  },
};

// Type augmentation for NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      email?: string | null;
      name?: string | null;
      image?: string | null;
      isAdmin?: boolean;
    };
  }

  interface User {
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin?: boolean;
  }
}
