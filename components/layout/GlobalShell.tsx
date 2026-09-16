'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { PaletteProvider } from '@/components/system/CommandPalette';

export default function GlobalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRoot = pathname === '/';

  return (
    <PaletteProvider>
      <div className="lp-page flex min-h-screen flex-col">
        <Navbar />
        <main id="lp-main" className="lp-route flex-1" key={pathname}>
          {children}
        </main>
        {isRoot ? null : <Footer />}
      </div>
    </PaletteProvider>
  );
}
