'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Navigation from './Navigation';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define routes that should completely bypass the default layout (header, main container, footer nav)
  const isCustomRoute =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/restaurant') ||
    pathname.startsWith('/reserve') ||
    pathname.startsWith('/takeaway') ||
    pathname.startsWith('/scan') ||
    pathname.startsWith('/dine-in') ||
    pathname.startsWith('/orders') ||
    pathname === '/loyalty' ||
    pathname === '/profile';

  if (isCustomRoute) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Responsive Header */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b-2 border-primary py-4 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-sora text-2xl font-black text-primary tracking-tight">
              LITTLE BITE
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-accent-red"></span>
          </Link>
          {/* Top Navigation for Tablet / Desktop */}
          <nav className="hidden md:flex items-center gap-8 font-hanken font-bold text-base">
            <Link href="/" className="text-secondary hover:text-primary transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xl">home</span> Explore
            </Link>
            <Link href="/orders" className="text-secondary hover:text-primary transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xl">receipt_long</span> Orders
            </Link>
            <Link href="/loyalty" className="text-secondary hover:text-primary transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xl">card_giftcard</span> Loyalty
            </Link>
            <Link href="/profile" className="text-secondary hover:text-primary transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xl">person</span> Profile
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl w-full mx-auto p-4 md:p-8 pb-32 md:pb-12">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <Navigation />
    </>
  );
}
