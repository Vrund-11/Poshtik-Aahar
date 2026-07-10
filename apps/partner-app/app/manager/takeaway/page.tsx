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
  status: 'RECEIVED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  type: 'DINE_IN' | 'TAKEAWAY';
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  customer?: {
    name: string;
    phone: string;
  };
}

import { useTakeawayOrders } from '../../hooks/useTakeawayOrders';
import { useUpdateOrderStatus } from '../../hooks/useUpdateOrderStatus';

export default function TakeawayManagement() {
  const { user } = useAuth();
  
  // Verification modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch takeaway orders with custom Query hook
  const { data: rawOrders = [], isLoading: loading, refetch: fetchOrders } = useTakeawayOrders(user?.restaurantId || null);
  const orders = rawOrders as Order[];

  const updateStatusMutation = useUpdateOrderStatus();
  const updating = updateStatusMutation.isPending;

  const handleUpdateStatus = async (id: string, status: Order['status']) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId: id, status });
      setSelectedOrder(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Group orders by phase
  const pendingOrders = orders.filter((o) => o.status === 'RECEIVED');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED').slice(0, 10); // show last 10 completed

  const activeCount = pendingOrders.length + preparingOrders.length + readyOrders.length;

  return (
    <div className="space-y-lg font-hanken">
      {/* Top Header Row */}
      <div className="flex justify-between items-center flex-wrap gap-md">
        <div>
          <h2 className="font-display-md text-display-md text-on-surface leading-tight uppercase">Takeaway Dashboard</h2>
          <p className="font-body-md text-on-surface-variant">Live order tracking, verification checks, and pickup dispatch.</p>
        </div>

        <div className="flex items-center gap-md">
          {/* Header Indicators */}
          <span className="bg-surface-container px-md py-sm rounded-full font-label-lg text-label-lg text-on-surface-variant">
            {activeCount} Active Orders
          </span>
          <span className="bg-surface-container px-md py-sm rounded-full font-label-lg text-label-lg text-on-surface-variant">
            Avg. Prep: 18m
          </span>
        </div>
      </div>

      {/* Kanban Board Grid */}
      {loading ? (
        <div className="py-xl text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md items-start">
          {/* PENDING COLUMN */}
          <div className="bg-surface-container/30 p-md rounded-xl space-y-md border border-outline-variant/10">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-body-lg text-secondary uppercase font-bold">Pending</span>
              <span className="bg-[#b02f00] text-white w-6 h-6 rounded-full flex items-center justify-center font-label-sm text-label-sm">
                {pendingOrders.length}
              </span>
            </div>

            <div className="space-y-sm">
              {pendingOrders.length === 0 ? (
                <p className="text-center py-lg font-label-lg text-on-surface-variant/40">No pending orders</p>
              ) : (
                pendingOrders.map((o) => (
                  <div 
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className="bg-surface p-md rounded-xl border border-outline-variant shadow-sm hover:scale-[1.02] active:scale-98 transition-all cursor-pointer space-y-sm"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-display-md text-headline-sm text-secondary">#UM-{o.id.slice(-4).toUpperCase()}</h4>
                      <span className="bg-surface-container px-sm py-0.5 rounded font-label-sm text-label-sm text-on-surface-variant uppercase">
                        Express
                      </span>
                    </div>
                    <div>
                      <p className="font-headline-sm text-body-lg text-secondary">{o.customer?.name || 'Takeaway Guest'}</p>
                      <p className="font-label-lg text-label-lg text-on-surface-variant">
                        {o.items.length} items • ₹{o.totalAmount}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(o);
                      }}
                      className="w-full bg-primary text-on-primary py-sm rounded-full font-label-lg uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-sm"
                    >
                      Accept Order
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PREPARING COLUMN */}
          <div className="bg-surface-container/30 p-md rounded-xl space-y-md border border-outline-variant/10">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-body-lg text-secondary uppercase font-bold">Preparing</span>
              <span className="bg-[#b02f00] text-white w-6 h-6 rounded-full flex items-center justify-center font-label-sm text-label-sm">
                {preparingOrders.length}
              </span>
            </div>

            <div className="space-y-sm">
              {preparingOrders.length === 0 ? (
                <p className="text-center py-lg font-label-lg text-on-surface-variant/40">No active preparation</p>
              ) : (
                preparingOrders.map((o) => (
                  <div 
                    key={o.id}
                    className="bg-surface p-md rounded-xl border border-outline-variant shadow-sm space-y-sm"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-display-md text-headline-sm text-secondary">#UM-{o.id.slice(-4).toUpperCase()}</h4>
                      <span className="text-primary font-label-sm text-label-sm flex items-center gap-xs">
                        <span className="material-symbols-outlined text-sm">schedule</span> 12:04
                      </span>
                    </div>
                    <div>
                      <p className="font-headline-sm text-body-lg text-secondary">{o.customer?.name || 'Takeaway Guest'}</p>
                      <div className="space-y-0.5 text-xs text-on-surface-variant mt-sm">
                        {o.items.map((item) => (
                          <p key={item.id}>{item.quantity}x {item.name}</p>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdateStatus(o.id, 'READY')}
                      className="w-full border border-outline-variant hover:bg-surface-container-high py-sm rounded-full font-label-lg uppercase tracking-wider active:scale-95 transition-all"
                    >
                      Mark as Ready
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* READY COLUMN */}
          <div className="bg-surface-container/30 p-md rounded-xl space-y-md border border-outline-variant/10">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-body-lg text-secondary uppercase font-bold">Ready</span>
              <span className="bg-[#b02f00] text-white w-6 h-6 rounded-full flex items-center justify-center font-label-sm text-label-sm">
                {readyOrders.length}
              </span>
            </div>

            <div className="space-y-sm">
              {readyOrders.length === 0 ? (
                <p className="text-center py-lg font-label-lg text-on-surface-variant/40">No orders ready for pickup</p>
              ) : (
                readyOrders.map((o) => (
                  <div 
                    key={o.id}
                    className="bg-surface p-md rounded-xl border border-outline-variant shadow-sm space-y-sm bg-primary/5 border-primary/20"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-display-md text-headline-sm text-secondary">#UM-{o.id.slice(-4).toUpperCase()}</h4>
                      <span className="bg-[#b02f00] text-white px-2 py-0.5 rounded font-label-sm text-label-sm uppercase">
                        Shelf B-4
                      </span>
                    </div>
                    <div>
                      <p className="font-headline-sm text-body-lg text-secondary">{o.customer?.name || 'Takeaway Guest'}</p>
                      <p className="font-label-lg text-label-lg text-on-surface-variant mt-sm">₹{o.totalAmount}</p>
                    </div>
                    <button
                      onClick={() => handleUpdateStatus(o.id, 'DELIVERED')}
                      className="w-full bg-[#5C3D2E] text-white py-sm rounded-full font-label-lg uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-sm"
                    >
                      Mark as Picked Up
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COMPLETED COLUMN */}
          <div className="bg-surface-container/30 p-md rounded-xl space-y-md border border-outline-variant/10">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-body-lg text-secondary uppercase font-bold">Completed</span>
              <span className="bg-surface-container-high text-on-surface-variant w-6 h-6 rounded-full flex items-center justify-center font-label-sm text-label-sm">
                {completedOrders.length}
              </span>
            </div>

            <div className="space-y-sm">
              {completedOrders.length === 0 ? (
                <p className="text-center py-lg font-label-lg text-on-surface-variant/40">No completed orders today</p>
              ) : (
                completedOrders.map((o) => (
                  <div 
                    key={o.id}
                    className="bg-surface p-md rounded-xl border border-outline-variant shadow-sm space-y-xs opacity-60"
                  >
                    <h4 className="font-display-md text-headline-sm text-secondary flex items-center justify-between">
                      #UM-{o.id.slice(-4).toUpperCase()}
                      <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                    </h4>
                    <p className="font-headline-sm text-body-lg text-secondary">{o.customer?.name || 'Takeaway Guest'}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal (Action Required Popup) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm p-md">
          <div className="bg-surface w-full max-w-2xl rounded-xl border border-outline-variant p-lg space-y-lg shadow-2xl animate-in fade-in zoom-in duration-200 relative">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-sm bg-surface-container hover:bg-surface-container-high rounded-full transition-all"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <span className="bg-primary/10 text-primary px-sm py-xs rounded font-label-sm text-label-sm uppercase tracking-widest font-black inline-block">
              Action Required
            </span>
            <h3 className="font-display-md text-display-sm text-secondary uppercase leading-none">Order Verification</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg pt-md">
              {/* Left Panel - User profile & security notes */}
              <div className="space-y-md border-r border-outline-variant/30 pr-md">
                <div className="flex items-center gap-md">
                  <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center font-display-md text-headline-sm text-primary font-bold">
                    {selectedOrder.customer?.name?.slice(0,2).toUpperCase() || 'TG'}
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-body-lg text-secondary">{selectedOrder.customer?.name || 'Takeaway Guest'}</h4>
                    <p className="font-label-lg text-label-lg text-on-surface-variant">{selectedOrder.customer?.phone || 'No phone number'}</p>
                  </div>
                </div>

                <button className="w-full bg-secondary text-white py-sm rounded-full font-label-lg uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-xs">
                  <span className="material-symbols-outlined text-sm">phone</span>
                  Call Customer
                </button>

                <div className="bg-primary/5 p-md rounded-xl border border-primary/10 flex gap-sm items-start">
                  <span className="material-symbols-outlined text-primary text-xl flex-shrink-0 mt-0.5">info</span>
                  <div className="text-xs">
                    <p className="font-bold text-primary">SECURITY NOTE</p>
                    <p className="text-on-surface-variant mt-xs">Verify customer contact before accepting this high-value order.</p>
                  </div>
                </div>
              </div>

              {/* Right Panel - Order details */}
              <div className="space-y-md">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-label-sm text-on-surface-variant uppercase block">Order ID</span>
                    <span className="font-headline-sm text-body-lg text-secondary">#UM-{selectedOrder.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-label-sm text-on-surface-variant uppercase block">Pickup Time</span>
                    <span className="font-headline-sm text-body-lg text-primary">ASAP</span>
                  </div>
                </div>

                <div className="bg-surface-container p-md rounded-xl space-y-sm">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between font-body-md text-sm text-on-surface">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="text-on-surface-variant">₹{Number(item.totalPrice)}</span>
                    </div>
                  ))}
                  <div className="border-t border-outline-variant/30 pt-sm mt-sm flex justify-between items-center font-display-md text-headline-sm text-secondary">
                    <span>Total</span>
                    <span className="text-primary">₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-md border-t border-outline-variant/30 flex gap-sm">
              <button
                onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                disabled={updating}
                className="flex-1 py-md border border-outline-variant rounded-full text-on-surface-variant font-label-lg uppercase hover:bg-surface-container-high transition-all"
              >
                Reject Order
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedOrder.id, 'PREPARING')}
                disabled={updating}
                className="flex-1 py-md bg-primary text-on-primary rounded-full font-label-lg uppercase shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-xs"
              >
                <span className="material-symbols-outlined text-sm font-black">check</span>
                Accept Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
