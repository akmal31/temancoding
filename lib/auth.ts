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
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists
          const res = await query('SELECT * FROM public.users WHERE email = $1', [user.email]);
          if (res.rows.length === 0) {
            // Provide an initial credits value
            await query(
              `INSERT INTO public.users (user_id, name, email, avatar, credits) 
               VALUES ($1, $2, $3, $4, $5)`,
              [user.id || uuidv4(), user.name, user.email, user.image, 8]
            );
          } else {
             // Optional: Update avatar or name if needed, but we don't have to.
          }
        } catch (error) {
          console.error("Error creating user in DB during sign in:", error);
          return true; // Still allow sign in to proceed even if db recording fails
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
