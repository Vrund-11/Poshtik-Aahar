import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import Navigation from './components/Navigation';
import LayoutWrapper from './components/LayoutWrapper';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'LITTLE BITE - Restaurant Discovery & Tableside Ordering',
  description: 'Fast, frictionless tableside QR ordering, reservations, and takeaway.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Plus+Jakarta+Sans:wght@400;600;700&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-background text-on-background">
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
