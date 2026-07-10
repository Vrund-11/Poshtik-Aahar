'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@foodmart/shared';

interface Complaint {
  id: string;
  restaurantId: string;
  customerId?: string;
  orderId?: string;
  rawText: string;
  rating?: number;
  category?: string;
  urgency?: string;
  sentiment?: string;
  summary?: string;
  isResolved: boolean;
  resolvedAt?: string;
  createdAt: string;
  restaurant: {
    name: string;
  };
  customer?: {
    name: string;
    email: string;
  };
}

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (urgencyFilter) params.urgency = urgencyFilter;

      const res: any = await api.get('/api/v1/admin/complaints', { params });
      if (res.success && res.data) {
        setComplaints(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch complaints:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, urgencyFilter]);

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-accent-red text-white border-black';
      case 'HIGH':
        return 'bg-pastel-peach text-primary border-black';
      case 'MEDIUM':
        return 'bg-pastel-yellow text-primary border-black';
      default:
        return 'bg-[#e5e5e5] text-primary border-black';
    }
  };

  const getSentimentEmoji = (sentiment?: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return '😊 POSITIVE';
      case 'NEGATIVE':
        return '😡 NEGATIVE';
      default:
        return '😐 NEUTRAL';
    }
  };

  const unresolvedCount = complaints.filter(c => !c.isResolved).length;

  return (
    <>
      {/* MOBILE VIEW */}
      <div className="flex md:hidden min-h-screen w-full flex-col bg-[#fff8f0] pb-32 text-[#1f1b10] font-sans antialiased">
        {/* Top App Bar */}
        <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 h-20 bg-[#fff8f0] shadow-sm">
          <div className="flex items-center gap-2">
            <span 
              onClick={() => window.dispatchEvent(new Event('toggle-admin-sidebar'))}
              className="material-symbols-outlined text-[#b02f00] cursor-pointer active:scale-95 transition-transform"
            >
              menu
            </span>
            <h1 className="font-[Anton] text-[28px] text-[#b02f00] uppercase tracking-tighter">UMAMI OS</h1>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#b02f00]">
            <img className="w-full h-full object-cover" alt="User Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXEVlkXIV4P2TEmuvXP27EmDjNgVGMN4kGwUF9wuA2Zo2r-zw5QpQ5Np8mD61je1OvSGwRLHR5IwfjiLHLFNsipahU1z9130biIm76nIIgYVWS_6Pcsy-o_gD0CXmumHLMwefeX681ZjnsgkocfDwfWX1rRbcoIFmH8Sm-VM7Ii8STCR6WHLwA01Lxwmh765-ki9RNbI1vIFVnmswx1ix14Tb4Uo-MojbNZSnOO9lGQU0HZ0rhbcc2nrDumwlc0MSqKW-S_YWO708"/>
          </div>
        </header>

        <main className="px-6 pt-4 space-y-6">
          {/* Urgent Alerts Header */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-[Anton] text-[20px] text-[#b02f00] uppercase tracking-tight">Urgent Attention</h2>
              <span className="bg-[#b02f00] text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase">{unresolvedCount} New</span>
            </div>
            {/* Horizontal Alerts */}
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar snap-x">
              {/* Alert Card 1 */}
              <div className="min-w-[260px] bg-[#ffdad6] p-4 rounded-xl snap-center soft-umami-shadow border-l-4 border-[#ba1a1a]">
                <div className="flex justify-between items-start mb-2">
                  <span className="material-symbols-outlined text-[#ba1a1a]">warning</span>
                  <span className="text-[10px] font-bold text-[#ba1a1a] opacity-70">2m ago</span>
                </div>
                <h3 className="font-bold text-[14px] text-[#ba1a1a] mb-1">Critical Food Safety</h3>
                <p className="text-[12px] text-[#93000a] opacity-90 line-clamp-2">Guest reports undercooked poultry at the Downtown Plaza location. Immediate action required.</p>
              </div>
              {/* Alert Card 2 */}
              <div className="min-w-[260px] bg-[#fdc8bf] p-4 rounded-xl snap-center soft-umami-shadow border-l-4 border-[#79514b]">
                <div className="flex justify-between items-start mb-2">
                  <span className="material-symbols-outlined text-[#79514b]">payments</span>
                  <span className="text-[10px] font-bold text-[#79514b] opacity-70">15m ago</span>
                </div>
                <h3 className="font-bold text-[14px] text-[#79514b] mb-1">Double Charge</h3>
                <p className="text-[12px] text-[#79514b] opacity-90 line-clamp-2">POS glitch reported by multiple guests during lunchtime rush. Financial audit triggered.</p>
              </div>
            </div>
          </section>

          {/* Search & Filter Bar */}
          <section className="space-y-3">
            <div className="relative">
              <input 
                className="w-full h-12 pl-10 pr-4 rounded-full border-2 border-[#1f1b10] bg-transparent text-xs tracking-widest focus:ring-[#b02f00] focus:border-[#b02f00] placeholder:text-[#1f1b10]/40 font-bold uppercase" 
                placeholder="SEARCH COMPLAINTS..." 
                type="text"
                onChange={(e) => setCategoryFilter(e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-3 top-3 text-[#5b4039]">search</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button 
                onClick={() => { setUrgencyFilter(''); setStatusFilter(''); }}
                className="bg-[#1f1b10] text-white px-4 py-1.5 rounded-full text-[11px] font-bold flex items-center whitespace-nowrap active:scale-95 transition-transform"
              >
                ALL FEEDBACK
              </button>
              <button 
                onClick={() => setUrgencyFilter('CRITICAL')}
                className="border-2 border-[#5b4039] text-[#5b4039] px-4 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 whitespace-nowrap active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[14px]">priority_high</span> CRITICAL
              </button>
              <button 
                onClick={() => setUrgencyFilter('HIGH')}
                className="border-2 border-[#5b4039] text-[#5b4039] px-4 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 whitespace-nowrap active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[14px]">timer</span> HIGH
              </button>
            </div>
          </section>

          {/* Complaint Feed */}
          <section className="space-y-4 pb-12">
            <h2 className="font-[Anton] text-[18px] text-[#5b4039] uppercase tracking-wider">Recent Activity</h2>

            {loading ? (
              <div className="p-12 text-center bg-[#fcf3e1] rounded-xl border border-[#e4beb4]">
                <div className="w-8 h-8 border-4 border-[#b02f00] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[12px] text-[#5b4039] font-bold uppercase mt-2">Checking tickets...</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#5b4039] font-bold bg-[#fcf3e1] rounded-xl border border-[#e4beb4]">
                No feedback items found.
              </div>
            ) : (
              complaints.map((c) => {
                const urgencyVal = c.urgency || 'MEDIUM';
                const orderText = c.orderId ? `ORDER #${c.orderId.slice(0, 6).toUpperCase()}` : 'GENERAL';
                return (
                  <div key={c.id} className="bg-[#fcf3e1] rounded-xl border border-[#e4beb4] relative overflow-hidden soft-umami-shadow">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-[9px] font-bold text-[#b02f00] uppercase tracking-wide">{orderText} • {c.restaurant.name.toUpperCase()}</p>
                          <h3 className="font-bold text-[15px] text-[#1f1b10] mt-1">{c.category || 'Feedback Detail'}</h3>
                        </div>
                        <div className="bg-[#1f1b10] text-[#ff5722] px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">{urgencyVal}</div>
                      </div>
                      
                      {/* AI Summary Box */}
                      <div className="bg-[#eae2d0] rounded-lg p-3 flex gap-2 items-start mb-4 border border-[#e4beb4]">
                        <span className="material-symbols-outlined text-[#b02f00] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        <p className="text-[12px] text-[#5b4039] leading-relaxed">
                          <strong className="text-[#1f1b10]">AI Summary:</strong> {c.summary || c.rawText}
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="w-8 h-8 rounded-full bg-[#fdc8bf] border border-[#b02f00] flex items-center justify-center text-[10px] font-bold">
                          {c.customer?.name?.slice(0, 2).toUpperCase() || 'AN'}
                        </div>
                        <Link 
                          href={`/admin/complaints/${c.id}`} 
                          className="font-bold text-[12px] text-[#b02f00] flex items-center gap-1 active:translate-x-0.5 transition-transform"
                        >
                          RESOLVE <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                    {/* Ticket Bottom Border */}
                    <div className="ticket-bottom"></div>
                  </div>
                );
              })
            )}
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
          {/* Complaints (Active) */}
          <Link href="/admin/complaints" className="flex flex-col items-center gap-1 text-[#b02f00]">
            <div className="bg-[#ff5722] text-[#541200] px-5 py-1 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider">Tickets</span>
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
        <header className="sticky top-0 z-50 flex justify-between items-center w-full px-margin h-20 bg-surface shadow-sm mb-6">
          <div className="flex items-center gap-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Disputes & Complaints</h2>
          </div>
          <div className="flex items-center gap-lg">
            <div className="hidden lg:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-on-surface">
              <span className="material-symbols-outlined mr-2 text-on-surface-variant">search</span>
              <input className="bg-transparent border-none focus:ring-0 font-label-lg text-on-surface w-48 text-xs focus:outline-none" placeholder="Search customer ID..." type="text"/>
            </div>
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

        {/* Summary Metrics: Bento Grid Layout */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter px-margin">
          <div className="bg-surface-container p-md rounded-xl shadow-sm relative overflow-hidden group hover:bg-surface-container-high transition-colors">
            <div className="flex justify-between items-start mb-base">
              <span className="material-symbols-outlined text-tertiary-container text-4xl">analytics</span>
              <span className="text-on-surface-variant font-label-lg text-xs font-bold">+12% vs last week</span>
            </div>
            <h3 className="font-headline-lg text-display-md text-on-surface mb-xs text-4xl">{complaints.length}</h3>
            <p className="font-label-lg text-on-surface-variant uppercase tracking-wider text-xs font-bold">Total Complaints</p>
          </div>
          <div className="bg-secondary-container p-md rounded-xl shadow-sm relative overflow-hidden group hover:bg-secondary-container-high transition-colors">
            <div className="flex justify-between items-start mb-base">
              <span className="material-symbols-outlined text-on-secondary-container text-4xl">hourglass_empty</span>
              <span className="text-on-secondary-container font-label-lg text-xs font-bold">Awaiting Action</span>
            </div>
            <h3 className="font-headline-lg text-display-md text-on-secondary-container mb-xs text-4xl">{unresolvedCount}</h3>
            <p className="font-label-lg text-on-secondary-container uppercase tracking-wider text-xs font-bold">Unresolved</p>
          </div>
          <div className="bg-primary-container p-md rounded-xl shadow-sm relative overflow-hidden group hover:bg-primary-container-high transition-colors">
            <div className="flex justify-between items-start mb-base">
              <span className="material-symbols-outlined text-on-primary-container text-4xl">report_gmailerrorred</span>
              <span className="text-on-primary-container font-label-lg text-xs font-bold">Immediate Attention</span>
            </div>
            <h3 className="font-headline-lg text-display-md text-on-primary-container mb-xs text-4xl">08</h3>
            <p className="font-label-lg text-on-primary-container uppercase tracking-wider text-xs font-bold">Critical Issues</p>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="bg-surface-container-high p-md rounded-xl mx-margin flex flex-wrap items-center gap-md border border-outline-variant/10 shadow-sm">
          <div className="flex flex-col gap-xs flex-grow min-w-[200px]">
            <span className="font-display-md text-label-sm uppercase text-on-surface-variant text-[10px] font-bold tracking-wider">Status</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-surface border-2 border-on-surface rounded-full py-2.5 px-4 font-label-lg focus:ring-primary focus:border-primary text-xs outline-none cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="UNRESOLVED">Open / Unresolved</option>
              <option value="RESOLVED">Resolved Only</option>
            </select>
          </div>
          <div className="flex flex-col gap-xs flex-grow min-w-[200px]">
            <span className="font-display-md text-label-sm uppercase text-on-surface-variant text-[10px] font-bold tracking-wider">Category</span>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-surface border-2 border-on-surface rounded-full py-2.5 px-4 font-label-lg focus:ring-primary focus:border-primary text-xs outline-none cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="FOOD_QUALITY">Food Quality</option>
              <option value="SERVICE">Service</option>
              <option value="WAIT_TIME">Wait Time</option>
              <option value="BILLING">Billing</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-xs flex-grow min-w-[200px]">
            <span className="font-display-md text-label-sm uppercase text-on-surface-variant text-[10px] font-bold tracking-wider">Urgency</span>
            <select 
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full bg-surface border-2 border-on-surface rounded-full py-2.5 px-4 font-label-lg focus:ring-primary focus:border-primary text-xs outline-none cursor-pointer"
            >
              <option value="">Any Urgency</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </section>

        {/* Complaints Table/List */}
        <section className="px-margin space-y-gutter">
          <h2 className="font-display-md text-headline-lg text-on-surface text-xl">Recent Submissions</h2>
          
          {loading ? (
            <div className="p-12 text-center space-y-4 bg-surface-container rounded-xl">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-body-md text-on-surface-variant">Analyzing feed...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant font-bold bg-surface-container rounded-xl">
              No customer complaints match your current filter settings.
            </div>
          ) : (
            <div className="space-y-md">
              {complaints.map((c) => {
                const customerName = c.customer?.name || 'Anonymous';
                const initials = customerName.slice(0, 2).toUpperCase();
                const urgencyVal = c.urgency || 'MEDIUM';
                
                let urgencyBadge = 'bg-[#E6F4EA] text-[#137333]';
                if (urgencyVal === 'CRITICAL') urgencyBadge = 'bg-error-container text-on-error-container';
                if (urgencyVal === 'HIGH') urgencyBadge = 'bg-secondary-container text-on-secondary-container';
                if (urgencyVal === 'MEDIUM') urgencyBadge = 'bg-[#FEF7E0] text-[#B06000]';

                return (
                  <div key={c.id} className="bg-surface-container-lowest rounded-xl p-md flex flex-col md:flex-row items-start md:items-center gap-md border-l-8 border-primary shadow-sm hover:shadow-md transition-all group">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container flex items-center justify-center border border-outline-variant/10">
                        <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>mood_bad</span>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-base mb-xs flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${urgencyBadge}`}>{urgencyVal}</span>
                        <span className="bg-on-surface text-surface px-2 py-0.5 rounded text-[10px] font-bold uppercase">{c.category || 'GENERAL'}</span>
                        <span className="text-on-surface-variant font-label-sm ml-auto text-xs">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <h4 className="font-headline-sm text-on-surface mb-xs text-base font-bold">{c.summary || 'Customer Complaint Details'}</h4>
                      <div className="flex items-center gap-sm mb-base text-xs text-on-surface-variant italic">
                        <span className="material-symbols-outlined text-primary text-base">auto_awesome</span>
                        <p>AI Insights: {c.summary || c.rawText}</p>
                      </div>
                      <div className="flex items-center gap-base text-xs font-bold text-secondary">
                        <span className="material-symbols-outlined text-base">storefront</span>
                        <span>{c.restaurant.name}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-full md:w-auto flex md:flex-col gap-sm">
                      <Link 
                        href={`/admin/complaints/${c.id}`}
                        className="flex-grow md:flex-none border-2 border-on-surface text-center px-6 py-3 rounded-full font-label-lg hover:bg-on-surface hover:text-surface transition-all text-xs font-bold"
                      >
                        VIEW FULL
                      </Link>
                      <button className="bg-secondary-container text-on-secondary-container p-3 rounded-full hover:scale-110 transition-transform flex items-center justify-center active:scale-90">
                        <span className="material-symbols-outlined">assignment_ind</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Pagination */}
        <section className="mx-margin px-6 py-5 bg-surface-container-high border border-outline-variant/10 rounded-xl flex items-center justify-between">
          <p className="text-xs text-on-surface-variant font-bold">
            Showing 1 to {complaints.length} of {complaints.length} active complaints
          </p>
          <div className="flex gap-base">
            <button className="w-10 h-10 rounded-full border-2 border-on-surface flex items-center justify-center hover:bg-on-surface hover:text-surface transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-on-surface text-surface flex items-center justify-center font-bold text-xs">1</button>
            <button className="w-10 h-10 rounded-full border-2 border-on-surface flex items-center justify-center hover:bg-on-surface hover:text-surface transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95" disabled>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
