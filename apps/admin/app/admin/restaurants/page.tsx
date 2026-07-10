

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@foodmart/shared';

interface Restaurant {
  id: string;
  name: string;
  cuisineType?: string;
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'SUSPENDED';
  plan: 'TRIAL' | 'BASIC' | 'GROWTH' | 'SUSPENDED';
  planExpiresAt: string;
  createdAt: string;
  staff: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
  }>;
}

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Create restaurant form state
  const [newName, setNewName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newPlan, setNewPlan] = useState<'TRIAL' | 'BASIC' | 'GROWTH'>('TRIAL');
  const [newDuration, setNewDuration] = useState(30);
  const [successMsg, setSuccessMsg] = useState('');

  // Edit plan state
  const [editPlan, setEditPlan] = useState<'TRIAL' | 'BASIC' | 'GROWTH' | 'SUSPENDED'>('TRIAL');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'SUSPENDED'>('ACTIVE');
  const [editExpiry, setEditExpiry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (planFilter) params.plan = planFilter;
      if (statusFilter) params.status = statusFilter;

      const res: any = await api.get('/api/v1/admin/restaurants', { params });
      if (res.success && res.data) {
        setRestaurants(res.data);
      }
    } catch (e) {
      console.error('Failed to load restaurants:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [search, planFilter, statusFilter]);

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res: any = await api.post('/api/v1/admin/restaurants', {
        name: newName,
        ownerName: newOwnerName,
        ownerEmail: newOwnerEmail,
        ownerPhone: newOwnerPhone,
        plan: newPlan,
        planDurationDays: newDuration,
      });

      if (res.success) {
        setSuccessMsg(`Onboarded successfully! Generated Owner Password: ${res.data.owner.temporaryPassword}`);
        setNewName('');
        setNewOwnerName('');
        setNewOwnerEmail('');
        setNewOwnerPhone('');
        fetchRestaurants();
      } else {
        setErrorMsg(res.message || 'Failed to create partner.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (r: Restaurant) => {
    setSelectedRestaurant(r);
    setEditPlan(r.plan);
    setEditStatus(r.status);
    setEditExpiry(r.planExpiresAt.slice(0, 10));
    setEditModalOpen(true);
  };

  const handleEditRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res: any = await api.patch(`/api/v1/admin/restaurants/${selectedRestaurant.id}`, {
        plan: editPlan,
        status: editStatus,
        planExpiresAt: new Date(editExpiry).toISOString(),
      });

      if (res.success) {
        setEditModalOpen(false);
        fetchRestaurants();
      } else {
        setErrorMsg(res.message || 'Failed to update partner plan.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickToggle = async (r: Restaurant, action: 'suspend' | 'activate') => {
    try {
      const updatedStatus = action === 'suspend' ? 'SUSPENDED' : 'ACTIVE';
      const res: any = await api.patch(`/api/v1/admin/restaurants/${r.id}`, {
        status: updatedStatus,
      });
      if (res.success) {
        fetchRestaurants();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalCount = restaurants.length;
  const activeCount = restaurants.filter((r) => r.status === 'ACTIVE').length;
  const trialCount = restaurants.filter((r) => r.status === 'TRIAL').length;

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
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#b02f00] overflow-hidden hover:opacity-80 transition-opacity cursor-pointer">
              <img className="w-full h-full object-cover" alt="Partner Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnglCVL_RycQTTNcpaQmU7dXw2mOFayaMe4Pp3T0bd7nBXrn_wiaC8Vp1wAxp8c9kKesbLk-jTaWLGXIw3qn1LWVWJY5Q4oct5STpsGbfO3dTfGeBP7uwXDP2N38h_17tGBXASDlJ7YsKuSAztmW5_LRfZ8OIL4EgBIwy4YqEJXT5EqIaPtps5fnAWSVS-G0sua_8nQn4079ggiVUMaTSexMyDOXua2yf9e3BT1VzlEYMaG8mgJCe1607uvuPBr-wItqGE0sn2nS0"/>
            </div>
          </div>
        </header>

        <main className="px-4 pt-4 space-y-6">
          {/* Metrics Summary Section */}
          <section className="grid grid-cols-2 gap-3">
            <div className="bg-[#fcf3e1] p-4 rounded-xl space-y-1 soft-umami-shadow border border-[#e4beb4]">
              <span className="text-[11px] font-bold text-[#7c544e] uppercase opacity-70">Total Network</span>
              <div className="flex items-baseline gap-1">
                <span className="font-[Anton] text-[24px] text-[#1f1b10]">{totalCount}</span>
                <span className="text-[10px] text-[#b02f00] font-bold">+12%</span>
              </div>
            </div>
            <div className="bg-[#fcf3e1] p-4 rounded-xl space-y-1 soft-umami-shadow border border-[#e4beb4]">
              <span className="text-[11px] font-bold text-[#7c544e] uppercase opacity-70">Active Venues</span>
              <div className="flex items-baseline gap-1">
                <span className="font-[Anton] text-[24px] text-[#1f1b10]">{activeCount}</span>
                <span className="text-[10px] text-[#5f5c55] font-bold">Stable</span>
              </div>
            </div>
          </section>

          {/* Search & Filter Bar */}
          <section className="space-y-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#907067]">search</span>
              <input 
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#1f1b10] rounded-full font-bold text-xs focus:ring-0 focus:border-[#b02f00] transition-colors placeholder:text-[#907067]/50 uppercase tracking-widest" 
                placeholder="SEARCH RESTAURANTS..." 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button 
                onClick={() => setStatusFilter('')}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap active:scale-95 transition-transform ${statusFilter === '' ? 'bg-[#b02f00] text-white' : 'border-2 border-[#1f1b10] text-[#1f1b10]'}`}
              >
                ALL LOCATIONS
              </button>
              <button 
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap active:scale-95 transition-transform ${statusFilter === 'ACTIVE' ? 'bg-[#b02f00] text-white' : 'border-2 border-[#1f1b10] text-[#1f1b10]'}`}
              >
                ACTIVE
              </button>
              <button 
                onClick={() => setStatusFilter('TRIAL')}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap active:scale-95 transition-transform ${statusFilter === 'TRIAL' ? 'bg-[#b02f00] text-white' : 'border-2 border-[#1f1b10] text-[#1f1b10]'}`}
              >
                IN TRIAL
              </button>
              <button 
                onClick={() => setStatusFilter('EXPIRED')}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap active:scale-95 transition-transform ${statusFilter === 'EXPIRED' ? 'bg-[#b02f00] text-white' : 'border-2 border-[#1f1b10] text-[#1f1b10]'}`}
              >
                EXPIRED
              </button>
            </div>
          </section>

          {/* Restaurant List (Cards) */}
          <section className="space-y-4 pb-12">
            {loading ? (
              <div className="p-12 text-center space-y-4 bg-[#fcf3e1] rounded-2xl border border-[#e4beb4]">
                <div className="w-8 h-8 border-4 border-[#b02f00] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[12px] text-[#5b4039] font-bold uppercase">Fetching fleet...</p>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#5b4039] font-bold bg-[#fcf3e1] rounded-2xl border border-[#e4beb4]">
                No restaurants found.
              </div>
            ) : (
              restaurants.map((r, index) => {
                const coverImages = [
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuAy540E9kRKJC1kPp4t8sSu5ESlLof4ZXqTciOoPkSiZ6CMH9vZXUVQQJOADcZX8TsAqQ5_Vq2iOw3kyzrgoq9YzP4ux4_ddZ7O-PWFQ5ElG4G4sPGyJ5POTV7HSsdP5fFSPJQbI98nrxu7EfC-8y8usqq8AdC0Bma1YteeYJmkVz8mXUI2hcboihxN37HpChN1TdYlovEyeo-ZJLdZUvwimtcscK8NlH3gD18u6erwaHsmfehC2ibgpjg4fC42OuItKkjuTT3OE-E",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuAqJJfaP9GhCYrUEAQlMlHHVdFuVUkxyH0WEJMB6JAcngJ9j0RmbDXaosgS7hKGpO7s_hB6leQgM2rnC2kp-oaBbILjDIV7QqNsG7rD8SEZCpGOxRgZ7MCiyFz-L9zHFS55DprLCmtKoe3u5YsLpzqOVwpPWXsyE0hSMAuxrvmCOOHZvreUjm9fkpGpbj7rM32yOumcmWv7h0_BF1Mu_uRyG2DHL9K81iR4SZJQBDLhXjGCnD51l3LwPdD38mjfMaI3Ir6a6ynqQkE",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDqLlr9pNBYIoIX1GJPZTGLU6M5QtZFxhyy3U8stU7GpqhscW0acZCkK9GWNQNxtWxRPEP6ca-97DR9-1tpFZTXGjeBvGYmIZsB7wvCCRSV29HepHC2SEkP1hsWGDrNglwtQQYaRlhl4wuSoXm_2uQRIUx-FuJFi_KHIeZn-cWdkuybo7RpYyRAdwkWxYLAnrk8RPZNg6qlFFGECZ_1GHK0GPcU8xfXKeQfZCG3iGcOxR-uU3skKEhO1ud9l9jWAVrjbFdklfDgBJc"
                ];
                return (
                  <div key={r.id} className="bg-[#f6eddb] rounded-xl overflow-hidden soft-umami-shadow border border-[#e4beb4] transition-transform hover:scale-[1.01]">
                    <div className="relative h-28 w-full">
                      <img className="w-full h-full object-cover" alt={r.name} src={coverImages[index % coverImages.length]}/>
                      <div className="absolute top-2 right-2 bg-[#1f1b10] text-[#ff5722] px-2 py-0.5 rounded-full text-[9px] font-bold">{r.status}</div>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="font-[Anton] text-[18px] uppercase leading-none text-[#1f1b10]">{r.name}</h2>
                          <p className="text-[12px] text-[#5b4039] font-medium mt-1">General Dining • $$$</p>
                        </div>
                        <div className="text-right">
                          <span className="font-[Anton] text-[18px] text-[#b02f00]">$4.2k</span>
                          <p className="text-[9px] font-bold text-[#7c544e] uppercase">Today's Net</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 border-t-2 border-[#e4beb4] pt-2">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-[#7c544e]">restaurant</span>
                          <span className="text-[9px] font-bold uppercase text-[#5b4039]">14 Tables</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-[#7c544e]">group</span>
                          <span className="text-[9px] font-bold uppercase text-[#5b4039]">{r.staff.length} Staff</span>
                        </div>
                        <div className="flex-grow text-right">
                          <Link href={`/admin/restaurants/${r.id}`} className="text-[#b02f00] font-black text-[11px] hover:underline uppercase">
                            MANAGE
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </main>

        {/* Floating Action Button (FAB) for adding new restaurant */}
        <Link 
          href="/admin/restaurants/setup"
          className="fixed right-6 bottom-24 w-14 h-14 bg-[#b02f00] text-white rounded-full soft-umami-shadow flex items-center justify-center active:scale-95 transition-transform z-40"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </Link>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#f0e7d5] flex items-center justify-around px-4 z-40 shadow-[0_-4px_20px_rgba(62,31,26,0.08)]">
          {/* Dashboard */}
          <Link href="/admin" className="flex flex-col items-center gap-1 text-[#5b4039]">
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Console</span>
          </Link>
          {/* Restaurants (Active) */}
          <Link href="/admin/restaurants" className="flex flex-col items-center gap-1 text-[#b02f00]">
            <div className="bg-[#ff5722] text-[#541200] px-5 py-1 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider">Fleet</span>
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
      </div>      {/* DESKTOP VIEW */}
      <div className="hidden md:block space-y-10 pb-16 font-body-md text-on-surface">
        {/* Top App Bar */}
        <header className="sticky top-0 z-50 flex justify-between items-center w-full px-margin h-20 bg-surface shadow-sm mb-6">
          <div className="flex items-center gap-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Manage Fleet</h2>
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

        {/* Tool Bar & Action Area */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-md px-margin">
          <div className="flex flex-col md:flex-row items-center gap-md flex-1">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md group">
              <label className="absolute -top-3 left-6 px-1 bg-surface font-display-md text-label-sm text-secondary uppercase z-10">Find Restaurant</label>
              <div className="flex items-center w-full h-14 px-md bg-transparent border-2 border-secondary rounded-full focus-within:border-primary-container transition-all">
                <span className="material-symbols-outlined text-on-surface-variant mr-base">search</span>
                <input 
                  className="bg-transparent border-none focus:ring-0 w-full placeholder:text-on-surface-variant font-body-md focus:outline-none" 
                  placeholder="Search by name or owner..." 
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            {/* Filters */}
            <div className="flex gap-sm w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none w-full md:w-40 h-14 pl-md pr-lg bg-surface-container-low border-2 border-outline-variant rounded-full font-label-lg focus:border-primary focus:ring-0 focus:outline-none cursor-pointer"
                >
                  <option value="">Status: All</option>
                  <option value="ACTIVE">Active</option>
                  <option value="TRIAL">Trial</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
              </div>
              <div className="relative flex-1 md:flex-none">
                <select 
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="appearance-none w-full md:w-40 h-14 pl-md pr-lg bg-surface-container-low border-2 border-outline-variant rounded-full font-label-lg focus:border-primary focus:ring-0 focus:outline-none cursor-pointer"
                >
                  <option value="">Plan: All</option>
                  <option value="TRIAL">Trial</option>
                  <option value="BASIC">Basic</option>
                  <option value="GROWTH">Growth</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => {
              setErrorMsg('');
              setSuccessMsg('');
              setCreateModalOpen(true);
            }}
            className="h-14 px-lg bg-primary-container text-on-primary-container rounded-full font-display-md text-label-lg flex items-center justify-center gap-base hover:shadow-lg active:scale-95 transition-all outline-none"
          >
            <span className="material-symbols-outlined font-variation-settings-fill">add_circle</span>
            CREATE RESTAURANT
          </button>
        </section>

        {/* Management Table Container */}
        <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm mx-margin border border-outline-variant/10">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-body-md text-on-surface-variant">Searching database...</p>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant font-bold">
                No locations match your search filters.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high">
                    <th className="p-md font-display-md text-label-lg text-secondary uppercase tracking-widest">Restaurant Name</th>
                    <th className="p-md font-display-md text-label-lg text-secondary uppercase tracking-widest">Owner</th>
                    <th className="p-md font-display-md text-label-lg text-secondary uppercase tracking-widest">Plan</th>
                    <th className="p-md font-display-md text-label-lg text-secondary uppercase tracking-widest">Status</th>
                    <th className="p-md font-display-md text-label-lg text-secondary uppercase tracking-widest">Expiry</th>
                    <th className="p-md font-display-md text-label-lg text-secondary uppercase tracking-widest text-center">Orders Today</th>
                    <th className="p-md"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {restaurants.map((r, index) => {
                    const owner = r.staff.find((s) => s.role === 'OWNER') || { name: 'N/A', email: 'N/A' };
                    const images = [
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuAy540E9kRKJC1kPp4t8sSu5ESlLof4ZXqTciOoPkSiZ6CMH9vZXUVQQJOADcZX8TsAqQ5_Vq2iOw3kyzrgoq9YzP4ux4_ddZ7O-PWFQ5ElG4G4sPGyJ5POTV7HSsdP5fFSPJQbI98nrxu7EfC-8y8usqq8AdC0Bma1YteeYJmkVz8mXUI2hcboihxN37HpChN1TdYlovEyeo-ZJLdZUvwimtcscK8NlH3gD18u6erwaHsmfehC2ibgpjg4fC42OuItKkjuTT3OE-E",
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqJJfaP9GhCYrUEAQlMlHHVdFuVUkxyH0WEJMB6JAcngJ9j0RmbDXaosgS7hKGpO7s_hB6leQgM2rnC2kp-oaBbILjDIV7QqNsG7rD8SEZCpGOxRgZ7MCiyFz-L9zHFS55DprLCmtKoe3u5YsLpzqOVwpPWXsyE0hSMAuxrvmCOOHZvreUjm9fkpGpbj7rM32yOumcmWv7h0_BF1Mu_uRyG2DHL9K81iR4SZJQBDLhXjGCnD51l3LwPdD38mjfMaI3Ir6a6ynqQkE",
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuDqLlr9pNBYIoIX1GJPZTGLU6M5QtZFxhyy3U8stU7GpqhscW0acZCkK9GWNQNxtWxRPEP6ca-97DR9-1tpFZTXGjeBvGYmIZsB7wvCCRSV29HepHC2SEkP1hsWGDrNglwtQQYaRlhl4wuSoXm_2uQRIUx-FuJFi_KHIeZn-cWdkuybo7RpYyRAdwkWxYLAnrk8RPZNg6qlFFGECZ_1GHK0GPcU8xfXKeQfZCG3iGcOxR-uU3skKEhO1ud9l9jWAVrjbFdklfDgBJc"
                    ];

                    let statusBadgeColor = 'bg-secondary-container text-on-secondary-container';
                    if (r.status === 'ACTIVE') statusBadgeColor = 'bg-[#E6F4EA] text-[#137333]';
                    if (r.status === 'EXPIRED') statusBadgeColor = 'bg-[#FCE8E6] text-[#C5221F]';
                    if (r.status === 'SUSPENDED') statusBadgeColor = 'bg-error-container text-on-error-container';

                    let planBadgeColor = 'bg-tertiary-fixed text-on-tertiary-fixed';
                    if (r.plan === 'BASIC') planBadgeColor = 'bg-pastel-purple text-primary';
                    if (r.plan === 'GROWTH') planBadgeColor = 'bg-[#E8F0FE] text-[#1A73E8]';

                    return (
                      <tr key={r.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                        <td className="p-md flex items-center gap-md">
                          <div className="w-14 h-14 rounded-full border-2 border-primary overflow-hidden shrink-0">
                            <img className="w-full h-full object-cover" alt={r.name} src={images[index % images.length]}/>
                          </div>
                          <div>
                            <h4 className="font-headline-sm text-headline-sm text-on-surface">{r.name}</h4>
                            <p className="text-on-surface-variant text-label-lg">{r.cuisineType || 'General Dining'}</p>
                          </div>
                        </td>
                        <td className="p-md text-label-lg font-bold">
                          <p>{owner.name}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5">{owner.email}</p>
                        </td>
                        <td className="p-md">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${planBadgeColor}`}>{r.plan}</span>
                        </td>
                        <td className="p-md">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusBadgeColor}`}>{r.status}</span>
                        </td>
                        <td className="p-md text-label-lg text-on-surface-variant">{r.planExpiresAt.slice(0, 10)}</td>
                        <td className="p-md font-bold text-center">142</td>
                        <td className="p-md text-right">
                          <div className="flex justify-end items-center gap-sm">
                            <Link href={`/admin/restaurants/${r.id}`} className="px-4 py-2 border border-outline-variant hover:border-primary text-primary rounded-full text-xs font-bold transition-colors">
                              MANAGE
                            </Link>
                            <button 
                              onClick={() => handleOpenEditModal(r)}
                              className="px-4 py-2 bg-surface border border-outline-variant hover:border-primary rounded-full text-xs font-bold transition-colors"
                            >
                              PLAN
                            </button>
                            {r.status === 'ACTIVE' || r.status === 'TRIAL' ? (
                              <button 
                                onClick={() => handleQuickToggle(r, 'suspend')}
                                className="px-4 py-2 border border-transparent hover:bg-error-container text-error rounded-full text-xs font-bold transition-all"
                              >
                                SUSPEND
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleQuickToggle(r, 'activate')}
                                className="px-4 py-2 bg-[#E6F4EA] hover:bg-[#d5f0dd] text-[#137333] rounded-full text-xs font-bold transition-all"
                              >
                                ACTIVATE
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-5 bg-surface-container-high border-t border-outline-variant/30 flex items-center justify-between">
            <p className="text-xs text-on-surface-variant font-bold">
              Showing 1 to {restaurants.length} of {restaurants.length} locations
            </p>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 border border-outline-variant rounded-full flex items-center justify-center hover:bg-white transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95" disabled>
                <span className="material-symbols-outlined font-bold">chevron_left</span>
              </button>
              <button className="w-10 h-10 border border-outline-variant bg-primary text-white rounded-full font-black text-xs">1</button>
              <button className="w-10 h-10 border border-outline-variant rounded-full flex items-center justify-center hover:bg-white transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95" disabled>
                <span className="material-symbols-outlined font-bold">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

      {/* CREATE PARTNER MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-md overflow-y-auto">
          <div className="bg-surface w-full max-w-2xl rounded-xl umami-shadow overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="px-margin pt-margin pb-md border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-label-lg text-label-lg text-primary uppercase tracking-widest mb-xs block">Administration</span>
                  <h3 className="font-display-md text-display-md leading-none text-on-surface">Create Restaurant Entry</h3>
                </div>
                <button 
                  onClick={() => setCreateModalOpen(false)}
                  className="p-base hover:bg-surface-container rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>
            </div>
            {/* Modal Content */}
            <div className="px-margin py-md space-y-lg">
              {errorMsg && (
                <div className="bg-accent-red/10 border-2 border-accent-red text-accent-red font-bold text-xs p-4 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="bg-[#E6F4EA] border border-[#137333] text-[#137333] font-bold text-xs p-4 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#137333] font-black">check_circle</span>
                    <span>{successMsg.split('Generated')[0]}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateRestaurant} className="space-y-lg">
                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  {/* Restaurant Name */}
                  <div className="space-y-xs col-span-2">
                    <label className="font-label-lg text-label-lg text-on-surface-variant uppercase px-base">Restaurant Name</label>
                    <input 
                      className="w-full h-16 px-md bg-transparent border-2 border-on-surface rounded-full focus:ring-4 focus:ring-primary-container focus:border-primary transition-all font-body-lg outline-none" 
                      placeholder="e.g. The Golden Truffle" 
                      required 
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  {/* Owner Name */}
                  <div className="space-y-xs">
                    <label className="font-label-lg text-label-lg text-on-surface-variant uppercase px-base">Owner Name</label>
                    <input 
                      className="w-full h-16 px-md bg-transparent border-2 border-on-surface rounded-full focus:ring-4 focus:ring-primary-container focus:border-primary transition-all font-body-lg outline-none" 
                      placeholder="e.g. Rahul Patel" 
                      required 
                      type="text"
                      value={newOwnerName}
                      onChange={(e) => setNewOwnerName(e.target.value)}
                    />
                  </div>
                  {/* Phone Number */}
                  <div className="space-y-xs">
                    <label className="font-label-lg text-label-lg text-on-surface-variant uppercase px-base">Phone Number</label>
                    <input 
                      className="w-full h-16 px-md bg-transparent border-2 border-on-surface rounded-full focus:ring-4 focus:ring-primary-container focus:border-primary transition-all font-body-lg outline-none" 
                      placeholder="e.g. 9998887771" 
                      required 
                      type="tel"
                      value={newOwnerPhone}
                      onChange={(e) => setNewOwnerPhone(e.target.value)}
                    />
                  </div>
                  {/* Owner Email */}
                  <div className="space-y-xs">
                    <label className="font-label-lg text-label-lg text-on-surface-variant uppercase px-base">Owner Email</label>
                    <input 
                      className="w-full h-16 px-md bg-transparent border-2 border-on-surface rounded-full focus:ring-4 focus:ring-primary-container focus:border-primary transition-all font-body-lg outline-none" 
                      placeholder="manager@restaurant.com" 
                      required 
                      type="email"
                      value={newOwnerEmail}
                      onChange={(e) => setNewOwnerEmail(e.target.value)}
                    />
                  </div>
                  {/* Subscription Plan */}
                  <div className="space-y-xs">
                    <label className="font-label-lg text-label-lg text-on-surface-variant uppercase px-base">Subscription Plan</label>
                    <select 
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value as any)}
                      className="w-full h-16 px-md bg-surface border-2 border-on-surface rounded-full focus:ring-4 focus:ring-primary-container focus:border-primary transition-all font-body-lg outline-none appearance-none cursor-pointer"
                    >
                      <option value="TRIAL">Free Trial</option>
                      <option value="BASIC">Basic ($99/mo)</option>
                      <option value="GROWTH">Growth ($249/mo)</option>
                    </select>
                  </div>
                  {/* Duration days */}
                  <div className="space-y-xs col-span-2">
                    <label className="font-label-lg text-label-lg text-on-surface-variant uppercase px-base">Plan Duration (Days)</label>
                    <input 
                      className="w-full h-16 px-md bg-transparent border-2 border-on-surface rounded-full focus:ring-4 focus:ring-primary-container focus:border-primary transition-all font-body-lg outline-none" 
                      type="number"
                      min={1}
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Password Section (The "Ticket" Specialty Component) */}
                {successMsg && successMsg.includes('Password:') && (
                  <div className="bg-surface-container-high rounded-xl p-md relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-md relative z-10">
                      <div className="space-y-xs flex-grow">
                        <label className="font-label-lg text-label-lg text-primary uppercase px-base">Generated Credential</label>
                        <div className="flex items-center gap-sm">
                          <div className="bg-surface px-md py-4 rounded-lg font-mono text-xl font-bold tracking-wider text-on-surface border border-outline-variant flex-grow select-all">
                            {successMsg.split('Password:')[1].trim()}
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(successMsg.split('Password:')[1].trim());
                            }}
                            className="h-14 w-14 flex items-center justify-center bg-on-surface text-surface rounded-lg hover:scale-95 active:scale-90 transition-all group"
                          >
                            <span className="material-symbols-outlined group-active:text-primary transition-colors">content_copy</span>
                          </button>
                        </div>
                      </div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant max-w-[200px]">
                        Temporary password for first-time login. Copy and share securely.
                      </p>
                    </div>
                    {/* Visual "Punch" Decorative elements for the ticket feel */}
                    <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-5 h-10 bg-surface rounded-full"></div>
                    <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-10 bg-surface rounded-full"></div>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="bg-surface-container -mx-margin -mb-md px-margin py-margin flex flex-col md:flex-row-reverse gap-md">
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 md:flex-none px-xl h-16 bg-primary-container text-on-primary-container font-headline-sm uppercase rounded-full hover:shadow-lg active:scale-95 transition-all flex items-center justify-center"
                  >
                    {submitting ? 'Creating...' : 'Create Restaurant'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="flex-1 md:flex-none px-xl h-16 bg-transparent border-2 border-transparent text-on-surface-variant font-headline-sm uppercase rounded-full hover:bg-surface-container-highest active:scale-95 transition-all flex items-center justify-center"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PLAN MODAL */}
      {editModalOpen && selectedRestaurant && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-md overflow-y-auto">
          <div className="bg-background w-full max-w-2xl rounded-xl umami-shadow overflow-hidden flex flex-col md:flex-row transform scale-100 transition-transform duration-300">
            {/* Modal Left: Ticket Visual */}
            <div className="hidden md:flex w-1/3 bg-primary text-on-primary p-lg flex-col justify-between ticket-edge relative">
              <div>
                <span className="material-symbols-outlined text-4xl mb-md">edit_document</span>
                <h2 className="font-display-md text-display-md leading-tight">PLAN<br/>EDIT</h2>
              </div>
              <div className="space-y-sm">
                <p className="font-label-sm uppercase opacity-70">Client Reference</p>
                <p className="font-headline-sm truncate max-w-full">{selectedRestaurant.name}</p>
              </div>
            </div>
            {/* Modal Right: Form Content */}
            <div className="flex-1 p-lg bg-surface">
              <div className="flex justify-between items-center mb-lg">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Update Restaurant Plan</h3>
                <button 
                  onClick={() => setEditModalOpen(false)}
                  className="p-xs rounded-full hover:bg-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {errorMsg && (
                <div className="bg-accent-red/10 border-2 border-accent-red text-accent-red font-bold text-xs p-4 rounded-xl flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleEditRestaurant} className="space-y-md">
                {/* Current Plan Display (Read-only) */}
                <div className="bg-surface-container-high p-md rounded-lg border-l-4 border-primary">
                  <label className="block font-display-md text-label-sm text-primary mb-xs uppercase">Current active Tier</label>
                  <p className="text-headline-sm font-bold text-on-surface">{selectedRestaurant.plan} Plan</p>
                  <p className="text-label-sm text-on-surface-variant">Expires: {selectedRestaurant.planExpiresAt.slice(0, 10)}</p>
                </div>
                {/* Plan Selection */}
                <div>
                  <label className="block font-display-md text-label-sm text-on-surface mb-xs uppercase" htmlFor="new-plan">Select New Plan</label>
                  <div className="relative">
                    <select 
                      value={editPlan}
                      onChange={(e) => setEditPlan(e.target.value as any)}
                      className="w-full h-14 pl-md pr-lg rounded-full border-2 border-on-secondary-fixed-variant bg-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer" 
                      id="new-plan"
                    >
                      <option value="TRIAL">Free Trial Tier</option>
                      <option value="BASIC">Basic ($99/mo)</option>
                      <option value="GROWTH">Growth ($249/mo)</option>
                      <option value="SUSPENDED">Suspended / Deactivated</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                  </div>
                </div>
                {/* Status Selection */}
                <div>
                  <label className="block font-display-md text-label-sm text-on-surface mb-xs uppercase" htmlFor="edit-status">Select Membership Status</label>
                  <div className="relative">
                    <select 
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full h-14 pl-md pr-lg rounded-full border-2 border-on-secondary-fixed-variant bg-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer" 
                      id="edit-status"
                    >
                      <option value="ACTIVE">Active now</option>
                      <option value="TRIAL">In Trial period</option>
                      <option value="EXPIRED">Expired</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                  </div>
                </div>
                {/* Expiry Date Picker */}
                <div>
                  <label className="block font-display-md text-label-sm text-on-surface mb-xs uppercase" htmlFor="expiry-date">Plan Expiry Date</label>
                  <div className="relative">
                    <input 
                      className="w-full h-14 pl-md pr-lg rounded-full border-2 border-on-secondary-fixed-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                      id="expiry-date" 
                      type="date" 
                      value={editExpiry}
                      onChange={(e) => setEditExpiry(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">calendar_today</span>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex gap-md pt-md">
                  <button 
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="flex-1 h-14 border-2 border-on-secondary-fixed-variant text-on-surface font-bold rounded-full hover:bg-surface-variant transition-colors" 
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-14 bg-primary text-on-primary font-bold rounded-full hover:shadow-lg active:scale-95 transition-all" 
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
