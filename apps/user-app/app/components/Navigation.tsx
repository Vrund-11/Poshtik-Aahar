'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  // Hide navigation bar on auth pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const navItems = [
    { label: 'Explore', path: '/', icon: 'home' },
    { label: 'Orders', path: '/orders', icon: 'receipt_long' },
    { label: 'Loyalty', path: '/loyalty', icon: 'card_giftcard' },
    { label: 'Profile', path: '/profile', icon: 'person' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-8 bg-white/90 backdrop-blur-xl border-t border-primary/20 shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
      {navItems.map((item) => {
        const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));

        if (isActive) {
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex flex-col items-center justify-center bg-primary text-white rounded-2xl px-6 py-2.5 scale-100 shadow-xl shadow-primary/20 transition-all duration-300"
            >
              <span className="material-symbols-outlined fill-icon text-xl">{item.icon}</span>
              <span className="font-hanken font-extrabold text-[10px] uppercase tracking-widest mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.path}
            href={item.path}
            className="flex flex-col items-center justify-center text-secondary hover:text-primary transition-all p-2 rounded-xl"
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span className="font-hanken font-bold text-xs mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
