'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@foodmart/shared';

interface AnalyticsData {
  totalRestaurants: number;
  activeRestaurants: number;
  totalCustomers: number;
  totalActiveSessions: number;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [analyticsRes, restaurantsRes]: any = await Promise.all([
          api.get('/api/v1/admin/analytics'),
          api.get('/api/v1/admin/restaurants')
        ]);

        if (analyticsRes.success && analyticsRes.data) {
          setData(analyticsRes.data);
        }
        if (restaurantsRes.success && restaurantsRes.data) {
          setRestaurants(restaurantsRes.data);
        }
      } catch (e) {
        console.error('Failed to load analytics details:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [timeFilter, setTimeFilter] = useState('24H');

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
          <div className="w-10 h-10 rounded-full border-2 border-[#ff5722] overflow-hidden hover:opacity-80 transition-opacity cursor-pointer">
            <img className="w-full h-full object-cover" alt="User avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvl2qjMxje_0BJAP9bUk4aZi_XDcohwpybqlQsUknfpmMheTNMfGOMEBDAZ9LkCdRGZUT0teisbvr2CNZRneSMMzmJt7EUwUsqggV2UmPQNG9ToTfAv-9ziRdZvkVkLcOXPr45mPYEhymkAuadjzrkShkFRROIHf-QwsK4N469nuGiJTo8Wj07x_vYikRsfhM0wN6OC1SAy_XbQLDjRNMPM7OK9CH8RrMr1pvlh-h8qOFlXTDAqHGCpJpJ_17McxjQQDszeuKSxJM"/>
          </div>
        </header>

        <main className="px-6 pt-4 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-[11px] font-bold text-[#7c544e] uppercase mb-1">Performance</p>
              <h2 className="font-[Anton] text-[32px] text-[#1f1b10] uppercase leading-none">ANALYTICS</h2>
            </div>
            <div className="flex bg-[#f0e7d5] rounded-full p-1 gap-1">
              <button 
                onClick={() => setTimeFilter('24H')}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${timeFilter === '24H' ? 'bg-[#ff5722] text-[#541200]' : 'text-[#5b4039]'}`}
              >
                24H
              </button>
              <button 
                onClick={() => setTimeFilter('7D')}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${timeFilter === '7D' ? 'bg-[#ff5722] text-[#541200]' : 'text-[#5b4039]'}`}
              >
                7D
              </button>
            </div>
          </div>

          {/* Key Metrics cards */}
          <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar -mx-6 px-6">
            {/* Revenue card */}
            <div className="min-w-[240px] bg-[#fcf3e1] rounded-xl p-4 flex flex-col justify-between h-28 relative overflow-hidden shrink-0 border border-[#e4beb4]">
              <div className="z-10">
                <p className="text-[11px] font-bold text-[#623d37] uppercase">Revenue</p>
                <h3 className="font-[Anton] text-[24px] text-[#b02f00] mt-1">$42,920</h3>
                <div className="flex items-center gap-0.5 text-[#b02f00] font-bold mt-1">
                  <span className="material-symbols-outlined text-xs">trending_up</span>
                  <span className="text-[10px]">+12.4%</span>
                </div>
              </div>
              <div className="absolute -right-3 -bottom-3 opacity-10">
                <span className="material-symbols-outlined text-[90px]">payments</span>
              </div>
            </div>

            {/* Orders card */}
            <div className="min-w-[240px] bg-[#fcf3e1] rounded-xl p-4 flex flex-col justify-between h-28 relative overflow-hidden shrink-0 border border-[#e4beb4]">
              <div className="z-10">
                <p className="text-[11px] font-bold text-[#623d37] uppercase">Orders</p>
                <h3 className="font-[Anton] text-[24px] text-[#1f1b10] mt-1">1,204</h3>
                <div className="flex items-center gap-0.5 text-[#7c544e] font-bold mt-1">
                  <span className="material-symbols-outlined text-xs">trending_down</span>
                  <span className="text-[10px]">-2.1%</span>
                </div>
              </div>
              <div className="absolute -right-3 -bottom-3 opacity-10">
                <span className="material-symbols-outlined text-[90px]">receipt_long</span>
              </div>
            </div>

            {/* Customers card */}
            <div className="min-w-[240px] bg-[#fcf3e1] rounded-xl p-4 flex flex-col justify-between h-28 relative overflow-hidden shrink-0 border border-[#e4beb4]">
              <div className="z-10">
                <p className="text-[11px] font-bold text-[#623d37] uppercase">Customers</p>
                <h3 className="font-[Anton] text-[24px] text-[#1f1b10] mt-1">892</h3>
                <div className="flex items-center gap-0.5 text-[#b02f00] font-bold mt-1">
                  <span className="material-symbols-outlined text-xs">trending_up</span>
                  <span className="text-[10px]">+8.5%</span>
                </div>
              </div>
              <div className="absolute -right-3 -bottom-3 opacity-10">
                <span className="material-symbols-outlined text-[90px]">group</span>
              </div>
            </div>
          </div>

          {/* Revenue Flow Charts Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[16px] uppercase tracking-wide">Revenue Flow</h4>
              <span className="material-symbols-outlined text-[#7c544e]">more_horiz</span>
            </div>
            <div className="bg-[#eae2d0] rounded-xl p-4 h-48 flex items-end justify-between gap-1.5 relative border border-[#e4beb4]">
              <div className="flex-1 bg-[#b02f00] rounded-t-sm" style={{ height: '40%' }}></div>
              <div className="flex-1 bg-[#b02f00] rounded-t-sm" style={{ height: '65%' }}></div>
              <div className="flex-1 bg-[#b02f00] rounded-t-sm" style={{ height: '45%' }}></div>
              <div className="flex-1 bg-[#b02f00] rounded-t-sm" style={{ height: '80%' }}></div>
              <div className="flex-1 bg-[#b02f00] rounded-t-sm" style={{ height: '100%' }}></div>
              <div className="flex-1 bg-[#b02f00] rounded-t-sm" style={{ height: '70%' }}></div>
              <div className="flex-1 bg-[#b02f00] rounded-t-sm" style={{ height: '55%' }}></div>
              <div className="flex-1 bg-[#b02f00] rounded-t-sm" style={{ height: '90%' }}></div>
              <div className="flex-1 bg-[#b02f00] rounded-t-sm" style={{ height: '60%' }}></div>
              <div className="flex-1 bg-[#b02f00] rounded-t-sm" style={{ height: '40%' }}></div>
            </div>
            <div className="flex justify-between px-1 text-[10px] text-[#7c544e] font-bold">
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
              <span>23:00</span>
            </div>
          </section>

          {/* Leaderboard list */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[16px] uppercase tracking-wide">Top Locations</h4>
              <span className="text-[#b02f00] text-[11px] font-bold uppercase">View All</span>
            </div>
            <div className="space-y-3">
              {/* Item 1 */}
              <div className="bg-[#fcf3e1] p-4 rounded-xl flex items-center justify-between border border-[#e4beb4] soft-umami-shadow relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#eae2d0] rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#b02f00]">restaurant</span>
                  </div>
                  <div>
                    <p className="font-bold text-[14px] text-[#1f1b10] leading-none">Downtown Bistro</p>
                    <p className="text-[10px] text-[#7c544e] uppercase font-bold mt-1">428 Orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[14px] text-[#1f1b10]">$18,402</p>
                  <p className="text-[10px] text-[#b02f00] font-bold">+15%</p>
                </div>
              </div>
              {/* Item 2 */}
              <div className="bg-[#fcf3e1] p-4 rounded-xl flex items-center justify-between border border-[#e4beb4] soft-umami-shadow relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#eae2d0] rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#b02f00]">bakery_dining</span>
                  </div>
                  <div>
                    <p className="font-bold text-[14px] text-[#1f1b10] leading-none">Uptown Bakery</p>
                    <p className="text-[10px] text-[#7c544e] uppercase font-bold mt-1">312 Orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[14px] text-[#1f1b10]">$9,240</p>
                  <p className="text-[10px] text-[#ba1a1a] font-bold">-2%</p>
                </div>
              </div>
            </div>
          </section>

          {/* Insights bento */}
          <section className="grid grid-cols-2 gap-4 pb-12">
            <div className="bg-[#343024] text-[#f9f0de] rounded-xl p-4 flex flex-col justify-between h-28 shadow-sm">
              <span className="material-symbols-outlined text-[#ff5722]">bolt</span>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-70">Peak Hour</p>
                <p className="font-bold text-[16px]">19:30 PM</p>
              </div>
            </div>
            <div className="bg-[#fdc8bf] text-[#79514b] rounded-xl p-4 flex flex-col justify-between h-28 shadow-sm">
              <span className="material-symbols-outlined text-[#7c544e]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-70">Top Dish</p>
                <p className="font-bold text-[16px]">Spicy Ramen</p>
              </div>
            </div>
          </section>
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#f0e7d5] flex items-center justify-around px-4 z-40 shadow-[0_-4px_20px_rgba(62,31,26,0.08)]">
          {/* Dashboard */}
          <Link href="/admin" className="flex flex-col items-center gap-1 text-[#5b4039]">
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Console</span>
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
          {/* Analytics (Active) */}
          <Link href="/admin/analytics" className="flex flex-col items-center gap-1 text-[#b02f00]">
            <div className="bg-[#ff5722] text-[#541200] px-5 py-1 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider">Insights</span>
          </Link>
        </nav>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block space-y-10 pb-16 font-body-md text-on-surface">
        {/* Top App Bar */}
        <header className="sticky top-0 z-40 flex justify-between items-center w-full px-margin h-20 bg-surface shadow-sm mb-6">
          <div className="flex items-center gap-md">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-on-surface-variant">search</span>
              <input className="pl-12 pr-6 py-3 w-96 rounded-full border border-outline-variant bg-surface-container-lowest focus:border-primary outline-none transition-colors text-xs font-bold" placeholder="Search analytics, restaurants, or staff..." type="text"/>
            </div>
          </div>
          <div className="flex items-center gap-lg">
            <div className="hidden lg:flex items-center gap-md text-primary">
              <span className="material-symbols-outlined cursor-pointer">notifications</span>
              <span className="material-symbols-outlined cursor-pointer">help</span>
              <span className="material-symbols-outlined cursor-pointer">apps</span>
            </div>
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary-container">
              <img className="w-full h-full object-cover" alt="Admin avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7VCkmw3iBeSU84SkFvmRKgwnS6FoEmoKj9R1xCIXMXr3viU6XZjEUEYEzUkt-8_AKhssUtP7OUvG7qgoiT1eHxaZsdfC-rEhSdFD1TAvkvncfI6NCqfjKq8qY9OFc9t8fpKNJKu6C02uZTWfZVn2VPh-krYsEjpEKX5Pl1rS1tOUDnsr_YN4lqBY-yzKpHm9geNWLJ_CgXU3DdXnjfWl3XKGNxl2EqCzpKediCBWPAuWg-3z6p4Xjf_Q14ynbBzmFWTjfTypsZQ4"/>
            </div>
          </div>
        </header>

        <section className="px-margin space-y-8">
          <div>
            <h2 className="font-display-lg text-headline-lg text-on-surface mb-xs">ADMIN DASHBOARD</h2>
            <p className="font-body-lg text-on-surface-variant max-w-2xl text-sm">Real-time performance overview across the entire platform ecosystem. Monitoring growth, activity, and restaurant health.</p>
          </div>

          {/* KPI Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-lg">
            {/* Total Customers */}
            <div className="bg-surface-container-high p-md rounded-xl shadow-sm border-t-4 border-primary transition-all hover:scale-[1.02] cursor-default">
              <div className="flex justify-between items-start mb-sm">
                <span className="material-symbols-outlined text-primary p-2 bg-primary-fixed rounded-lg">person_celebrate</span>
                <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">+12.5%</span>
              </div>
              <p className="font-label-lg text-on-surface-variant uppercase tracking-widest text-[10px] font-bold">Total Customers</p>
              <h3 className="font-display-md text-primary mt-base text-3xl font-black">{data?.totalCustomers || '142,892'}</h3>
              <p className="font-label-sm text-on-surface-variant mt-xs text-[10px]">Active across all regions</p>
            </div>
            {/* Total Orders (All Time) */}
            <div className="bg-surface-container-high p-md rounded-xl shadow-sm border-t-4 border-primary transition-all hover:scale-[1.02] cursor-default">
              <div className="flex justify-between items-start mb-sm">
                <span className="material-symbols-outlined text-primary p-2 bg-primary-fixed rounded-lg">local_mall</span>
                <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">+8.2%</span>
              </div>
              <p className="font-label-lg text-on-surface-variant uppercase tracking-widest text-[10px] font-bold">Lifetime Orders</p>
              <h3 className="font-display-md text-primary mt-base text-3xl font-black">1.28M</h3>
              <p className="font-label-sm text-on-surface-variant mt-xs text-[10px]">Completed transactions</p>
            </div>
            {/* Orders Today */}
            <div className="bg-primary text-on-primary p-md rounded-xl shadow-xl transition-all hover:scale-[1.02] cursor-default relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-sm">
                  <span className="material-symbols-outlined text-primary p-2 bg-white rounded-lg">speed</span>
                  <span className="text-xs font-bold px-2 py-1 bg-white/20 text-white rounded-full">LIVE</span>
                </div>
                <p className="font-label-lg opacity-90 uppercase tracking-widest text-[10px] font-bold">Orders Today</p>
                <h3 className="font-display-md mt-base text-3xl font-black">4,210</h3>
                <p className="font-label-sm opacity-80 mt-xs text-[10px]">Goal: 5,000 orders/day</p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-20">
                <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
              </div>
            </div>
            {/* Active Restaurants */}
            <div className="bg-surface-container-high p-md rounded-xl shadow-sm border-t-4 border-primary transition-all hover:scale-[1.02] cursor-default">
              <div className="flex justify-between items-start mb-sm">
                <span className="material-symbols-outlined text-primary p-2 bg-primary-fixed rounded-lg">home_work</span>
                <span className="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-700 rounded-full">New: 4</span>
              </div>
              <p className="font-label-lg text-on-surface-variant uppercase tracking-widest text-[10px] font-bold">Active Venues</p>
              <h3 className="font-display-md text-primary mt-base text-3xl font-black">{data?.activeRestaurants || '842'}</h3>
              <p className="font-label-sm text-on-surface-variant mt-xs text-[10px]">Online and serving now</p>
            </div>
          </div>

          {/* Main Data Section: Bento Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Restaurant Breakdown Table */}
            <div className="col-span-1 lg:col-span-8 bg-surface-container-low p-lg rounded-xl shadow-sm border border-outline-variant/15">
              <div className="flex justify-between items-center mb-lg">
                <h4 className="font-display-md text-xl font-bold">RESTAURANT BREAKDOWN</h4>
                <button className="flex items-center gap-xs font-label-lg text-primary hover:underline text-xs font-bold">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Export Report
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-on-surface-variant font-label-lg uppercase tracking-widest text-[10px] font-bold">
                      <th className="pb-md px-4">Restaurant</th>
                      <th className="pb-md px-4 text-center">Daily Orders</th>
                      <th className="pb-md px-4 text-center">All-Time</th>
                      <th className="pb-md px-4 text-right">Revenue</th>
                      <th className="pb-md px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.slice(0, 5).map((r, i) => {
                      const fakeDaily = 142 - i * 15;
                      const fakeAllTime = (12402 - i * 1500).toLocaleString();
                      const fakeRevenue = (3240.00 - i * 400).toFixed(2);
                      const statusVal = r.status || 'Ready';
                      
                      return (
                        <tr key={r.id} className="bg-surface hover:bg-surface-bright transition-colors group text-xs font-bold">
                          <td className="py-md px-4 rounded-l-lg border-l-4 border-primary">
                            <div className="flex items-center gap-md">
                              <div className="w-12 h-12 rounded-lg bg-cover bg-center border border-outline-variant/10" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuALqYN2eDFJl8Y9hI6H-zSZ1WvC1VYZ0dmeNnJANFXFdylqBMqf-HTJ-YOsjLA9PiLduSgA_y2JnFXAl2BoUflTeTNZA2xEf3kFyWQb4tqXRROEbWwuYg0CVCSK0H7p4XxM8RXYbWUjl2pdFsBuoeH2g4y6bp5WU3UVPAjLv5DcRA9kk0KvPpG6C-4o2YlQSYzTqkIN-jJd6idOK1KakOdLiY8N9d-rVo9oYbdAqTt7L2nrhFMoUSiQNHWjG1gAISOke4eLvWmj2GA')" }}></div>
                              <div>
                                <p className="font-headline-sm leading-none font-bold text-sm">{r.name}</p>
                                <p className="text-xs text-on-surface-variant font-normal mt-0.5">{r.cuisineType || 'Cuisine'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-md px-4 text-center font-bold">{fakeDaily}</td>
                          <td className="py-md px-4 text-center opacity-70">{fakeAllTime}</td>
                          <td className="py-md px-4 text-right font-display-md text-sm">${fakeRevenue}</td>
                          <td className="py-md px-4 text-right rounded-r-lg">
                            <span className="bg-primary text-on-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase">{statusVal}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Secondary Sidebar Stats */}
            <div className="col-span-1 lg:col-span-4 flex flex-col gap-gutter">
              {/* Live Orders Ticket */}
              <div className="bg-surface-container-lowest p-md shadow-sm border border-outline-variant/20 rounded-xl relative overflow-hidden">
                <div className="border-b-2 border-dashed border-outline-variant pb-md mb-md">
                  <h5 className="font-display-md text-headline-sm text-primary uppercase text-sm font-bold">SYSTEM STATUS</h5>
                  <p className="font-label-sm text-on-surface-variant text-[10px]">Real-time system health checks</p>
                </div>
                <div className="space-y-md text-xs font-bold">
                  <div className="flex justify-between">
                    <span className="font-label-lg">Peak Load</span>
                    <span className="text-error">CRITICAL (92%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-label-lg">Active Sessions</span>
                    <span>12,402</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-label-lg">Avg Response</span>
                    <span>24ms</span>
                  </div>
                </div>
                <div className="mt-lg pt-md border-t border-outline-variant">
                  <div className="bg-primary-fixed p-sm rounded-lg flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary text-base">warning</span>
                    <p className="text-[10px] font-bold text-on-primary-fixed-variant leading-tight">Server capacity warning in Western Europe region. Scaling active...</p>
                  </div>
                </div>
              </div>

              {/* Platform Growth Chart */}
              <div className="bg-surface-container-high p-md rounded-xl shadow-sm border border-outline-variant/15">
                <h5 className="font-display-md text-headline-sm mb-md text-xs font-bold uppercase">REVENUE GROWTH</h5>
                <div className="h-32 w-full flex items-end gap-xs px-2 mb-md">
                  <div className="flex-1 bg-primary-fixed h-[40%] rounded-t-sm"></div>
                  <div className="flex-1 bg-primary-fixed h-[55%] rounded-t-sm"></div>
                  <div className="flex-1 bg-primary-fixed h-[45%] rounded-t-sm"></div>
                  <div className="flex-1 bg-primary-fixed h-[70%] rounded-t-sm"></div>
                  <div className="flex-1 bg-primary-fixed h-[65%] rounded-t-sm"></div>
                  <div className="flex-1 bg-primary h-[90%] rounded-t-sm"></div>
                  <div className="flex-1 bg-primary h-[85%] rounded-t-sm"></div>
                </div>
                <div className="flex justify-between font-label-sm text-on-surface-variant uppercase tracking-tighter text-[10px] font-bold">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer-style summary */}
          <div className="mt-lg p-lg bg-inverse-surface text-inverse-on-surface rounded-xl flex flex-wrap justify-between items-center border border-outline-variant/10 shadow-lg">
            <div className="mb-md lg:mb-0">
              <h5 className="font-display-md text-headline-sm text-primary-fixed-dim text-base font-bold uppercase">PLATFORM UPTIME: 99.99%</h5>
              <p className="font-label-lg opacity-70 text-xs mt-1">All systems operational across 12 worldwide datacenters.</p>
            </div>
            <div className="flex gap-md">
              <button className="px-md py-sm bg-primary text-white rounded-full font-bold hover:scale-95 transition-all text-xs">
                SYSTEM HEALTH
              </button>
              <button className="px-md py-sm border border-primary text-primary rounded-full font-bold hover:bg-primary/10 transition-all text-xs">
                SUPPORT TICKETS (3)
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
