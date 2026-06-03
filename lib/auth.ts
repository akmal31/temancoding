import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    ...(process.env.NODE_ENV !== "production"
      ? [
          CredentialsProvider({
            name: "Local Bypass",
            credentials: {},
            async authorize() {
              return {
                id: "local-dev-user-id",
                name: "Akil (Local Dev)",
                email: "localdev@example.com",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=localdev",
              };
            },
          }),
        ]
      : []),
  ],
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev_mode_only",
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true; 
      }
      
      if (account?.provider === "google") {
        try {
          // Initialize tables if they don't exist
          await query(`
            CREATE TABLE IF NOT EXISTS public.users (
              user_id TEXT PRIMARY KEY,
              name TEXT,
              email TEXT UNIQUE,
              avatar TEXT,
              credits INTEGER DEFAULT 0,
              role TEXT DEFAULT 'user',
              password TEXT DEFAULT '',
              credits_expired_at TIMESTAMP WITH TIME ZONE,
              is_unlimited BOOLEAN DEFAULT FALSE
            )
          `);
          
          try {
             await query(`ALTER TABLE public.users ALTER COLUMN credits SET DEFAULT 0;`);
             await query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';`);
             await query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT DEFAULT '';`);
             await query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS credits_expired_at TIMESTAMP WITH TIME ZONE;`);
             await query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_unlimited BOOLEAN DEFAULT FALSE;`);
          } catch(e) {}

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
          
          try {
             await query(`ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS result JSONB`);
             await query(`ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`);
          } catch(e) {}

          // Check if user exists
          const res = await query('SELECT * FROM public.users WHERE email = $1', [user.email]);
          if (res.rows.length === 0) {
            // Provide an initial credits value (0), empty password and 'user' role
            await query(
              `INSERT INTO public.users (user_id, name, email, avatar, credits, role, password) 
               VALUES ($1, $2, $3, $4, $5, 'user', '')`,
              [user.id || uuidv4(), user.name, user.email, user.image, 0]
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
      if (session?.user?.email === "localdev@example.com") {
        session.user.id = "local-dev-user-id";
        session.user.credits = 8;
        (session.user as any).credits_expired_at = null;
        (session.user as any).is_unlimited = false;
        (session.user as any).role = "user";
        return session;
      }
      if (session?.user?.email) {
        try {
          const res = await query('SELECT user_id, credits, avatar, credits_expired_at, is_unlimited, role FROM public.users WHERE email = $1', [session.user.email]);
          if (res.rows.length > 0) {
            session.user.id = res.rows[0].user_id;
            session.user.credits = res.rows[0].credits || 0;
            session.user.image = res.rows[0].avatar || session.user.image;
            (session.user as any).credits_expired_at = res.rows[0].credits_expired_at ? new Date(res.rows[0].credits_expired_at).toISOString() : null;
            (session.user as any).is_unlimited = !!res.rows[0].is_unlimited;
            (session.user as any).role = res.rows[0].role || 'user';
          }
        } catch (error) {
          // If DB is not connected, default fallback
          session.user.credits = 0;
          (session.user as any).credits_expired_at = null;
          (session.user as any).is_unlimited = false;
          (session.user as any).role = "user";
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: { httpOnly: true, sameSite: 'none', path: '/', secure: true }
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: { sameSite: 'none', path: '/', secure: true }
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: { httpOnly: true, sameSite: 'none', path: '/', secure: true }
    },
    pkceCodeVerifier: {
      name: `__Secure-next-auth.pkce.code_verifier`,
      options: { httpOnly: true, sameSite: 'none', path: '/', secure: true }
    },
    state: {
      name: `__Secure-next-auth.state`,
      options: { httpOnly: true, sameSite: 'none', path: '/', secure: true }
    },
    nonce: {
      name: `__Secure-next-auth.nonce`,
      options: { httpOnly: true, sameSite: 'none', path: '/', secure: true }
    }
  },
  pages: {
    signIn: '/login',
  }
};
