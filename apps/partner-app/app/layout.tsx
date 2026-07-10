'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useRestaurantStream } from './hooks/useRestaurantStream';
import Providers from './providers';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import './globals.css';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const loading = useAuthStore((s) => s.loading);
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Connect staff to their restaurant's SSE updates stream
  useRestaurantStream(user?.restaurantId || null);

  // If loading, show loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-label-lg text-label-lg text-primary">Loading BISTRO OS...</p>
        </div>
      </div>
    );
  }

  // If login or forgot/reset password paths, render cleanly without sidebar
  const noShellPaths = ['/login', '/forgot-password', '/reset-password'];
  const isNoShell = noShellPaths.includes(pathname) || !user;

  // KDS (Kitchen Display System) is full screen, hide sidebar
  const isKDS = pathname === '/kitchen';

  if (isNoShell || isKDS) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // Desktop sidebar nav items
  const ownerSidebarItems = [
    { name: 'Dashboard', path: '/owner', icon: 'dashboard' },
    { name: 'Operations', path: '/owner/setup', icon: 'storefront' },
    { name: 'Menu', path: '/owner/menu', icon: 'restaurant_menu' },
    { name: 'Staff', path: '/owner/staff', icon: 'badge' },
    { name: 'Rules', path: '/owner/settings', icon: 'settings_applications' },
    { name: 'Insights', path: '/owner/analytics', icon: 'analytics' },
  ];

  const managerSidebarItems = [
    { name: 'Floor Plan', path: '/manager', icon: 'table_restaurant' },
    { name: 'Queue', path: '/manager/queue', icon: 'queue' },
    { name: 'Reservations', path: '/manager/reservations', icon: 'book_online' },
    { name: 'Orders', path: '/manager/orders', icon: 'receipt' },
    { name: 'Takeaway', path: '/manager/takeaway', icon: 'local_mall' },
  ];

  // Mobile bottom tab items
  const ownerMobileNav = [
    { name: 'Dashboard', path: '/owner', icon: 'dashboard' },
    { name: 'Ops', path: '/owner/setup', icon: 'storefront' },
    { name: 'Menu', path: '/owner/menu', icon: 'restaurant_menu' },
    { name: 'Staff', path: '/owner/staff', icon: 'badge' },
    { name: 'Insights', path: '/owner/analytics', icon: 'analytics' },
  ];

  const managerMobileNav = [
    { name: 'Floor', path: '/manager', icon: 'table_restaurant' },
    { name: 'Queue', path: '/manager/queue', icon: 'queue' },
    { name: 'Reservations', path: '/manager/reservations', icon: 'book_online' },
    { name: 'Orders', path: '/manager/orders', icon: 'receipt' },
    { name: 'Takeaway', path: '/manager/takeaway', icon: 'local_mall' },
  ];

  const sidebarItems = user.role === 'OWNER' ? ownerSidebarItems : user.role === 'MANAGER' ? managerSidebarItems : [];
  const mobileNavItems = user.role === 'OWNER' ? ownerMobileNav : user.role === 'MANAGER' ? managerMobileNav : [];

  const isActive = (path: string) => {
    if (path === '/owner' || path === '/manager') return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface">
      {/* ═══════════════════════════════════════ */}
      {/*  DESKTOP LAYOUT                         */}
      {/* ═══════════════════════════════════════ */}
      <div className="hidden md:flex min-h-screen">
        {/* Left Sidebar */}
        <aside className="w-72 fixed left-0 top-0 h-screen flex flex-col py-lg px-md overflow-y-auto bg-surface-container-low z-50">
          {/* Brand */}
          <div className="mb-lg">
            <h1 className="font-display-md text-display-md text-primary tracking-tighter leading-none">BISTRO OS</h1>
            <p className="font-label-lg text-label-lg text-on-surface-variant mt-xs">Partner Dashboard</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-sm">
            {sidebarItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-base font-label-lg text-label-lg p-md rounded-lg transition-colors duration-200 ${
                    active
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-on-surface-variant hover:bg-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="pt-lg border-t border-outline-variant mt-lg space-y-sm">
            <Link
              href="/owner/menu"
              className="w-full bg-primary text-on-primary font-label-lg text-label-lg py-md rounded-full shadow-lg hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-base"
            >
              <span className="material-symbols-outlined">bolt</span>
              Live Orders
            </Link>
            <div className="mt-md space-y-xs">
              <Link
                href="/owner/complaints"
                className={`flex items-center gap-base text-on-surface-variant font-label-lg text-label-lg p-sm hover:bg-surface-variant transition-colors duration-200 rounded-lg ${
                  isActive('/owner/complaints') ? 'bg-primary-container text-on-primary-container' : ''
                }`}
              >
                <span className="material-symbols-outlined">chat_bubble</span>
                <span>Feedback</span>
              </Link>
              <a className="flex items-center gap-base text-on-surface-variant font-label-lg text-label-lg p-sm hover:bg-surface-variant transition-colors duration-200 rounded-lg" href="#">
                <span className="material-symbols-outlined">help_center</span>
                <span>Support</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content (offset by sidebar width) */}
        <main className="pl-72 w-full min-h-screen">
          {/* Top App Bar */}
          <header className="flex justify-between items-center w-full pl-md pr-margin h-20 bg-surface sticky top-0 z-40">
            <div className="flex items-center gap-md">
              <div className="relative w-80">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input
                  className="w-full bg-surface-container-high border-none rounded-full py-2 pl-12 pr-4 font-label-lg text-on-surface focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Search analytics or orders..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-md">
              <button className="bg-outline border-2 border-on-surface text-on-surface px-md py-2 rounded-full font-label-lg hover:bg-surface-container-high transition-all active:scale-95">
                Add Branch
              </button>
              <div className="flex items-center gap-base">
                <button className="p-base hover:bg-surface-container-high rounded-full transition-all relative">
                  <span className="material-symbols-outlined">notifications</span>
                </button>
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-label-lg text-on-secondary-container font-bold overflow-hidden">
                  {user.name?.slice(0, 2).toUpperCase() || 'OS'}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <section className="p-margin max-w-[1400px] mx-auto">
            {children}
          </section>
        </main>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/*  MOBILE LAYOUT                          */}
      {/* ═══════════════════════════════════════ */}
      <div className="md:hidden min-h-screen flex flex-col pb-24">
        {/* Mobile Top Bar */}
        <header className="sticky top-0 z-40 bg-surface w-full h-20 px-margin flex justify-between items-center">
          <h1 className="font-display-md text-display-md text-primary tracking-tighter">BISTRO OS</h1>
          <div className="flex gap-sm">
            <button className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-variant transition-all active:scale-95">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-variant transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
            </button>
          </div>
        </header>

        {/* Mobile Page Content */}
        <main className="px-margin pt-base pb-xl flex-1">
          {children}
        </main>

        {/* Mobile Bottom Tab Bar */}
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-surface border-t border-outline-variant/30 flex justify-around items-center px-md z-40">
          {mobileNavItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center gap-xs ${active ? 'text-primary' : 'text-on-surface-variant opacity-60'}`}
              >
                <div className={`w-12 h-8 flex items-center justify-center rounded-full ${active ? 'bg-primary-container' : ''}`}>
                  <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                </div>
                <span className="font-label-sm text-label-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Profile Drawer */}
      {sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} className="md:hidden fixed inset-0 bg-black/40 z-50" />
          <div className="md:hidden fixed right-0 top-0 bottom-0 w-72 bg-surface z-50 p-lg space-y-md shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="font-headline-sm text-headline-sm">Profile</h2>
              <button onClick={() => setSidebarOpen(false)} className="material-symbols-outlined p-2 rounded-full hover:bg-surface-variant">close</button>
            </div>
            <div className="flex items-center gap-md p-md bg-surface-container rounded-xl">
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center font-label-lg text-on-primary-container font-bold">
                {user.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-label-lg text-label-lg text-on-surface">{user.name}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{user.email}</p>
              </div>
            </div>
            <div className="space-y-sm">
              <Link href="/owner/settings" onClick={() => setSidebarOpen(false)} className="flex items-center gap-base p-sm rounded-lg hover:bg-surface-variant font-label-lg text-label-lg text-on-surface-variant">
                <span className="material-symbols-outlined">settings</span>
                <span>Business Settings</span>
              </Link>
              <Link href="/owner/complaints" onClick={() => setSidebarOpen(false)} className="flex items-center gap-base p-sm rounded-lg hover:bg-surface-variant font-label-lg text-label-lg text-on-surface-variant">
                <span className="material-symbols-outlined">chat_bubble</span>
                <span>Guest Feedback</span>
              </Link>
            </div>
            <button
              onClick={logout}
              className="w-full mt-lg bg-error text-on-error py-md rounded-full font-label-lg text-label-lg active:scale-95 transition-all"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Sora:wght@400;700;800&family=Hanken+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-background text-on-surface">
        <Providers>
          <DashboardShell>{children}</DashboardShell>
        </Providers>
      </body>
    </html>
  );
}
