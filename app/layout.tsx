import type {Metadata} from 'next';
import './globals.css';
import { ClientProviders } from './providers';
import { Outfit, Space_Grotesk } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

export const metadata: Metadata = {
  title: 'TEMANCODING | Vibe Coding Assistant',
  description: 'Mau bikin apa hari ini?',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${outfit.variable} ${space.variable} dark`}>
      <body className="bg-zinc-950 text-zinc-100 font-sans min-h-screen flex flex-col antialiased selection:bg-indigo-500/30 overflow-x-hidden" suppressHydrationWarning>
        <ClientProviders>
          {/* Subtle minimal background accents */}
          <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#09090B]">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20" style={{ backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          </div>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
