'use client';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';

export default function GlobalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp-page">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
