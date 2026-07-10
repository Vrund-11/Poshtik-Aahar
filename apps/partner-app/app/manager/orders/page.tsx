'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@foodmart/shared';
import { useAuth } from '../../context/AuthContext';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  sessionId?: string;
  status: 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  type: 'DINE_IN' | 'TAKEAWAY';
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  session?: {
    table: {
      number: number;
    };
  };
}

import { useKitchenOrders } from '../../hooks/useKitchenOrders';

export default function OrderManagement() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'ALL' | 'DINE_IN' | 'TAKEAWAY' | 'ACTIVE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch kitchen/manager orders using Query hook
  const { data: rawOrders = [], isLoading: loading, refetch: fetchOrders } = useKitchenOrders(user?.restaurantId || null);
  const orders = rawOrders as Order[];

  const getElapsedTime = (createdAt: string) => {
    const elapsedMs = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(elapsedMs / 60000);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m ago`;
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'RECEIVED': return 'Pending';
      case 'PREPARING': return 'Preparing';
      case 'READY': return 'Ready';
      case 'SERVED': return 'Served';
      case 'DELIVERED': return 'Delivered';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  const getStatusClass = (status: Order['status']) => {
    switch (status) {
      case 'RECEIVED': return 'bg-primary-container text-on-primary-container';
      case 'PREPARING': return 'bg-secondary text-white';
      case 'READY': return 'bg-primary text-on-primary';
      default: return 'bg-surface-container text-on-surface-variant';
    }
  };

  const filteredOrders = orders.filter((o) => {
    // Apply search query
    if (searchQuery) {
      const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        o.session?.table?.number?.toString().includes(searchQuery) ||
        o.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;
    }

    // Apply main category filter
    if (filter === 'ALL') return true;
    if (filter === 'DINE_IN') return o.type === 'DINE_IN';
    if (filter === 'TAKEAWAY') return o.type === 'TAKEAWAY';
    if (filter === 'ACTIVE') return ['RECEIVED', 'PREPARING', 'READY'].includes(o.status);
    return true;
  });

  return (
    <div className="space-y-lg font-hanken">
      {/* Top Header Row */}
      <div className="flex justify-between items-center flex-wrap gap-md">
        <div>
          <h2 className="font-display-md text-display-md text-on-surface leading-tight uppercase">Order Stream</h2>
          <p className="font-body-md text-on-surface-variant">Live updates enabled. Real-time dispatcher watch window.</p>
        </div>

        <div className="flex items-center gap-md">
          {/* Search bar */}
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high border-none rounded-full py-2 pl-12 pr-4 font-label-lg text-on-surface focus:ring-2 focus:ring-primary outline-none"
              placeholder="Search orders, tables..."
            />
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-xs">
        {(['ALL', 'DINE_IN', 'TAKEAWAY', 'ACTIVE'] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={`px-lg py-sm rounded-full font-label-lg text-label-lg uppercase tracking-wider transition-all ${
              filter === opt
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            {opt === 'ALL' ? 'All Orders' : opt === 'DINE_IN' ? 'Dine-In' : opt === 'TAKEAWAY' ? 'Takeaway' : 'Active'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Stream List (Left 9 cols) */}
        <div className="col-span-12 lg:col-span-9">
          {loading ? (
            <div className="py-xl text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-surface-container p-xl rounded-xl text-center text-on-surface-variant font-label-lg border border-outline-variant/30">
              No orders found matching the filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
              {filteredOrders.map((o) => (
                <div key={o.id} className="bg-surface p-md rounded-t-xl border border-outline-variant flex flex-col justify-between min-h-[340px] shadow-sm relative ticket-jagged overflow-hidden">
                  <div className="space-y-sm">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-outline-variant/30 pb-sm">
                      <div>
                        <span className={`px-sm py-xs rounded font-label-sm text-label-sm uppercase ${
                          o.type === 'TAKEAWAY' ? 'bg-[#5C3D2E]/10 text-[#5C3D2E]' : 'bg-[#2196F3]/10 text-[#2196F3]'
                        }`}>
                          {o.type === 'TAKEAWAY' ? 'Takeaway' : `Table T-${o.session?.table?.number?.toString().padStart(2, '0') || '?'}`}
                        </span>
                        <h4 className="font-display-md text-headline-sm text-secondary mt-sm">#UM-{o.id.slice(-4).toUpperCase()}</h4>
                      </div>
                      <div className="text-right">
                        <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider">ELAPSED</span>
                        <span className="font-headline-sm text-body-lg text-primary">{getElapsedTime(o.createdAt)}</span>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="space-y-xs pt-xs">
                      {o.items.map((item) => (
                        <div key={item.id} className="flex justify-between font-body-md text-sm text-on-surface">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="text-on-surface-variant">₹{Number(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>

                    {o.notes && (
                      <div className="bg-surface-container p-sm rounded-lg text-label-sm text-on-surface-variant italic">
                        Note: &quot;{o.notes}&quot;
                      </div>
                    )}
                  </div>

                  {/* Footer status / amount */}
                  <div className="border-t border-outline-variant/30 pt-md mt-md flex justify-between items-center">
                    <div>
                      <span className="font-label-sm text-on-surface-variant block uppercase tracking-wider">Total</span>
                      <span className="font-display-md text-headline-sm text-secondary">₹{o.totalAmount}</span>
                    </div>

                    <span className={`px-lg py-sm rounded-full font-label-lg text-label-lg uppercase ${getStatusClass(o.status)}`}>
                      {getStatusLabel(o.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info panel (Right 3 cols) */}
        <div className="col-span-12 lg:col-span-3 space-y-md">
          {/* System Load */}
          <div className="bg-[#fdc8bf] text-on-secondary-container p-lg rounded-xl border border-outline-variant/30 space-y-md umami-shadow">
            <span className="font-label-sm text-label-sm text-on-secondary-container uppercase tracking-widest block">Kitchen Load</span>
            <div className="flex items-baseline gap-xs">
              <span className="font-display-md text-[56px] text-primary leading-none">82%</span>
              <span className="font-headline-sm text-primary">High</span>
            </div>
            <div className="w-full bg-[#7c544e]/10 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[82%]" />
            </div>
            <p className="font-label-sm text-label-sm text-on-secondary-container/80">Average Prep Time: 14m</p>
          </div>

          {/* System Status card */}
          <div className="bg-surface-container p-md rounded-xl space-y-sm border border-outline-variant/30">
            <h4 className="font-headline-sm text-body-lg text-secondary uppercase tracking-widest">Active Stats</h4>
            <div className="space-y-xs">
              <div className="flex justify-between text-label-lg">
                <span className="text-on-surface-variant">Total Active</span>
                <span className="font-bold text-on-surface">{orders.filter(o => ['RECEIVED', 'PREPARING', 'READY'].includes(o.status)).length}</span>
              </div>
              <div className="flex justify-between text-label-lg">
                <span className="text-on-surface-variant">Dine-In Live</span>
                <span className="font-bold text-on-surface">{orders.filter(o => o.type === 'DINE_IN' && ['RECEIVED', 'PREPARING', 'READY'].includes(o.status)).length}</span>
              </div>
              <div className="flex justify-between text-label-lg">
                <span className="text-on-surface-variant">Takeaway Live</span>
                <span className="font-bold text-on-surface">{orders.filter(o => o.type === 'TAKEAWAY' && ['RECEIVED', 'PREPARING', 'READY'].includes(o.status)).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
