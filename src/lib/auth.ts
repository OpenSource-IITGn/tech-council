import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getAdminEmails } from "./admin-emails-storage";

// Get admin emails dynamically from storage
async function getAuthorizedEmails(): Promise<string[]> {
  try {
    const adminEmails = await getAdminEmails();
    return adminEmails.emails;
  } catch (error) {
    console.error("Error loading admin emails, using fallback:", error);
    // Fallback to hardcoded emails if storage fails
    return [
      "mukul.meena@iitgn.ac.in",
      "technical.secretary@iitgn.ac.in",
    ];
  }
}

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
      const authorizedEmails = await getAuthorizedEmails();
      if (user.email && authorizedEmails.includes(user.email)) {
        return true;
      }

      // Reject sign-in for non-admin users
      return false;
    },
    async session({ session }) {
      // Add admin flag to session
      const authorizedEmails = await getAuthorizedEmails();
      if (session.user?.email && authorizedEmails.includes(session.user.email)) {
        session.user.isAdmin = true;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Add admin flag to token
      const authorizedEmails = await getAuthorizedEmails();
      if (user?.email && authorizedEmails.includes(user.email)) {
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
