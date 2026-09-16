import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/components/store/CartProvider';
import CartDrawer from '@/components/store/CartDrawer';
import GlobalShell from '@/components/layout/GlobalShell';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_ORIGIN ?? 'https://www.lapropagande.net'),
  title: {
    default: 'La Propagande — Paris ↔ Beirut',
    template: '%s — La Propagande',
  },
  description: 'Born from revolt and war. A cultural archive, store and event network between Paris and Beirut.',
  openGraph: {
    siteName: 'La Propagande',
    type: 'website',
    images: [{ url: '/images/brand/slogan-old-world.webp', width: 1200, height: 848 }],
  },
  icons: {
    icon: '/icon.png?v=2',
    shortcut: '/icon.png?v=2',
    apple: '/apple-icon.png?v=2',
  },
};

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/dirty-war.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/ARMY%20RUST.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/retro_computer_personal_use.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/vhs-gothic.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body>
        <CartProvider>
          <GlobalShell>{children}</GlobalShell>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
