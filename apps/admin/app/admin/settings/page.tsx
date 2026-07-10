'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function AdminSettings() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('Senior Admin Console');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Platform Defaults
  const [trialDays, setTrialDays] = useState(30);
  const [defaultPlan, setDefaultPlan] = useState('TRIAL');
  const [commissionRate, setCommissionRate] = useState(12.5);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSuccess('Account settings updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSaveDefaults = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('Platform default variables updated!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleIncrement = () => setTrialDays(prev => prev + 5);
  const handleDecrement = () => setTrialDays(prev => Math.max(1, prev - 5));

  return (
    <>
      {/* MOBILE VIEW */}
      <div className="flex md:hidden min-h-screen w-full flex-col bg-[#fff8f0] pb-32 text-[#1f1b10] font-sans antialiased">
        {/* Top App Bar */}
        <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 h-20 bg-[#fff8f0] shadow-sm">
          <div className="flex items-center gap-3">
            <span 
              onClick={() => window.dispatchEvent(new Event('toggle-admin-sidebar'))}
              className="material-symbols-outlined text-[#b02f00] cursor-pointer active:scale-95 transition-transform"
            >
              menu
            </span>
            <h1 className="font-[Anton] text-[28px] text-[#b02f00] uppercase tracking-tighter">UMAMI OS</h1>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-[#b02f00] overflow-hidden hover:opacity-80 transition-opacity cursor-pointer">
            <img className="w-full h-full object-cover" alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXEVlkXIV4P2TEmuvXP27EmDjNgVGMN4kGwUF9wuA2Zo2r-zw5QpQ5Np8mD61je1OvSGwRLHR5IwfjiLHLFNsipahU1z9130biIm76nIIgYVWS_6Pcsy-o_gD0CXmumHLMwefeX681ZjnsgkocfDwfWX1rRbcoIFmH8Sm-VM7Ii8STCR6WHLwA01Lxwmh765-ki9RNbI1vIFVnmswx1ix14Tb4Uo-MojbNZSnOO9lGQU0HZ0rhbcc2nrDumwlc0MSqKW-S_YWO708"/>
          </div>
        </header>

        <main className="px-6 pt-4 space-y-6">
          {/* Identity Header Card */}
          <section className="bg-[#fcf3e1] p-4 rounded-xl flex items-center gap-4 border border-[#e4beb4] soft-umami-shadow">
            <div className="w-14 h-14 bg-[#fdc8bf] rounded-full border-2 border-[#b02f00] flex items-center justify-center font-[Anton] text-[20px] text-[#b02f00]">
              JM
            </div>
            <div>
              <h2 className="font-bold text-[18px] text-[#1f1b10] leading-none">Julian Moretti</h2>
              <p className="text-[11px] font-bold text-[#7c544e] uppercase tracking-wider mt-1">Platform Administrator</p>
              <span className="inline-block mt-2 bg-[#1f1b10] text-[#ff5722] px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">Root Console</span>
            </div>
          </section>

          {success && (
            <div className="bg-[#D1FAE5] border border-[#16A34A] text-[#065F46] font-bold text-xs p-3 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-[#ffdad6] border border-[#ba1a1a] text-[#ba1a1a] font-bold text-xs p-3 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Account Form */}
          <section className="bg-white border-2 border-[#1f1b10] rounded-2xl p-5 space-y-4 soft-umami-shadow">
            <h3 className="font-[Anton] text-[18px] text-[#1f1b10] uppercase tracking-wide">Account Settings</h3>
            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#5b4039] uppercase">Display Name</label>
                <input 
                  className="w-full h-12 px-4 rounded-full border-2 border-[#5b4039] text-xs focus:ring-0 focus:border-[#b02f00]" 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#5b4039] uppercase">Admin Email</label>
                <input 
                  className="w-full h-12 px-4 rounded-full border-2 border-[#5b4039]/40 bg-[#eae2d0]/20 text-xs text-[#5b4039]/60 cursor-not-allowed" 
                  disabled
                  type="email" 
                  value={user?.email || 'admin@foodmart.com'}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#5b4039] uppercase">New Password</label>
                <input 
                  className="w-full h-12 px-4 rounded-full border-2 border-[#5b4039] text-xs focus:ring-0 focus:border-[#b02f00]" 
                  type="password" 
                  placeholder="Leave blank to keep current"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                className="w-full h-12 bg-[#ff5722] text-[#541200] rounded-full font-bold text-[12px] uppercase active:scale-95 transition-transform"
              >
                Save Profile Updates
              </button>
            </form>
          </section>

          {/* Stepper Duration */}
          <section className="bg-white border-2 border-[#1f1b10] rounded-2xl p-5 space-y-4 soft-umami-shadow">
            <h3 className="font-[Anton] text-[18px] text-[#1f1b10] uppercase tracking-wide">Trial Duration</h3>
            <div className="flex items-center justify-between border-2 border-[#5b4039] rounded-full overflow-hidden h-12">
              <button 
                type="button" 
                onClick={handleDecrement}
                className="px-6 h-full font-bold text-[18px] text-[#1f1b10] bg-[#fcf3e1] border-r border-[#5b4039] active:bg-[#eae2d0]"
              >
                -
              </button>
              <span className="font-bold text-xs uppercase tracking-wider text-[#1f1b10]">{trialDays} Days</span>
              <button 
                type="button" 
                onClick={handleIncrement}
                className="px-6 h-full font-bold text-[18px] text-[#1f1b10] bg-[#fcf3e1] border-l border-[#5b4039] active:bg-[#eae2d0]"
              >
                +
              </button>
            </div>
          </section>

          {/* Danger Zone Actions */}
          <section className="bg-white border-2 border-[#1f1b10] rounded-2xl p-5 space-y-4 soft-umami-shadow pb-6">
            <h3 className="font-[Anton] text-[18px] text-[#ba1a1a] uppercase tracking-wide">Danger Zone</h3>
            <div className="space-y-3">
              <button className="w-full py-3.5 bg-[#ffdad6] text-[#ba1a1a] rounded-full font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-base">delete_forever</span>
                Purge System Logs
              </button>
              <button className="w-full py-3.5 border-2 border-[#5b4039] text-[#1f1b10] rounded-full font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-base">backup</span>
                Export System Backup
              </button>
            </div>
          </section>
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#f0e7d5] flex items-center justify-around px-4 z-40 shadow-[0_-4px_20px_rgba(62,31,26,0.08)]">
          {/* Dashboard */}
          <Link href="/admin" className="flex flex-col items-center gap-1 text-[#b02f00]">
            <div className="bg-[#ff5722] text-[#541200] px-5 py-1 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider">Console</span>
          </Link>
          {/* Restaurants */}
          <Link href="/admin/restaurants" className="flex flex-col items-center gap-1 text-[#5b4039]">
            <span className="material-symbols-outlined text-[20px]">storefront</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Fleet</span>
          </Link>
          {/* Customers */}
          <Link href="/admin/customers" className="flex flex-col items-center gap-1 text-[#5b4039]">
            <span className="material-symbols-outlined text-[20px]">group</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Guests</span>
          </Link>
          {/* Complaints */}
          <Link href="/admin/complaints" className="flex flex-col items-center gap-1 text-[#5b4039] relative">
            <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
            <div className="absolute top-0 right-1 w-2 h-2 bg-[#ba1a1a] rounded-full"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Tickets</span>
          </Link>
          {/* Analytics */}
          <Link href="/admin/analytics" className="flex flex-col items-center gap-1 text-[#5b4039]">
            <span className="material-symbols-outlined text-[20px]">analytics</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Insights</span>
          </Link>
        </nav>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block space-y-10 pb-16 font-body-md text-on-surface">
        {/* Top App Bar */}
        <header className="sticky top-0 z-30 bg-surface shadow-sm h-20 px-margin flex justify-between items-center w-full mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold text-lg">Admin Settings</h2>
          </div>
          <div className="flex items-center gap-gutter">
            <div className="relative flex items-center bg-surface-container px-4 py-2 rounded-full w-80 border border-outline-variant/10">
              <span className="material-symbols-outlined text-on-surface-variant mr-2 text-sm">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-xs w-full focus:outline-none placeholder:text-on-surface-variant font-bold" placeholder="Search settings..." type="text"/>
            </div>
            <div className="flex items-center gap-sm">
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">help</span>
              </button>
            </div>
          </div>
        </header>

        <div className="px-margin max-w-7xl mx-auto space-y-8">
          {/* Page Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-base">
            <div>
              <h3 className="font-display-md text-display-md text-on-surface text-2xl font-black">System Configuration</h3>
              <p className="font-body-lg text-on-surface-variant mt-2 text-sm">Manage your administrative profile and global platform rules.</p>
            </div>
          </div>

          {success && (
            <div className="bg-[#E6F4EA] border border-[#137333] text-[#137333] font-bold text-xs p-4 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="bg-error-container/20 border border-error text-error font-bold text-xs p-4 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
            {/* Admin Account Section (Left Col) */}
            <section className="xl:col-span-7 space-y-gutter">
              <div className="bg-surface-container-low rounded-xl p-lg relative overflow-hidden border border-outline-variant/15">
                <div className="absolute top-0 right-0 p-lg opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined text-[120px]">account_circle</span>
                </div>
                <div className="flex items-center gap-sm mb-lg">
                  <span className="material-symbols-outlined text-primary text-2xl">manage_accounts</span>
                  <h4 className="font-headline-lg text-headline-lg text-lg font-bold">Admin Account</h4>
                </div>
                <form onSubmit={handleSaveAccount} className="space-y-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                    <div className="space-y-xs">
                      <label className="font-display-md text-label-sm uppercase tracking-widest text-on-surface-variant text-[10px] font-bold block ml-4">Full Name</label>
                      <input 
                        className="w-full bg-transparent border-2 border-on-background rounded-full px-6 py-3.5 focus:ring-primary focus:border-primary text-xs font-bold focus:outline-none" 
                        type="text" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-xs">
                      <label className="font-display-md text-label-sm uppercase tracking-widest text-on-surface-variant text-[10px] font-bold block ml-4">Email Address</label>
                      <input 
                        className="w-full bg-transparent border-2 border-outline-variant/30 rounded-full px-6 py-3.5 bg-surface-container text-xs text-on-surface-variant/50 cursor-not-allowed focus:outline-none" 
                        type="email" 
                        disabled
                        value={user?.email || 'admin@foodmart.com'}
                      />
                    </div>
                  </div>
                  <div className="pt-md border-t border-outline-variant/30 mt-lg">
                    <p className="font-headline-sm text-sm font-bold mb-md">Change Password</p>
                    <div className="space-y-gutter">
                      <div className="space-y-xs">
                        <label className="font-display-md text-label-sm uppercase tracking-widest text-on-surface-variant text-[10px] font-bold block ml-4">Current Password</label>
                        <input 
                          className="w-full bg-transparent border-2 border-on-background rounded-full px-6 py-3.5 focus:ring-primary focus:border-primary text-xs focus:outline-none" 
                          type="password"
                          placeholder="••••••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                        <div className="space-y-xs">
                          <label className="font-display-md text-label-sm uppercase tracking-widest text-on-surface-variant text-[10px] font-bold block ml-4">New Password</label>
                          <input 
                            className="w-full bg-transparent border-2 border-on-background rounded-full px-6 py-3.5 focus:ring-primary focus:border-primary text-xs focus:outline-none" 
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-xs">
                          <label className="font-display-md text-label-sm uppercase tracking-widest text-on-surface-variant text-[10px] font-bold block ml-4">Confirm New Password</label>
                          <input 
                            className="w-full bg-transparent border-2 border-on-background rounded-full px-6 py-3.5 focus:ring-primary focus:border-primary text-xs focus:outline-none" 
                            type="password"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button type="submit" className="px-6 py-3 rounded-full bg-primary text-on-primary font-label-lg text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95">
                      Save Account Updates
                    </button>
                  </div>
                </form>
              </div>

              {/* Security Managers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <div className="bg-surface-container-highest rounded-xl p-md flex items-center justify-between group cursor-pointer hover:bg-on-background hover:text-white transition-all border border-outline-variant/10 shadow-sm">
                  <div className="flex items-center gap-md">
                    <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined">key</span>
                    </div>
                    <div>
                      <p className="font-label-lg text-xs font-bold">Two-Factor Auth</p>
                      <p className="text-[10px] text-on-surface-variant group-hover:text-surface-variant">Enabled via Authenticator</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </div>
                <div className="bg-surface-container-highest rounded-xl p-md flex items-center justify-between group cursor-pointer hover:bg-on-background hover:text-white transition-all border border-outline-variant/10 shadow-sm">
                  <div className="flex items-center gap-md">
                    <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined">devices</span>
                    </div>
                    <div>
                      <p className="font-label-lg text-xs font-bold">Session Manager</p>
                      <p className="text-[10px] text-on-surface-variant group-hover:text-surface-variant">3 Active devices</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </div>
              </div>
            </section>

            {/* Platform Defaults & Danger Zone (Right Col) */}
            <section className="xl:col-span-5 space-y-gutter">
              {/* Platform Defaults */}
              <div className="bg-surface-container-high rounded-xl p-lg border border-outline-variant/15 shadow-sm">
                <div className="flex items-center gap-sm mb-lg">
                  <span className="material-symbols-outlined text-primary text-2xl font-bold">tune</span>
                  <h4 className="font-headline-lg text-headline-lg text-lg font-bold">Platform Defaults</h4>
                </div>
                <form onSubmit={handleSaveDefaults} className="space-y-lg">
                  <div className="space-y-xs">
                    <label className="font-display-md text-label-sm uppercase tracking-widest text-on-surface-variant text-[10px] font-bold block ml-4">Standard Trial Period</label>
                    <div className="flex items-center gap-md">
                      <input 
                        type="range"
                        max="60"
                        min="7"
                        value={trialDays}
                        onChange={(e) => setTrialDays(parseInt(e.target.value))}
                        className="w-full accent-primary" 
                      />
                      <span className="font-headline-sm text-sm font-bold w-20 text-center">{trialDays} <span className="text-[10px] ml-0.5">Days</span></span>
                    </div>
                  </div>
                  <div className="space-y-xs">
                    <label className="font-display-md text-label-sm uppercase tracking-widest text-on-surface-variant text-[10px] font-bold block ml-4">Default Onboarding Plan</label>
                    <div className="grid grid-cols-2 gap-sm">
                      <button 
                        type="button" 
                        onClick={() => setDefaultPlan('TRIAL')}
                        className={`p-md rounded-lg border-2 font-bold flex flex-col items-center gap-xs text-xs ${
                          defaultPlan === 'TRIAL' ? 'border-on-background bg-primary-container text-on-primary-container' : 'border-outline-variant hover:border-on-background bg-surface text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined">restaurant</span>
                        <span>Trial Package</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setDefaultPlan('BASIC')}
                        className={`p-md rounded-lg border-2 font-bold flex flex-col items-center gap-xs text-xs ${
                          defaultPlan === 'BASIC' ? 'border-on-background bg-primary-container text-on-primary-container' : 'border-outline-variant hover:border-on-background bg-surface text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined">groups</span>
                        <span>Basic Package</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-xs">
                    <label className="font-display-md text-label-sm uppercase tracking-widest text-on-surface-variant text-[10px] font-bold block ml-4">Platform Commission (%)</label>
                    <input 
                      type="number"
                      step={0.1}
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                      className="w-full bg-transparent border-2 border-on-background rounded-full px-6 py-3 text-xs font-bold focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="pt-2">
                    <button type="submit" className="w-full h-12 bg-primary text-on-primary rounded-full font-bold text-xs uppercase active:scale-95 transition-transform">
                      Save Defaults config
                    </button>
                  </div>
                </form>
              </div>

              {/* Danger Zone Section */}
              <div className="bg-error-container/20 border-2 border-error-container rounded-xl p-lg shadow-sm">
                <div className="flex items-center gap-sm mb-md text-error">
                  <span className="material-symbols-outlined text-2xl font-bold">warning</span>
                  <h4 className="font-headline-lg text-headline-lg text-lg font-bold">Danger Zone</h4>
                </div>
                <p className="text-xs text-on-surface-variant mb-lg leading-relaxed">
                  Actions performed here are permanent. Please ensure you have backed up the current environment before proceeding.
                </p>
                <div className="space-y-sm">
                  <button className="w-full flex items-center justify-between p-md bg-white rounded-lg border border-outline-variant hover:border-error transition-all group active:scale-[0.99] text-xs">
                    <div className="flex items-center gap-md text-left">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-error-container group-hover:text-error">
                        <span className="material-symbols-outlined">download</span>
                      </div>
                      <div>
                        <p className="font-bold">Export All Platform Data</p>
                        <p className="text-[10px] opacity-70">JSON / CSV Comprehensive Backup</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-md bg-white rounded-lg border border-outline-variant hover:bg-error hover:text-white hover:border-error transition-all group active:scale-[0.99] text-xs">
                    <div className="flex items-center gap-md text-left">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-white/20 group-hover:text-white">
                        <span className="material-symbols-outlined">history</span>
                      </div>
                      <div>
                        <p className="font-bold">Purge System Logs</p>
                        <p className="text-[10px] opacity-70">Delete logs older than 90 days</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">delete</span>
                  </button>
                </div>
              </div>

              {/* Stats Snapshot Ticket */}
              <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm relative border border-outline-variant/10" style={{ maskImage: "radial-gradient(circle at 10px 100%, transparent 10px, white 10px)", maskSize: "20px 100%" }}>
                <div className="border-b-2 border-dashed border-outline-variant pb-md mb-md">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                    <span className="text-on-surface-variant">Admin Snapshot</span>
                    <span className="text-primary">LIVE STATUS</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-md text-center">
                  <div>
                    <p className="text-2xl font-black text-on-surface">1.2k</p>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase mt-1">Active Partners</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-on-surface">99.9%</p>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase mt-1">Uptime</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* System Footer */}
        <footer className="mt-xl p-margin border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-md opacity-60 text-xs font-bold">
          <p>Umami Restaurant OS © 2026. Licensed to Global Enterprise Admins.</p>
          <div className="flex items-center gap-lg">
            <a className="hover:text-primary transition-colors" href="#">System Documentation</a>
            <a className="hover:text-primary transition-colors" href="#">Privacy Protocol</a>
            <a className="hover:text-primary transition-colors" href="#">API Dashboard</a>
          </div>
        </footer>
      </div>
    </>
  );
}
