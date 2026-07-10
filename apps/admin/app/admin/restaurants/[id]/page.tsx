'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@foodmart/shared';

interface RestaurantDetailsProps {
  params: {
    id: string;
  };
}

export default function RestaurantDetails({ params }: RestaurantDetailsProps) {
  const { id } = params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit settings form state
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState('');
  const [expiry, setExpiry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchDetails = async () => {
    try {
      const res: any = await api.get(`/api/v1/admin/restaurants/${id}`);
      if (res.success && res.data) {
        setData(res.data);
        setPlan(res.data.plan);
        setStatus(res.data.status);
        setExpiry(res.data.planExpiresAt ? res.data.planExpiresAt.slice(0, 10) : '');
      } else {
        setError(res.message || 'Failed to fetch restaurant details.');
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong while fetching details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res: any = await api.patch(`/api/v1/admin/restaurants/${id}`, {
        plan,
        status,
        planExpiresAt: new Date(expiry).toISOString(),
      });
      if (res.success) {
        setSuccess('Restaurant subscription settings updated!');
        fetchDetails();
      } else {
        setError(res.message || 'Failed to save settings.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="font-hanken font-bold text-xs text-primary/50 uppercase tracking-widest">Loading Restaurant Dossier...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto space-y-6">
        <div className="bg-pastel-peach border-4 border-black p-6 rounded-3xl space-y-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-sora text-lg font-black text-primary">Error Accessing Dossier</h3>
          <p className="font-hanken text-xs font-bold text-primary">{error || 'Restaurant details could not be found.'}</p>
        </div>
        <Link href="/admin/restaurants" className="inline-flex items-center gap-2 font-sora text-xs font-black uppercase text-primary hover:underline">
          <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
          <span>Back to directory</span>
        </Link>
      </div>
    );
  }

  const owner = data.owner || { name: 'Unassigned', email: 'N/A', phone: 'N/A' };
  const initials = data.name.slice(0, 2).toUpperCase();

  return (
    <>
      {/* MOBILE VIEW */}
      <div className="flex md:hidden min-h-screen w-full flex-col bg-[#fff8f0] pb-32 text-[#1f1b10] font-sans antialiased">
        {/* Top App Bar */}
        <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 h-20 bg-[#fff8f0] shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/admin/restaurants" className="hover:opacity-80 transition-opacity flex items-center">
              <span className="material-symbols-outlined text-[#b02f00]">arrow_back</span>
            </Link>
            <h1 className="font-[Anton] text-[24px] text-[#b02f00] uppercase tracking-tighter">UMAMI OS</h1>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#b02f00]">
            <img className="w-full h-full object-cover" alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuApC--K5Xup-J1wZLVT6uUlxgJbunnIr77saoPLj4pRtJeGY3MzQv8KWGxSG1wgHLKIY4AsloaIFm3PG1hsH6qSFA1nHtRRZEtyVzY5t7PnbAqxbBxz3gcUFaBElii3fQ21l6313DZdwQD6c430qOcCi2oCe6pcgtkDP_ix4Y02Cifs8tZXEDALrfZbHaug4OSd1jYg8MkkAnLEEZCpMWtNNXzGbee-a3mp7xnaODXPBcqFqjJ40DcKPh_xjcCnalHfKRX_Pi0mwg4"/>
          </div>
        </header>

        <main className="px-6 pt-4 space-y-6">
          {/* Restaurant Header Card */}
          <section className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-[Anton] text-[28px] text-[#1f1b10] leading-none uppercase">{data.name}</h2>
                <p className="text-[#5b4039] text-[11px] font-bold uppercase tracking-wider mt-1">{data.plan} PARTNER • ID: #{id.slice(0, 4)}</p>
              </div>
              <span className="bg-[#1f1b10] text-[#ff5722] px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {data.status}
              </span>
            </div>
            <div className="w-full h-44 rounded-xl overflow-hidden soft-umami-shadow border border-[#e4beb4]">
              <img className="w-full h-full object-cover" alt="Bistro interior" src="https://lh3.googleusercontent.com/aida-public/AB6AXuASrgSL7VwGONlPStMXbvcXb0dFQvB137BIxgPQeXXHlRWt7VZr9WA8lEqljhBnvoWP-NrK4pCOgfq6xdXtrdnbVAQJmabqS0br6Kn4f2YrRSDjXG0Qg6sIr24tzsp6xMAutdMe8T-N56wtaTPby5cWYbN1PHvQ5ri04TC_FfrNaWspOvE6kp0qwZl0rS9xLfJ4e-4WkDPJ44umU3KEwgFTWL65Gmk-xBxHIPBRDr0bt6Pm3-N6JRvhMGupi4Sjax07VoYnb8hB0kM"/>
            </div>
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={async () => {
                  try {
                    const newStatus = data.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
                    await api.patch(`/api/v1/admin/restaurants/${id}`, { status: newStatus });
                    fetchDetails();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="bg-[#b02f00] text-white py-3 px-4 rounded-full text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-base">pause_circle</span>
                {data.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
              </button>
              <Link 
                href="/admin/settings/plans"
                className="border-2 border-[#1f1b10] text-[#1f1b10] py-3 px-4 rounded-full text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                Edit Plan
              </Link>
            </div>
          </section>

          {/* Stats Bento */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-[#f6eddb] p-4 rounded-xl flex flex-col justify-between h-28 border border-[#e4beb4] soft-umami-shadow">
              <span className="text-[10px] font-bold text-[#5b4039] uppercase">Daily Revenue</span>
              <span className="font-[Anton] text-[28px] text-[#b02f00]">$4,280</span>
            </div>
            <div className="bg-[#f6eddb] p-4 rounded-xl flex flex-col justify-between h-28 border border-[#e4beb4] soft-umami-shadow">
              <span className="text-[10px] font-bold text-[#5b4039] uppercase">Active Orders</span>
              <span className="font-[Anton] text-[28px] text-[#b02f00]">{data.orders?.length || 12}</span>
            </div>
          </section>

          {/* Branches List */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-[Anton] text-[20px] text-[#1f1b10] uppercase">Branches</h3>
              <span className="text-[#b02f00] text-[11px] font-bold uppercase">View All</span>
            </div>
            <div className="space-y-3">
              <div className="bg-[#fcf3e1] p-4 rounded-xl flex items-center justify-between border border-[#e4beb4]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#eae2d0] rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#7c544e]">location_on</span>
                  </div>
                  <div>
                    <p className="font-bold text-[14px] text-[#1f1b10]">Downtown Core</p>
                    <p className="text-[11px] text-[#5b4039]">42 Market St, Suite 101</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#907067]">chevron_right</span>
              </div>
            </div>
          </section>

          {/* Recent Orders (Ticket Style) */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-[Anton] text-[20px] text-[#1f1b10] uppercase">Recent Orders</h3>
              <span className="bg-[#fdc8bf] text-[#79514b] px-3 py-0.5 rounded-full text-[9px] font-bold">LIVE</span>
            </div>
            <div className="space-y-4">
              {data.orders && data.orders.length > 0 ? (
                data.orders.slice(0, 2).map((order: any) => (
                  <div key={order.id} className="relative soft-umami-shadow rounded-t-xl overflow-hidden">
                    <div className="bg-[#f6eddb] p-4 border border-[#e4beb4] border-b-0 rounded-t-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[12px] font-bold text-[#b02f00]">#ORD-{order.id.slice(0, 6).toUpperCase()}</span>
                        <span className="text-[11px] text-[#5b4039]">2m ago</span>
                      </div>
                      <div className="space-y-1 mb-4">
                        <p className="font-bold text-[14px] text-[#1f1b10]">{order.items?.map((item: any) => `${item.quantity}x ${item.name}`).join(', ') || 'Custom Dinner Order'}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] text-[#5b4039] uppercase font-bold">Total</p>
                          <p className="font-[Anton] text-[22px] text-[#b02f00] leading-none">${order.totalAmount || '124.50'}</p>
                        </div>
                        <span className="bg-[#1f1b10] text-[#ff5722] px-3 py-1 rounded-full text-[9px] font-bold uppercase">{order.status || 'Cooking'}</span>
                      </div>
                    </div>
                    <div className="ticket-bottom"></div>
                  </div>
                ))
              ) : (
                <div className="relative soft-umami-shadow rounded-t-xl overflow-hidden">
                  <div className="bg-[#f6eddb] p-4 border border-[#e4beb4] border-b-0 rounded-t-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[12px] font-bold text-[#b02f00]">#ORD-9902</span>
                      <span className="text-[11px] text-[#5b4039]">2m ago</span>
                    </div>
                    <div className="space-y-1 mb-4">
                      <p className="font-bold text-[14px] text-[#1f1b10]">2x Wagyu Truffle Burger</p>
                      <p className="font-bold text-[14px] text-[#1f1b10]">1x Lobster Bisque</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] text-[#5b4039] uppercase font-bold">Total</p>
                        <p className="font-[Anton] text-[22px] text-[#b02f00] leading-none">$124.50</p>
                      </div>
                      <span className="bg-[#1f1b10] text-[#ff5722] px-3 py-1 rounded-full text-[9px] font-bold uppercase">Cooking</span>
                    </div>
                  </div>
                  <div className="ticket-bottom"></div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>      {/* DESKTOP VIEW */}
      <div className="hidden md:block space-y-10 pb-16 font-body-md text-on-surface">
        {/* Top App Bar */}
        <header className="sticky top-0 z-50 flex justify-between items-center w-full px-margin h-20 bg-surface shadow-sm mb-6">
          <div className="flex items-center gap-md">
            <Link href="/admin/restaurants" className="p-xs rounded-full bg-surface-container hover:bg-surface-container-high transition-all flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant font-bold">arrow_back</span>
            </Link>
            <div className="h-8 w-[2px] bg-outline-variant"></div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Restaurant Dossier</h2>
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

        {/* Restaurant Header Section */}
        <section className="flex flex-col lg:flex-row justify-between items-start gap-lg px-margin">
          <div className="space-y-sm">
            <div className="flex items-center gap-md">
              <h2 className="font-display-md text-on-background text-4xl">{data.name}</h2>
              <span className="px-md py-xs bg-primary text-on-primary font-bold rounded-full text-xs tracking-tighter uppercase">{data.status}</span>
              <span className="px-md py-xs bg-secondary-container text-on-secondary-container font-bold rounded-full text-xs tracking-tighter uppercase">{data.plan} Plan</span>
            </div>
            <div className="flex flex-wrap items-center gap-lg text-on-surface-variant">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">person</span>
                <span className="font-body-md">Owner: {owner.name}</span>
              </div>
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">mail</span>
                <span className="font-body-md">{owner.email}</span>
              </div>
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">call</span>
                <span className="font-body-md">{owner.phone}</span>
              </div>
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span className="font-body-md">{data.cuisineType || 'General Dining'}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-md">
            <button 
              onClick={async () => {
                try {
                  const newStatus = data.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
                  await api.patch(`/api/v1/admin/restaurants/${id}`, { status: newStatus });
                  fetchDetails();
                } catch (e) {
                  console.error(e);
                }
              }}
              className="px-lg py-md border-2 border-on-surface text-on-surface rounded-full font-bold hover:bg-surface-container transition-all active:scale-95 text-xs uppercase"
            >
              {data.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
            </button>
            <button 
              onClick={() => {
                setError('');
                setSuccess('');
                setEditModalOpen(true);
              }}
              className="px-lg py-md bg-primary text-on-primary rounded-full font-bold shadow-lg hover:brightness-110 transition-all active:scale-95 text-xs uppercase"
            >
              Edit Plan Details
            </button>
          </div>
        </section>

        {/* Stats Bento Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter px-margin">
          <div className="bg-surface-container rounded-xl p-md flex flex-col justify-between min-h-[140px] hover:bg-surface-container-high transition-colors border border-outline-variant/10">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-primary p-xs bg-primary-fixed rounded-lg">receipt_long</span>
              <span className="text-xs font-bold text-green-600 bg-green-100 px-sm py-xs rounded-full">+12%</span>
            </div>
            <div>
              <p className="font-display-md text-3xl">{data.stats.totalOrders}</p>
              <p className="font-label-sm uppercase text-on-surface-variant text-[10px]">Total Orders</p>
            </div>
          </div>
          <div className="bg-surface-container rounded-xl p-md flex flex-col justify-between min-h-[140px] hover:bg-surface-container-high transition-colors border border-outline-variant/10">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-primary p-xs bg-primary-fixed rounded-lg">payments</span>
              <span className="text-xs font-bold text-green-600 bg-green-100 px-sm py-xs rounded-full">+8%</span>
            </div>
            <div>
              <p className="font-display-md text-3xl">₹{data.stats.totalRevenue}</p>
              <p className="font-label-sm uppercase text-on-surface-variant text-[10px]">Monthly Revenue</p>
            </div>
          </div>
          <div className="bg-surface-container rounded-xl p-md flex flex-col justify-between min-h-[140px] hover:bg-surface-container-high transition-colors border border-outline-variant/10">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-primary p-xs bg-primary-fixed rounded-lg">star</span>
              <span className="text-xs font-bold text-primary bg-primary-fixed px-sm py-xs rounded-full">{data.stats.avgRating} / 5.0</span>
            </div>
            <div>
              <p className="font-display-md text-3xl">3,402</p>
              <p className="font-label-sm uppercase text-on-surface-variant text-[10px]">Total Customers</p>
            </div>
          </div>
          <div className="bg-surface-container rounded-xl p-md flex flex-col justify-between min-h-[140px] hover:bg-surface-container-high transition-colors border border-outline-variant/10">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-primary p-xs bg-primary-fixed rounded-lg">timer</span>
              <span className="text-xs font-bold text-on-surface-variant bg-surface-container-highest px-sm py-xs rounded-full">{data.stats.avgPrepTime}m avg</span>
            </div>
            <div>
              <p className="font-display-md text-3xl">{data.staff?.length || 42}</p>
              <p className="font-label-sm uppercase text-on-surface-variant text-[10px]">Total Staff</p>
            </div>
          </div>
        </section>

        {/* Nested Data Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-lg px-margin">
          {/* Recent Orders (Ticket Style Layout) */}
          <div className="xl:col-span-1 space-y-md">
            <h3 className="font-headline-sm flex items-center gap-sm text-lg font-bold">
              <span className="material-symbols-outlined text-primary">history</span> Recent Orders
            </h3>
            <div className="space-y-md">
              {data.recentOrders && data.recentOrders.length > 0 ? (
                data.recentOrders.slice(0, 3).map((order: any, idx: number) => (
                  <div key={order.id} className="bg-surface-container-lowest rounded-t-xl p-md relative overflow-hidden border border-outline-variant/20 shadow-sm">
                    <div className="flex justify-between items-start mb-sm">
                      <div>
                        <p className="font-label-sm text-primary text-xs font-bold">#ORD-{order.id.slice(-6).toUpperCase()}</p>
                        <p className="font-bold text-sm mt-0.5">{order.customerName}</p>
                      </div>
                      <span className="bg-primary-container/10 text-primary px-sm py-xs rounded text-[10px] font-extrabold uppercase">{order.status || 'Cooking'}</span>
                    </div>
                    <div className="border-t border-dashed border-outline-variant/30 py-sm space-y-xs">
                      <p className="text-xs text-on-surface-variant italic">{order.itemsSummary || 'Custom Order'}</p>
                    </div>
                    <div className="flex justify-between items-center mt-sm pt-2">
                      <p className="font-label-sm text-xs opacity-60">Today</p>
                      <p className="font-display-md text-lg">₹{order.totalAmount}</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-background ticket-edge" style={{ maskImage: "radial-gradient(circle at 10px 100%, transparent 10px, white 10px)", maskSize: "20px 100%" }}></div>
                  </div>
                ))
              ) : (
                <div className="bg-surface-container-lowest rounded-xl p-6 text-center text-xs font-bold text-secondary/40 border border-outline-variant/20">
                  No orders processed yet.
                </div>
              )}
            </div>
          </div>

          {/* Branches & Staff List */}
          <div className="xl:col-span-2 space-y-lg">
            {/* Branches Table */}
            <div className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant/10">
              <div className="p-md flex justify-between items-center bg-surface-container-high/40">
                <h3 className="font-headline-sm flex items-center gap-sm text-base font-bold">
                  <span className="material-symbols-outlined text-primary">location_city</span> Active Branches
                </h3>
              </div>
              <div className="overflow-x-auto">
                {data.branches && data.branches.length > 0 ? (
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-high border-b border-outline-variant/20 text-xs font-bold uppercase text-on-surface-variant/70">
                      <tr>
                        <th className="px-md py-sm font-label-sm uppercase">Branch Name</th>
                        <th className="px-md py-sm font-label-sm uppercase">Location</th>
                        <th className="px-md py-sm font-label-sm uppercase">Contact</th>
                        <th className="px-md py-sm font-label-sm uppercase text-right">Orders Today</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 text-xs font-bold">
                      {data.branches.map((b: any) => (
                        <tr key={b.id} className="hover:bg-surface-container-highest transition-colors">
                          <td className="px-md py-md font-bold text-primary">{b.name}</td>
                          <td className="px-md py-md text-on-surface-variant">{b.address || 'Central Outpost'}</td>
                          <td className="px-md py-md">{b.phone || 'N/A'}</td>
                          <td className="px-md py-md text-right text-on-surface-variant">142</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-xs font-bold text-secondary/40">
                    No branch outlets registered.
                  </div>
                )}
              </div>
            </div>

            {/* Staff List */}
            <div className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant/10">
              <div className="p-md flex justify-between items-center bg-surface-container-high/40">
                <h3 className="font-headline-sm flex items-center gap-sm text-base font-bold">
                  <span className="material-symbols-outlined text-primary">group</span> Key Personnel
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md p-md">
                {data.staff && data.staff.length > 0 ? (
                  data.staff.map((s: any, index: number) => {
                    const staffInitials = s.name.slice(0, 2).toUpperCase();
                    const images = [
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuD6xut2Q4zLkMRSs0h0l-jMbJFM1lsgdH1MeInUZoC7wldaaxzMhnFaUcob8rws3njXCKP_QUleSgr_EAaNxJXHN6jbQZ5S3qBMqlt7WKOjLcOISV0-j2D43C7Mq8eXDSKoeksdvFRUK8_tUae9Ai5mqpIJ7_Vj3tM9S3DRO7o3HkVXshNZSG99dPP6uksb_za_tl8jhhjf7svsHccjEXFboJIXrd3GgMymAuB-N62Q9r0kGIqn3C8CRHvsIvtDfmSnZ9X3spk0kTs",
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuC7myNObJjmtv2OX_nxVcbay60m_i54b05tTzxwc3-FBdWGtTOE_Mn5bEdEjJIb392GGicn2cR3ArpCovUw-5qnscDQP0BF1OG2XcGjzmN85XDFZs-hVpaEisNHhq4DzhbKgBNkLvnOb3Gq1K_PXvFFcyqVbuadvg4zO3RxSCmXhUI0K0u9c9WngmDGf-OESbXoBUl2S88QcU65zjgB2x120-fp1QivD06HvKBv-0wkN4NWh0tDe2qXaVNjrPyXbPcYVgRt-o-ZQYI",
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuDtnYgFjROHT9gesMXRGqp2dpuvMznr8PfRZuF_kgF7lB0D5V5ReoDuZEVJE7dhezuaSt4K4k1iK7-94Ac-LcY0DU8tNrqlOCd0mMwDMsqJL_gUEaXYuVCLXyP6yiypb2p-q1Bh_Cn4nMOiydf8TfHh1lL7LBDvaw2OQFFa9EFWB7lNgDyRXBXDbMFA6vb3Z48d3bTiqFWcl6FMHqWVV6JJRnmmfH0DCXRev51gSNt25a0lkinViaC4Qd-uLlmZW0ov7sbfLqigKkI"
                    ];
                    return (
                      <div key={s.id} className="flex items-center gap-md p-sm bg-surface rounded-lg border border-outline-variant/10 shadow-sm">
                        <img className="w-12 h-12 rounded-full object-cover border border-outline-variant/20" alt={s.name} src={images[index % images.length]}/>
                        <div className="flex-1">
                          <p className="font-bold leading-none text-xs">{s.name}</p>
                          <p className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-wider">{s.role || 'Staff Member'}</p>
                        </div>
                        <span className="bg-[#E6F4EA] text-[#137333] text-[9px] font-bold px-sm py-xs rounded uppercase">Shift</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center font-bold text-xs text-secondary/40 py-6 col-span-2">No key personnel registered.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* EDIT SUBSCRIPTION PLAN MODAL */}
        {editModalOpen && (
          <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-md overflow-y-auto">
            <div className="bg-background w-full max-w-2xl rounded-xl umami-shadow overflow-hidden flex flex-col md:flex-row transform scale-100 transition-transform duration-300">
              {/* Modal Left: Ticket Visual */}
              <div className="hidden md:flex w-1/3 bg-primary text-on-primary p-lg flex-col justify-between ticket-edge relative">
                <div>
                  <span className="material-symbols-outlined text-4xl mb-md">edit_document</span>
                  <h2 className="font-display-md text-display-md leading-tight text-3xl">PLAN<br/>EDIT</h2>
                </div>
                <div className="space-y-sm">
                  <p className="font-label-sm uppercase opacity-70">Client Reference</p>
                  <p className="font-headline-sm truncate max-w-full">{data.name}</p>
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

                {success && (
                  <div className="bg-[#E6F4EA] border border-[#137333] text-[#137333] font-bold text-xs p-4 rounded-xl flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[#137333]">check_circle</span>
                    <span>{success}</span>
                  </div>
                )}
                {error && (
                  <div className="bg-accent-red/10 border-2 border-accent-red text-accent-red font-bold text-xs p-4 rounded-xl flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined">error</span>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateSettings} className="space-y-md">
                  {/* Current Plan Display */}
                  <div className="bg-surface-container-high p-md rounded-lg border-l-4 border-primary">
                    <label className="block font-display-md text-label-sm text-primary mb-xs uppercase">Current active Tier</label>
                    <p className="text-headline-sm font-bold text-on-surface">{data.plan} Plan</p>
                    <p className="text-label-sm text-on-surface-variant">Registered since: {new Date(data.createdAt).toLocaleDateString()}</p>
                  </div>
                  {/* Plan Selection */}
                  <div>
                    <label className="block font-display-md text-label-sm text-on-surface mb-xs uppercase" htmlFor="new-plan">Select New Plan</label>
                    <div className="relative">
                      <select 
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                        className="w-full h-14 pl-md pr-lg rounded-full border-2 border-on-secondary-fixed-variant bg-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer text-xs font-bold" 
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
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full h-14 pl-md pr-lg rounded-full border-2 border-on-secondary-fixed-variant bg-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer text-xs font-bold" 
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
                        className="w-full h-14 pl-md pr-lg rounded-full border-2 border-on-secondary-fixed-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-xs font-bold" 
                        id="expiry-date" 
                        type="date" 
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
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
