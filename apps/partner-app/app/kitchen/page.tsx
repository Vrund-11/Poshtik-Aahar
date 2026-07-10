'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useKitchenOrders } from '../hooks/useKitchenOrders';
import { useUpdateOrderStatus } from '../hooks/useUpdateOrderStatus';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  selectedModifiers?: any;
}

interface Order {
  id: string;
  status: 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  type: 'DINE_IN' | 'TAKEAWAY';
  session?: {
    table: {
      number: number;
    };
  };
}

export default function KitchenDisplaySystem() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [time, setTime] = useState('');

  const { data: rawOrders = [], isLoading: loading } = useKitchenOrders(user?.restaurantId || null);
  const updateStatusMutation = useUpdateOrderStatus();

  useEffect(() => {
    if (user && user.role !== 'CHEF' && user.role !== 'MANAGER' && user.role !== 'OWNER') {
      router.replace('/login');
    }
  }, [user]);

  // Live running clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const handleUpdateStatus = async (id: string, status: Order['status']) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId: id, status });
    } catch (e) {
      console.error(e);
    }
  };

  const getElapsedTime = (createdAt: string) => {
    const elapsedMs = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(elapsedMs / 60000);
    return mins === 0 ? 'Just now' : `${mins}m ago`;
  };

  // Only RECEIVED, PREPARING, and READY orders are shown on KDS columns
  const orders = (rawOrders as Order[]).filter((o: Order) => ['RECEIVED', 'PREPARING', 'READY'].includes(o.status));
  const newOrders = orders.filter((o) => o.status === 'RECEIVED');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');

  return (
    <div className="h-screen w-screen bg-background text-on-surface font-body-md overflow-hidden flex flex-col font-hanken">
      {/* Top Header System */}
      <header className="flex justify-between items-center w-full px-8 h-20 bg-surface-container-low border-b border-outline-variant/30 z-10 shrink-0 select-none umami-shadow">
        <div className="flex items-center gap-md">
          <span className="font-display-md text-display-md text-primary tracking-tighter leading-none block">BISTRO OS</span>
          <div className="h-8 w-[1px] bg-outline-variant hidden sm:block"></div>
          <span className="bg-primary-container text-on-primary-container px-md py-sm rounded-full font-label-lg text-label-lg uppercase tracking-wider">
            Kitchen Display Console
          </span>
        </div>

        {/* Live Clock & Actions */}
        <div className="flex items-center gap-md">
          <div className="font-headline-sm text-headline-sm text-secondary bg-surface-container-high px-md py-sm rounded-full font-bold">
            {time}
          </div>
          <button
            onClick={() => logout()}
            className="px-lg py-sm border border-outline-variant rounded-full font-label-lg text-label-lg uppercase hover:bg-surface-container-high transition-all active:scale-95"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main KDS Grid columns */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 w-full h-full overflow-hidden">
        
        {/* Column 1: NEW */}
        <section className="flex flex-col border-r border-outline-variant/20 bg-surface-container-lowest h-full overflow-hidden">
          <div className="bg-[#fdc8bf] text-on-secondary-container py-md px-lg flex justify-between items-center sticky top-0 z-10 select-none border-b border-outline-variant/30">
            <h2 className="font-display-md text-headline-sm uppercase tracking-wider">New Requests</h2>
            <span className="bg-primary text-on-primary px-sm py-0.5 rounded-full font-label-lg text-label-lg">
              {newOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-md space-y-md custom-scrollbar">
            {loading ? (
              <div className="py-xl text-center text-on-surface-variant font-label-lg">Loading orders...</div>
            ) : newOrders.length === 0 ? (
              <div className="py-xl text-center text-on-surface-variant/40 font-label-lg">No pending orders.</div>
            ) : (
              newOrders.map((o) => (
                <div key={o.id} className="bg-surface p-md rounded-xl border border-outline-variant/30 flex flex-col gap-sm shadow-sm hover:scale-[1.01] transition-all">
                  <div className="flex justify-between items-start border-b border-outline-variant/20 pb-sm">
                    <div>
                      <p className="font-label-sm text-label-sm text-primary uppercase tracking-wider">
                        {getElapsedTime(o.createdAt)}
                      </p>
                      <h3 className="font-display-md text-headline-sm text-secondary mt-xs">Order #UM-{o.id.slice(-4).toUpperCase()}</h3>
                      <span className="bg-surface-container px-sm py-0.5 rounded font-label-sm text-label-sm text-on-surface-variant uppercase mt-xs inline-block">
                        {o.type === 'TAKEAWAY' ? 'Takeaway' : `Table T-${o.session?.table?.number?.toString().padStart(2, '0') || '?'}`}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer text-xl">print</span>
                  </div>

                  {/* Items list */}
                  <div className="space-y-sm py-sm flex-grow">
                    {o.items.map((item) => (
                      <div key={item.id} className="font-body-md text-sm flex justify-between items-start">
                        <div className="flex-1 pr-sm">
                          <span className="font-black text-primary text-sm">{item.quantity}×</span>
                          <span className="ml-sm font-bold text-on-surface">{item.name}</span>
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <p className="text-[10px] text-on-surface-variant font-extrabold italic ml-md mt-xs">
                              + {item.selectedModifiers.map((x: any) => x.name).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {o.notes && (
                      <div className="bg-[#fdc8bf]/10 border border-primary/20 p-sm rounded-xl text-xs text-primary font-bold italic">
                        Note: &quot;{o.notes}&quot;
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(o.id, 'PREPARING')}
                    className="w-full bg-primary text-on-primary py-md rounded-full font-label-lg uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-sm"
                  >
                    Start Preparing
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Column 2: PREPARING */}
        <section className="flex flex-col border-r border-outline-variant/20 bg-surface-container-low h-full overflow-hidden">
          <div className="bg-surface-container text-on-surface py-md px-lg flex justify-between items-center sticky top-0 z-10 select-none border-b border-outline-variant/30">
            <h2 className="font-display-md text-headline-sm uppercase tracking-wider">Preparing</h2>
            <span className="bg-secondary text-white px-sm py-0.5 rounded-full font-label-lg text-label-lg">
              {preparingOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-md space-y-md custom-scrollbar">
            {loading ? (
              <div className="py-xl text-center text-on-surface-variant font-label-lg">Loading orders...</div>
            ) : preparingOrders.length === 0 ? (
              <div className="py-xl text-center text-on-surface-variant/40 font-label-lg">No active meals in kitchen.</div>
            ) : (
              preparingOrders.map((o) => (
                <div key={o.id} className="bg-surface p-md rounded-xl border border-outline-variant/30 flex flex-col gap-sm shadow-sm hover:scale-[1.01] transition-all bg-primary-container/10 border-primary/10">
                  <div className="flex justify-between items-start border-b border-outline-variant/20 pb-sm">
                    <div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                        Started {getElapsedTime(o.createdAt)}
                      </p>
                      <h3 className="font-display-md text-headline-sm text-secondary mt-xs">Order #UM-{o.id.slice(-4).toUpperCase()}</h3>
                      <span className="bg-surface-container px-sm py-0.5 rounded font-label-sm text-label-sm text-on-surface-variant uppercase mt-xs inline-block">
                        {o.type === 'TAKEAWAY' ? 'Takeaway' : `Table T-${o.session?.table?.number?.toString().padStart(2, '0') || '?'}`}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-primary text-xl animate-spin">sync</span>
                  </div>

                  {/* Items list */}
                  <div className="space-y-sm py-sm flex-grow">
                    {o.items.map((item) => (
                      <div key={item.id} className="font-body-md text-sm flex justify-between items-start">
                        <div className="flex-1 pr-sm">
                          <span className="font-black text-primary text-sm">{item.quantity}×</span>
                          <span className="ml-sm font-bold text-on-surface">{item.name}</span>
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <p className="text-[10px] text-on-surface-variant font-extrabold italic ml-md mt-xs">
                              + {item.selectedModifiers.map((x: any) => x.name).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {o.notes && (
                      <div className="bg-[#fdc8bf]/10 border border-primary/20 p-sm rounded-xl text-xs text-primary font-bold italic">
                        Note: &quot;{o.notes}&quot;
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(o.id, 'READY')}
                    className="w-full bg-secondary text-white py-md rounded-full font-label-lg uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-sm"
                  >
                    Mark Food Ready
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Column 3: READY */}
        <section className="flex flex-col bg-surface-container-high h-full overflow-hidden">
          <div className="bg-[#4ADE80]/30 text-secondary py-md px-lg flex justify-between items-center sticky top-0 z-10 select-none border-b border-outline-variant/30">
            <h2 className="font-display-md text-headline-sm uppercase tracking-wider">Ready to Serve</h2>
            <span className="bg-primary text-on-primary px-sm py-0.5 rounded-full font-label-lg text-label-lg">
              {readyOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-md space-y-md custom-scrollbar">
            {loading ? (
              <div className="py-xl text-center text-on-surface-variant font-label-lg">Loading orders...</div>
            ) : readyOrders.length === 0 ? (
              <div className="py-xl text-center text-on-surface-variant/40 font-label-lg">No food waiting to dispatch.</div>
            ) : (
              readyOrders.map((o) => (
                <div key={o.id} className="bg-surface p-md rounded-xl border border-outline-variant/30 flex flex-col gap-sm shadow-sm hover:scale-[1.01] transition-all border-green-500/20 bg-green-50/10">
                  <div className="flex justify-between items-start border-b border-outline-variant/20 pb-sm">
                    <div>
                      <p className="font-label-sm text-label-sm text-green-600 uppercase tracking-wider font-bold">
                        Waiting {getElapsedTime(o.createdAt)}
                      </p>
                      <h3 className="font-display-md text-headline-sm text-secondary mt-xs">Order #UM-{o.id.slice(-4).toUpperCase()}</h3>
                      <span className="bg-surface-container px-sm py-0.5 rounded font-label-sm text-label-sm text-on-surface-variant uppercase mt-xs inline-block">
                        {o.type === 'TAKEAWAY' ? 'Takeaway' : `Table T-${o.session?.table?.number?.toString().padStart(2, '0') || '?'}`}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
                  </div>

                  {/* Items list */}
                  <div className="space-y-sm py-sm flex-grow">
                    {o.items.map((item) => (
                      <div key={item.id} className="font-body-md text-sm flex justify-between items-start">
                        <div className="flex-1 pr-sm">
                          <span className="font-black text-primary text-sm">{item.quantity}×</span>
                          <span className="ml-sm font-bold text-on-surface">{item.name}</span>
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <p className="text-[10px] text-on-surface-variant font-extrabold italic ml-md mt-xs">
                              + {item.selectedModifiers.map((x: any) => x.name).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {o.notes && (
                      <div className="bg-[#fdc8bf]/10 border border-primary/20 p-sm rounded-xl text-xs text-primary font-bold italic">
                        Note: &quot;{o.notes}&quot;
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(o.id, 'SERVED')}
                    className="w-full bg-[#5C3D2E] text-white py-md rounded-full font-label-lg uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-sm"
                  >
                    Served (Dispatch)
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
