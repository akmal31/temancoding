import React, { createContext, useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

type User = {
  id: string;
  name: string;
  avatar: string;
  credits: number;
} | null;

interface AppContextType {
  user: User;
  login: () => void;
  logout: () => void;
  // Note: to deduct credits robustly over DB, we should do it server-side.
  // These frontend functions are kept for compatibility but should trigger a session update or be removed.
  addCredits: (amount: number) => Promise<void>;
  deductCredit: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession();

  const user: User = session?.user ? {
    id: session.user.id || '',
    name: session.user.name || 'User',
    avatar: session.user.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${session.user.name}`,
    credits: session.user.credits || 0,
  } : null;

  const login = () => signIn('google');
  const logout = () => signOut();

  // We map the optimisic updates. The true update to DB must be handled by an API route separately.
  const addCredits = async (amount: number) => {
    if (user) {
      // Backend call
      try {
        await fetch('/api/topup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Mock cost parameter based on amount
          body: JSON.stringify({ amount: amount * 10000, credits: amount })
        });
        await update(); // force reload session from db
      } catch (e) {
        console.error(e);
      }
    }
  };

  const deductCredit = async () => {
    if (user && user.credits > 0) {
      try {
        const res = await fetch('/api/deduct', { method: 'POST' });
        if (res.ok) {
          await update();
          return true;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return false;
  };

  return (
    <AppContext.Provider value={{ user, login, logout, addCredits, deductCredit }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

