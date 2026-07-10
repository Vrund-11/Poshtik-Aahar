'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@foodmart/shared';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  isActive: boolean;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      
      const res: any = await api.get('/api/v1/admin/customers', { params });
      if (res.success && res.data) {
        setCustomers(res.data);
      }
    } catch (e) {
      console.error('Failed to load customers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleToggleActive = async (cust: Customer) => {
    try {
      const res: any = await api.patch(`/api/v1/admin/customers/${cust.id}`, {
        isActive: !cust.isActive,
      });
      if (res.success) {
        fetchCustomers();
      }
    } catch (e) {
      console.error('Failed to toggle customer status:', e);
    }
  };

  const totalSpentAll = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const activeCount = customers.filter(c => c.isActive).length;

  return (
    <div className="px-6 py-2 space-y-10 font-body-md text-on-surface">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#321300] tracking-tight">Customer Management</h2>
          <p className="text-[#52443C] opacity-80">Manage and audit registered customer profiles and transactions.</p>
        </div>
      </div>

      {/* Metrics Bento Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Customers */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-100 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-6xl">group</span>
          </div>
          <p className="text-xs font-bold text-[#52443C] uppercase tracking-wider">Total Database</p>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-[#FF5F1F]">{customers.length.toLocaleString()}</span>
            <p className="text-xs text-[#52443C] opacity-60 mt-1">Registered accounts</p>
          </div>
        </div>

        {/* Active Accounts */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-100 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-6xl text-green-500">verified_user</span>
          </div>
          <p className="text-xs font-bold text-[#52443C] uppercase tracking-wider">Active Accounts</p>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-[#321300]">{activeCount.toLocaleString()}</span>
            <p className="text-xs text-green-600 font-medium mt-1">Verified users</p>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-100 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-6xl text-blue-500">payments</span>
          </div>
          <p className="text-xs font-bold text-[#52443C] uppercase tracking-wider">Total Spent</p>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-[#FF5F1F]">₹{Math.round(totalSpentAll).toLocaleString()}</span>
            <p className="text-xs text-blue-600 font-medium mt-1">Cumulative sales</p>
          </div>
        </div>

        {/* Estimated Churn */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-100 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-6xl text-red-500">trending_down</span>
          </div>
          <p className="text-xs font-bold text-[#52443C] uppercase tracking-wider">Estimated Churn</p>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-red-500">1.8%</span>
            <p className="text-xs text-red-500 font-medium mt-1">Low risk level</p>
          </div>
        </div>
      </section>

      {/* Toolbar & Search */}
      <div className="bg-[#F5EFE6]/50 p-4 rounded-[2rem] flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[280px]">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#52443C] opacity-50">search</span>
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-full focus:ring-2 focus:ring-[#FF5F1F] shadow-sm text-sm outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button className="bg-white px-6 py-2.5 rounded-full border border-[#D7C3B1] flex items-center gap-2 text-sm font-medium hover:bg-[#FFEDE6]/20 transition-all">
            <span className="material-symbols-outlined text-sm">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Customers Log Table */}
      <section className="bg-white rounded-[2rem] shadow-lg overflow-hidden border border-orange-50">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-8 h-8 border-4 border-[#FF5F1F] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-[#52443C] opacity-60">Searching customer directory...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#52443C] opacity-60">
              No registered customers found.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F5EFE6]/30 border-b border-[#D7C3B1]">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#52443C]">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#52443C]">Contact details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#52443C]">Joined Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#52443C] text-center">Orders</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#52443C] text-right">Spent Amount</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#52443C] text-center">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {customers.map((c) => {
                  const initials = c.name.slice(0, 2).toUpperCase();
                  return (
                    <tr key={c.id} className="hover:bg-[#FFEDE6]/10 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#FFEDE6] flex items-center justify-center font-bold text-[#FF5F1F] text-sm shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-[#321300]">{c.name}</p>
                            <p className="text-[10px] text-[#52443C] opacity-60 uppercase tracking-wider font-mono mt-0.5">{c.id.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-[#321300] leading-tight">{c.email}</p>
                        <p className="text-xs text-[#52443C] opacity-60 mt-0.5">{c.phone || 'No Phone'}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#52443C]">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-center text-[#321300]">{c.totalOrders}</td>
                      <td className="px-6 py-4 text-sm font-bold text-right text-[#FF5F1F]">₹{c.totalSpent.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(c)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 uppercase tracking-wider ${
                            c.isActive
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Suspended'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-[#F5EFE6]/20 border-t border-[#D7C3B1] flex items-center justify-between">
          <p className="text-sm text-[#52443C] opacity-70">
            Showing 1 to {customers.length} of {customers.length} customers
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
      </section>
    </div>
  );
}
