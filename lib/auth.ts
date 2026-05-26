import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { query } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev_mode_only",
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Initialize tables if they don't exist
          await query(`
            CREATE TABLE IF NOT EXISTS public.users (
              user_id TEXT PRIMARY KEY,
              name TEXT,
              email TEXT UNIQUE,
              avatar TEXT,
              credits INTEGER DEFAULT 8
            )
          `);
          await query(`
            CREATE TABLE IF NOT EXISTS public.projects (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id TEXT,
              title TEXT,
              idea TEXT NOT NULL,
              answers JSONB,
              status TEXT NOT NULL DEFAULT 'draft',
              result JSONB,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
          `);

          // Check if user exists
          const res = await query('SELECT * FROM public.users WHERE email = $1', [user.email]);
          if (res.rows.length === 0) {
            // Provide an initial credits value
            await query(
              `INSERT INTO public.users (user_id, name, email, avatar, credits) 
               VALUES ($1, $2, $3, $4, $5)`,
              [uuidv4(), user.name, user.email, user.image, 8]
            );
          }
        } catch (error) {
          console.error("Error creating user in DB during sign in:", error);
          // Still allow sign in to proceed even if db recording fails
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user?.email) {
        try {
          const res = await query('SELECT user_id, credits, avatar FROM public.users WHERE email = $1', [session.user.email]);
          if (res.rows.length > 0) {
            session.user.id = res.rows[0].user_id;
            session.user.credits = res.rows[0].credits;
            session.user.image = res.rows[0].avatar || session.user.image;
          }
        } catch (error) {
          // If DB is not connected, default fallback
          session.user.credits = 8;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
  }
};
