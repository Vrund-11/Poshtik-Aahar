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

interface Analytics {
  totalRestaurants: number;
  activeRestaurants: number;
  totalCustomers: number;
  totalActiveSessions: number;
}

export default function AdminDashboard() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // New restaurant form state
  const [newName, setNewName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newPlan, setNewPlan] = useState<'TRIAL' | 'BASIC' | 'GROWTH'>('TRIAL');
  const [newDuration, setNewDuration] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit restaurant plan form state
  const [editPlan, setEditPlan] = useState<'TRIAL' | 'BASIC' | 'GROWTH' | 'SUSPENDED'>('TRIAL');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'SUSPENDED'>('ACTIVE');
  const [editExpiry, setEditExpiry] = useState('');

  const fetchDashboardData = async () => {
    try {
      const restRes: any = await api.get('/api/v1/admin/restaurants');
      if (restRes.success && restRes.data) {
        setRestaurants(restRes.data);
      }

      const analyticsRes: any = await api.get('/api/v1/admin/analytics');
      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
        fetchDashboardData();
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
        fetchDashboardData();
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
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeCount = restaurants.filter((r) => r.status === 'ACTIVE').length;
  const trialCount = restaurants.filter((r) => r.status === 'TRIAL').length;
  const expiredCount = restaurants.filter((r) => r.status === 'EXPIRED').length;
  const suspendedCount = restaurants.filter((r) => r.status === 'SUSPENDED').length;

  const filteredRestaurants = restaurants.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.cuisineType || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      TRIAL: 'bg-blue-100 text-blue-700',
      EXPIRED: 'bg-yellow-100 text-yellow-700',
      SUSPENDED: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const restaurantImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCWftFTwpbO8CR6Iux5wz8LOZ_HhUGMPyYLFdG5sYlbk83z6tJSXK2pzLSap_xFnvDfKsEZzXLqqCm59P1X9XMz1jaBqzr19619axM5nrpf35-jLvMmdQVVNrSVl1RHL-__-DksQQBIDh_JcFrSzaZxQN42HhafuNHhk8o9pdp_wq0aXYoJMKPvLZ0t0kW6EmX9X0RSJcSGjanAVZGFUMuEXkZEL2NkB4DDW8QRvZQ7dOP1kcMkLpyzBOANE7V7yQ5Iyzh_Ln0ALIY",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDPlzzY8HiwfPbRJwuqATemt3b7Zl755vmKxTw_v4Aa6BMDBfPw6mjf0Av65aZyaF5tEdzXeGgIWAH-6g3583vYLtc_NqEheTUm5bHKC5is8Iv6EwwzJhzWXm5RHNR0yeK9aKDESF4T9yvg4Q8Qa1BrCHeuRMBoOF1PIKb_AcXqJIzd9mwx7OGaEFdfemY8xTPrNz5nrf-JKZ2C_dQQRmbu-G0E3x5HV-FWSQuusBY8kjX2UPQLHhILg1kpOuGRQ56LOS4kWp6TAkA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAyP-KvE7GoYwQ_BOcQf9J8bNEXF8X0v61vW3SGQ_LmpC0aOfrGt5uA3Gl0bLqz4x9JGNZiVV3zhEVSiMw9KgJxyrqI_U3LbybxTbDuy1RAc_sslMmwS4i0nT883f5iDWrNoCKz5qD3DZj3qy3H044BcLlXv0QFUJaM-bMd_NyYyd3cUbICS2L3KFPYsK9FxSV-23i_KRyPI_MFFw6sC_AWmDvTQ7I1qxqhBa5unCq5kq4t66i9QlOYfANklPy3xNTNGJgg4XkUSnI",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDMpsqqwPGvdHdIxxIJJebdisr1YSuEHk0zo1_1Ipx3Ht8YbTP67Ou6ODrOa6slwNXBG2tfk8nH386HCuEgAHajekZgSbTgZODzNWBOruogBtvy-Qcv8vr7GIQu23cMh1zowHrK2UfkdiDxZUNIAmBWQm-ZL64wvDsHAJTXSyrJq210Ji323thfufvnAptVA7emh_2FJg4chi4jn9hBRdRykiqYSEdYLPBA3bxfLmNuu6dCDjHhsDSBOf6IeonVMlVNJnCDCUs0cdU",
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#FF5F1F] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-bold text-sm text-[#52443C]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* MOBILE VIEW */}
      <div className="flex md:hidden w-full flex-col bg-[#FFFBF7] pb-4 antialiased">
        <main className="px-6 pt-4 space-y-8">
          {/* Welcome Hero */}
          <section className="space-y-1">
            <h1 className="text-3xl font-extrabold text-[#321300] uppercase tracking-tight leading-none">Platform Overview</h1>
            <p className="text-[#52443C] text-sm">Good morning, Admin. Here&apos;s what&apos;s happening across your {restaurants.length} locations.</p>
          </section>

          {/* Metrics Bento Grid */}
          <section className="grid grid-cols-2 gap-4">
            {/* Total Restaurants */}
            <div className="col-span-2 bg-[#b02f00] text-white p-5 rounded-[2rem] shadow-lg relative overflow-hidden flex flex-col justify-between h-40">
              <div className="z-10">
                <span className="text-xs uppercase tracking-widest opacity-80 font-bold">Total Network</span>
                <h2 className="text-4xl font-extrabold mt-1 leading-none">{restaurants.length}</h2>
              </div>
              <div className="z-10 flex items-center gap-1">
                <span className="material-symbols-outlined text-base">trending_up</span>
                <span className="text-xs font-bold">+12% from last month</span>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
              </div>
            </div>

            {/* Active */}
            <div className="bg-[#F5EFE6] p-4 rounded-[2rem] space-y-3 flex flex-col justify-between h-28">
              <div className="w-8 h-8 rounded-full bg-[#FFEDE6] flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold leading-none text-[#FF5F1F]">{activeCount}</h3>
                <p className="text-[10px] font-bold text-[#52443C] uppercase tracking-wider">Active</p>
              </div>
            </div>

            {/* Trial */}
            <div className="bg-[#F5EFE6] p-4 rounded-[2rem] space-y-3 flex flex-col justify-between h-28">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#52443C] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>hourglass_top</span>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold leading-none text-[#52443C]">{trialCount}</h3>
                <p className="text-[10px] font-bold text-[#52443C] uppercase tracking-wider">In Trial</p>
              </div>
            </div>

            {/* Expired/Warning */}
            <div className="col-span-2 bg-[#ffdad6] p-4 rounded-[2rem] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">warning</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-red-700">{expiredCount + suspendedCount} Expired</h3>
                  <p className="text-[10px] text-red-700 opacity-80 uppercase tracking-wider font-bold">Require immediate attention</p>
                </div>
              </div>
              <Link
                href="/admin/restaurants"
                className="bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold active:scale-95 transition-transform"
              >
                Action
              </Link>
            </div>
          </section>

          {/* Recent Activity Feed */}
          <section className="space-y-4">
            <div className="flex justify-between items-end">
              <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#321300]">Recent</h2>
              <Link href="/admin/restaurants" className="text-[#FF5F1F] font-bold text-sm border-b-2 border-[#FF5F1F] pb-0.5">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {restaurants.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#52443C] font-bold bg-[#F5EFE6] rounded-[2rem]">
                  No restaurants found.
                </div>
              ) : (
                restaurants.slice(0, 4).map((r, index) => {
                  const owner = r.staff.find((s) => s.role === 'OWNER') || { name: 'N/A' };
                  return (
                    <Link key={r.id} href={`/admin/restaurants/${r.id}`} className="block">
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex gap-4 items-center hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-[#F5EFE6] overflow-hidden flex-shrink-0">
                          <img className="w-full h-full object-cover" alt={r.name} src={restaurantImages[index % restaurantImages.length]} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-[#321300] truncate">{r.name}</p>
                          <p className="text-xs text-[#52443C] opacity-60">{r.cuisineType || 'General Dining'}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusBadge(r.status)}`}>
                          {r.status}
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        </main>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block px-6 py-2">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-[#321300] tracking-tight">Restaurant Management</h2>
            <p className="text-[#52443C] opacity-80">Oversee and manage your culinary partners worldwide.</p>
          </div>
          <button
            onClick={() => {
              setErrorMsg('');
              setSuccessMsg('');
              setCreateModalOpen(true);
            }}
            className="bg-[#FF5F1F] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-[#FF5F1F]/20 hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">add</span>
            Add Restaurant
          </button>
        </div>

        {/* Metric Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Partners */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-100 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-6xl">storefront</span>
            </div>
            <p className="text-xs font-bold text-[#52443C] uppercase tracking-wider">Total Partners</p>
            <div className="mt-4">
              <span className="text-4xl font-extrabold text-[#FF5F1F]">{restaurants.length.toLocaleString()}</span>
              <p className="text-xs text-green-600 font-medium mt-1">↑ 12% from last month</p>
            </div>
          </div>
          {/* Active */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-100 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-6xl text-green-500">check_circle</span>
            </div>
            <p className="text-xs font-bold text-[#52443C] uppercase tracking-wider">Active</p>
            <div className="mt-4">
              <span className="text-4xl font-extrabold text-[#321300]">{activeCount.toLocaleString()}</span>
              <p className="text-xs text-[#52443C] opacity-60 mt-1">{restaurants.length > 0 ? ((activeCount / restaurants.length) * 100).toFixed(1) : 0}% capacity</p>
            </div>
          </div>
          {/* Trial */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-100 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-6xl text-blue-500">hourglass_top</span>
            </div>
            <p className="text-xs font-bold text-[#52443C] uppercase tracking-wider">Trial Period</p>
            <div className="mt-4">
              <span className="text-4xl font-extrabold text-blue-600">{trialCount}</span>
              <p className="text-xs text-blue-600 font-medium mt-1">{trialCount > 0 ? `${Math.min(trialCount, 14)} ending this week` : 'None active'}</p>
            </div>
          </div>
          {/* Suspended */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-100 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-6xl text-red-500">error</span>
            </div>
            <p className="text-xs font-bold text-[#52443C] uppercase tracking-wider">Suspended</p>
            <div className="mt-4">
              <span className="text-4xl font-extrabold text-red-500">{suspendedCount + expiredCount}</span>
              <p className="text-xs text-red-500 font-medium mt-1">Action required</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[#F5EFE6]/50 p-4 rounded-[2rem] mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#52443C] opacity-50">search</span>
            <input
              className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-full focus:ring-2 focus:ring-[#FF5F1F] shadow-sm text-sm outline-none"
              placeholder="Search by name, cuisine, or owner..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-white px-4 py-2 rounded-full border border-[#D7C3B1] flex items-center gap-2 text-sm font-medium hover:bg-[#FFEDE6]/20 transition-colors">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Cuisine
            </button>
            <button className="bg-white px-4 py-2 rounded-full border border-[#D7C3B1] flex items-center gap-2 text-sm font-medium hover:bg-[#FFEDE6]/20 transition-colors">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              Date Added
            </button>
          </div>
        </div>

        {/* Restaurant Details Table */}
        <div className="bg-white rounded-[2rem] shadow-lg overflow-hidden border border-orange-50">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F5EFE6]/30 border-b border-[#D7C3B1]">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#52443C]">Restaurant</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#52443C]">Cuisine</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#52443C]">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#52443C]">Plan</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#52443C] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {filteredRestaurants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#52443C] opacity-60">
                      No restaurants found.
                    </td>
                  </tr>
                ) : (
                  filteredRestaurants.map((r, index) => {
                    const owner = r.staff.find((s) => s.role === 'OWNER');
                    return (
                      <tr key={r.id} className="hover:bg-[#FFEDE6]/10 transition-colors group cursor-pointer" onClick={() => {}}>
                        <td className="px-6 py-4">
                          <Link href={`/admin/restaurants/${r.id}`} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#F5EFE6] overflow-hidden flex-shrink-0">
                              <img className="w-full h-full object-cover" alt={r.name} src={restaurantImages[index % restaurantImages.length]} />
                            </div>
                            <div>
                              <p className="font-bold text-[#321300]">{r.name}</p>
                              <p className="text-xs text-[#52443C] opacity-60">{owner?.name || 'No owner'}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">{r.cuisineType || 'General'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(r.status)}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium">{r.plan}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(r);
                            }}
                            className="text-[#52443C] opacity-40 hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-[#FFEDE6]"
                          >
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-6 py-4 bg-[#F5EFE6]/20 border-t border-[#D7C3B1] flex items-center justify-between">
            <p className="text-sm text-[#52443C] opacity-70">
              Showing 1 to {Math.min(filteredRestaurants.length, 10)} of {filteredRestaurants.length} entries
            </p>
            <div className="flex gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#D7C3B1] hover:bg-white transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FF5F1F] text-white font-bold text-xs">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#D7C3B1] hover:bg-white transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE PARTNER MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-[#FFFBF7] w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-8 pt-8 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-[#FF5F1F] uppercase tracking-widest mb-1 block">Administration</span>
                  <h3 className="text-2xl font-extrabold text-[#321300]">Create Restaurant Entry</h3>
                </div>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="p-2 hover:bg-[#F5EFE6] rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-[#52443C]">close</span>
                </button>
              </div>
            </div>
            {/* Modal Content */}
            <div className="px-8 py-4 space-y-6 overflow-y-auto max-h-[60vh]">
              {errorMsg && (
                <div className="bg-red-50 border-2 border-red-500 text-red-700 font-bold text-xs p-4 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="bg-green-50 border border-green-500 text-green-700 font-bold text-xs p-4 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                    <span>{successMsg.split('Generated')[0]}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateRestaurant} className="space-y-6">
                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Restaurant Name */}
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-[#52443C] uppercase tracking-wider px-2">Restaurant Name</label>
                    <input
                      className="w-full h-14 px-6 bg-transparent border-2 border-[#321300] rounded-full focus:ring-2 focus:ring-[#FF5F1F] focus:border-[#FF5F1F] transition-all outline-none"
                      placeholder="e.g. The Golden Truffle"
                      required
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  {/* Owner Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#52443C] uppercase tracking-wider px-2">Owner Name</label>
                    <input
                      className="w-full h-14 px-6 bg-transparent border-2 border-[#321300] rounded-full focus:ring-2 focus:ring-[#FF5F1F] focus:border-[#FF5F1F] transition-all outline-none"
                      placeholder="e.g. Rahul Patel"
                      required
                      type="text"
                      value={newOwnerName}
                      onChange={(e) => setNewOwnerName(e.target.value)}
                    />
                  </div>
                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#52443C] uppercase tracking-wider px-2">Phone Number</label>
                    <input
                      className="w-full h-14 px-6 bg-transparent border-2 border-[#321300] rounded-full focus:ring-2 focus:ring-[#FF5F1F] focus:border-[#FF5F1F] transition-all outline-none"
                      placeholder="e.g. 9998887771"
                      required
                      type="tel"
                      value={newOwnerPhone}
                      onChange={(e) => setNewOwnerPhone(e.target.value)}
                    />
                  </div>
                  {/* Owner Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#52443C] uppercase tracking-wider px-2">Owner Email</label>
                    <input
                      className="w-full h-14 px-6 bg-transparent border-2 border-[#321300] rounded-full focus:ring-2 focus:ring-[#FF5F1F] focus:border-[#FF5F1F] transition-all outline-none"
                      placeholder="manager@restaurant.com"
                      required
                      type="email"
                      value={newOwnerEmail}
                      onChange={(e) => setNewOwnerEmail(e.target.value)}
                    />
                  </div>
                  {/* Subscription Plan */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#52443C] uppercase tracking-wider px-2">Subscription Plan</label>
                    <select
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value as any)}
                      className="w-full h-14 px-6 bg-[#FFFBF7] border-2 border-[#321300] rounded-full focus:ring-2 focus:ring-[#FF5F1F] focus:border-[#FF5F1F] transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="TRIAL">Free Trial</option>
                      <option value="BASIC">Basic ($99/mo)</option>
                      <option value="GROWTH">Growth ($249/mo)</option>
                    </select>
                  </div>
                  {/* Duration days */}
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-[#52443C] uppercase tracking-wider px-2">Plan Duration (Days)</label>
                    <input
                      className="w-full h-14 px-6 bg-transparent border-2 border-[#321300] rounded-full focus:ring-2 focus:ring-[#FF5F1F] focus:border-[#FF5F1F] transition-all outline-none"
                      type="number"
                      min={1}
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Password Section (The "Ticket" Specialty Component) */}
                {successMsg && successMsg.includes('Password:') && (
                  <div className="bg-[#F5EFE6] rounded-xl p-6 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
                      <div className="space-y-1 flex-grow">
                        <label className="text-xs font-bold text-[#FF5F1F] uppercase tracking-wider">Generated Credential</label>
                        <div className="flex items-center gap-3">
                          <div className="bg-white px-6 py-3 rounded-lg font-mono text-xl font-bold tracking-wider text-[#321300] border border-[#D7C3B1] flex-grow select-all">
                            {successMsg.split('Password:')[1].trim()}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(successMsg.split('Password:')[1].trim());
                            }}
                            className="h-12 w-12 flex items-center justify-center bg-[#321300] text-white rounded-lg hover:scale-95 active:scale-90 transition-all"
                          >
                            <span className="material-symbols-outlined">content_copy</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="flex flex-col md:flex-row-reverse gap-4 pt-4 border-t border-[#D7C3B1]">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 md:flex-none px-8 h-14 bg-[#FF5F1F] text-white font-bold rounded-full hover:shadow-lg active:scale-95 transition-all flex items-center justify-center"
                  >
                    {submitting ? 'Creating...' : 'Create Restaurant'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="flex-1 md:flex-none px-8 h-14 bg-transparent border-2 border-[#D7C3B1] text-[#52443C] font-bold rounded-full hover:bg-[#F5EFE6] active:scale-95 transition-all flex items-center justify-center"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-[#FFFBF7] w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
            {/* Modal Left: Ticket Visual */}
            <div className="hidden md:flex w-1/3 bg-[#E64A19] text-white p-8 flex-col justify-between relative">
              <div>
                <span className="material-symbols-outlined text-4xl mb-6">edit_document</span>
                <h2 className="text-3xl font-extrabold leading-tight">PLAN<br />EDIT</h2>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase opacity-70">Client Reference</p>
                <p className="text-lg font-bold truncate max-w-full">{selectedRestaurant.name}</p>
              </div>
            </div>
            {/* Modal Right: Form Content */}
            <div className="flex-1 p-8 bg-[#FFFBF7]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold text-[#321300]">Update Restaurant Plan</h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="p-1 rounded-full hover:bg-[#F5EFE6] transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border-2 border-red-500 text-red-700 font-bold text-xs p-4 rounded-xl flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleEditRestaurant} className="space-y-4">
                {/* Current Plan Display */}
                <div className="bg-[#F5EFE6] p-4 rounded-lg border-l-4 border-[#FF5F1F]">
                  <label className="block text-xs font-bold text-[#FF5F1F] mb-1 uppercase">Current Active Tier</label>
                  <p className="text-lg font-bold text-[#321300]">{selectedRestaurant.plan} Plan</p>
                  <p className="text-xs text-[#52443C]">Expires: {selectedRestaurant.planExpiresAt.slice(0, 10)}</p>
                </div>
                {/* Plan Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#321300] mb-1 uppercase" htmlFor="new-plan">Select New Plan</label>
                  <div className="relative">
                    <select
                      value={editPlan}
                      onChange={(e) => setEditPlan(e.target.value as any)}
                      className="w-full h-12 pl-4 pr-10 rounded-full border-2 border-[#52443C] bg-[#FFFBF7] appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF5F1F] focus:border-transparent transition-all cursor-pointer"
                      id="new-plan"
                    >
                      <option value="TRIAL">Free Trial Tier</option>
                      <option value="BASIC">Basic ($99/mo)</option>
                      <option value="GROWTH">Growth ($249/mo)</option>
                      <option value="SUSPENDED">Suspended / Deactivated</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#52443C]">expand_more</span>
                  </div>
                </div>
                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#321300] mb-1 uppercase" htmlFor="edit-status">Select Membership Status</label>
                  <div className="relative">
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full h-12 pl-4 pr-10 rounded-full border-2 border-[#52443C] bg-[#FFFBF7] appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF5F1F] focus:border-transparent transition-all cursor-pointer"
                      id="edit-status"
                    >
                      <option value="ACTIVE">Active now</option>
                      <option value="TRIAL">In Trial period</option>
                      <option value="EXPIRED">Expired</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#52443C]">expand_more</span>
                  </div>
                </div>
                {/* Expiry Date */}
                <div>
                  <label className="block text-xs font-bold text-[#321300] mb-1 uppercase" htmlFor="expiry-date">Plan Expiry Date</label>
                  <div className="relative">
                    <input
                      className="w-full h-12 pl-4 pr-10 rounded-full border-2 border-[#52443C] bg-[#FFFBF7] focus:outline-none focus:ring-2 focus:ring-[#FF5F1F] focus:border-transparent transition-all"
                      id="expiry-date"
                      type="date"
                      value={editExpiry}
                      onChange={(e) => setEditExpiry(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#52443C]">calendar_today</span>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="flex-1 h-12 border-2 border-[#52443C] text-[#321300] font-bold rounded-full hover:bg-[#F5EFE6] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-12 bg-[#FF5F1F] text-white font-bold rounded-full hover:shadow-lg active:scale-95 transition-all"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
