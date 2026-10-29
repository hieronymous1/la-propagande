'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import Ticker from '@/components/layout/Ticker';
import { EffectsProvider } from '@/components/system/EffectsProvider';
import { PaletteProvider } from '@/components/system/CommandPalette';

export default function GlobalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <EffectsProvider>
    <PaletteProvider>
      <div className="lp-page flex min-h-screen flex-col">
        <Navbar />
        <Ticker className="border-b border-[var(--lp-color-border-subtle)] bg-[var(--lp-color-bg-absolute)]" />
        <main id="lp-main" className="lp-route flex-1" key={pathname}>
          {children}
        </main>
        <Footer />
      </div>
    </PaletteProvider>
    </EffectsProvider>
  );
}
