'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import './globals.css';

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setSidebarOpen(prev => !prev);
    window.addEventListener('toggle-admin-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-admin-sidebar', handleToggle);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF7] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#FF5F1F] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-bold text-sm text-[#FF5F1F]">Loading Admin Console...</p>
        </div>
      </div>
    );
  }

  const noShellPaths = ['/login', '/forgot-password', '/reset-password'];
  const isNoShell = noShellPaths.includes(pathname) || !user;

  if (isNoShell) {
    return <div className="min-h-screen bg-[#fff8f0]">{children}</div>;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
    { name: 'Restaurants', path: '/admin/restaurants', icon: 'storefront' },
    { name: 'Customers', path: '/admin/customers', icon: 'group' },
    { name: 'Analytics', path: '/admin/analytics', icon: 'monitoring' },
    { name: 'Settings', path: '/admin/settings', icon: 'settings' },
  ];

  const mobileNavItems = [
    { name: 'Dashboard', path: '/admin', icon: 'grid_view' },
    { name: 'Restaurants', path: '/admin/restaurants', icon: 'storefront' },
    { name: 'Customers', path: '/admin/customers', icon: 'group' },
    { name: 'Tickets', path: '/admin/complaints', icon: 'chat_bubble' },
    { name: 'Insights', path: '/admin/analytics', icon: 'monitoring' },
  ];

  return (
    <div className="min-h-screen bg-[#FFFBF7] flex flex-col text-[#52443C]" style={{ fontFamily: "'Public Sans', 'Plus Jakarta Sans', sans-serif" }}>
      <div className="flex flex-1 relative min-h-screen">
        {/* Left Sidebar — Desktop only */}
        <aside
          className={`w-64 bg-[#FFFBF7] flex flex-col border-r border-[#D7C3B1] fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:translate-x-0 overflow-y-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ scrollbarWidth: 'none' }}
        >
          {/* Brand Identity */}
          <div className="px-6 py-5 flex items-center justify-between">
            <h1 className="text-sm font-bold text-[#FF5F1F] uppercase tracking-tight">Partner Portal</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden material-symbols-outlined text-[#FF5F1F] p-1"
            >
              close
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 px-2">
            {navItems.map((item) => {
              const active = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg mx-2 my-1 p-3 transition-all duration-200 ${
                    active
                      ? 'text-[#4E1000] bg-[#FFDBCF] ring-2 ring-[#E64A19]'
                      : 'text-[#52443C] hover:bg-[#F5EFE6]/50'
                  }`}
                >
                  <span 
                    className="material-symbols-outlined text-xl" 
                    style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm font-bold">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Bottom */}
          <div className="mt-auto px-4 pb-4">
            <div className="p-4 bg-[#FFEDE6] rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF5F1F] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'AD'}
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-sm font-bold text-[#321300] truncate">{user.name}</p>
                <p className="text-xs text-[#321300]/70 truncate">Super Admin</p>
              </div>
              <button
                onClick={logout}
                className="material-symbols-outlined text-[#52443C] hover:text-[#FF5F1F] p-1 rounded-lg transition-colors flex-shrink-0 text-xl"
              >
                logout
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 z-30"
          />
        )}

        {/* Top App Bar */}
        <header className="fixed top-0 right-0 left-0 md:left-64 bg-[#FFFBF7] flex justify-between items-center px-6 py-3 z-20 border-b border-[#D7C3B1]">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-[#FF5F1F]"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="text-sm font-extrabold uppercase tracking-tighter text-[#FF5F1F]">Umami Admin</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4 text-[#52443C] text-sm">
              <Link className="text-[#E64A19] font-bold hover:opacity-80 transition-opacity" href="/admin">Overview</Link>
              <Link className="hover:text-[#E64A19] transition-colors" href="/admin/analytics">Reports</Link>
              <Link className="hover:text-[#E64A19] transition-colors" href="/admin/settings">Support</Link>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#FF5F1F]/20 hover:scale-95 transition-all cursor-pointer bg-[#FFEDE6] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#FF5F1F]">person</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col md:pl-64 min-h-screen">
          <main className="flex-grow flex flex-col min-h-screen pt-16 pb-20 md:pb-4">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-4 bg-[#FEF7F0] shadow-[0_-4px_10px_rgba(0,0,0,0.08)] z-50 rounded-t-xl">
        {mobileNavItems.map((item) => {
          const active = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                active
                  ? 'text-[#E64A19] bg-[#F5EFE6] rounded-full scale-90 ring-2 ring-[#FF5F1F]/20'
                  : 'text-[#52443C] hover:bg-[#FFEDE6]/20'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-[10px] mt-1 font-bold">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800&family=Anton&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-[#FFFBF7]" style={{ fontFamily: "'Public Sans', 'Plus Jakarta Sans', sans-serif" }}>
        <AuthProvider>
          <AdminShell>{children}</AdminShell>
        </AuthProvider>
      </body>
    </html>
  );
}
