import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/components/store/CartProvider';
import CartDrawer from '@/components/store/CartDrawer';
import GlobalShell from '@/components/layout/GlobalShell';

export const metadata: Metadata = {
  title: 'La Propagande',
  description: 'Born from revolt and war. Based between Paris and Beirut.',
  icons: {
    icon: '/icon.png?v=2',
    shortcut: '/icon.png?v=2',
    apple: '/apple-icon.png?v=2',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png?v=2" sizes="any" />
        <link rel="shortcut icon" href="/icon.png?v=2" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=2" />
        <link rel="preload" href="/fonts/ARMY%20RUST.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/retro_computer_personal_use.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <CartProvider>
          <GlobalShell>{children}</GlobalShell>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
