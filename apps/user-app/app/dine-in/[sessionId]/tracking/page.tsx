'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSessionStore } from '../../../stores/sessionStore';
import { useRealtimeStore } from '../../../stores/realtimeStore';
import { useTableStream } from '../../../hooks/useTableStream';
import { useSessionOrders } from '../../../hooks/useSessionOrders';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedModifiers?: Array<{ groupName: string; name: string; price: number }>;
}

interface Order {
  id: string;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

export default function DineInTrackingPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { activeSession, refreshSession } = useSessionStore();
  const { data: queryOrders = [], isLoading } = useSessionOrders(activeSession?.id || null);
  const liveOrderStatuses = useRealtimeStore((s) => s.orderStatuses);
  const [sseConnected, setSseConnected] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Subscribe to SSE stream
  useTableStream(activeSession?.id || null, setSseConnected);

  // Synchronized state for orders
  const [orders, setOrders] = useState<Order[]>([]);

  // Sync initial query orders and live updates to local state
  useEffect(() => {
    if (queryOrders) {
      setOrders(
        (queryOrders as Order[]).map((o) => ({
          ...o,
          status: liveOrderStatuses[o.id] || o.status,
        }))
      );
    }
  }, [queryOrders, liveOrderStatuses]);

  useEffect(() => {
    if (!activeSession) {
      refreshSession().then(() => {
        const fresh = useSessionStore.getState().activeSession;
        if (!fresh) {
          router.push('/scan');
        }
      });
    }
  }, [activeSession]);

  if (!activeSession || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate session bill total of all orders
  const sessionTotal = orders.reduce((sum, o) => {
    if (o.status === 'CANCELLED') return sum;
    return sum + o.items.reduce((itemSum, item) => itemSum + Number(item.totalPrice), 0);
  }, 0);

  // Determine current active step across all running orders (received, cooking, ready, served)
  const getAggregatedStep = () => {
    if (orders.length === 0) return 1;
    if (orders.some(o => o.status === 'READY')) return 3;
    if (orders.some(o => o.status === 'PREPARING')) return 2;
    if (orders.every(o => o.status === 'DELIVERED' || o.status === 'SERVED')) return 4;
    return 1; // Default RECEIVED / PLACED
  };

  const currentStep = getAggregatedStep();

  // Helper to determine item card icon & background styling
  const getItemCardStyle = (name: string) => {
    const lowercase = name.toLowerCase();
    let icon = 'restaurant';
    let bg = 'bg-surface-container-low border-outline-variant/30 text-on-surface';
    let iconBg = 'bg-primary/10 text-primary';

    if (lowercase.includes('tikka') || lowercase.includes('cod') || lowercase.includes('sliders')) {
      icon = 'lunch_dining';
      bg = 'bg-secondary-container/20 border-outline-variant/40 text-on-secondary-container';
      iconBg = 'bg-primary/10 text-primary';
    } else if (lowercase.includes('yuzu') || lowercase.includes('mocktail') || lowercase.includes('drink') || lowercase.includes('water')) {
      icon = 'local_bar';
      bg = 'bg-primary/5 border-outline-variant/30 text-on-surface';
      iconBg = 'bg-primary/10 text-primary';
    }

    return { icon, bg, iconBg };
  };

  // Edit / Update / Cancel Item helper
  const handleUpdateItemQuantity = async (orderId: string, itemId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    
    // Update local UI immediately for premium instant feedback
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * newQty
            };
          }
          return item;
        }).filter(item => item.quantity > 0);

        return {
          ...order,
          items: updatedItems
        };
      }
      return order;
    }).filter(order => order.items.length > 0);

    setOrders(updatedOrders);
    showToast(newQty === 0 ? 'Item removed from order!' : 'Order updated successfully!');
  };

  const handleCancelItem = (orderId: string, itemId: string) => {
    handleUpdateItemQuantity(orderId, itemId, 1, -1);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  return (
    <div className="font-hanken text-on-surface bg-background min-h-screen pb-32">
      
      {/* Dynamic Toast Message */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-primary text-on-primary font-headline-sm text-xs px-6 py-3 rounded-full shadow-lg border border-outline-variant/30 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* MOBILE VIEW */}
      <div className="block md:hidden min-h-screen bg-background flex flex-col relative">
        <header className="bg-surface sticky top-0 w-full z-50 flex justify-between items-center px-gutter h-20 shadow-sm">
          <div className="flex items-center gap-base">
            <span onClick={() => router.push('/')} className="material-symbols-outlined text-primary p-2 cursor-pointer active:scale-95">arrow_back</span>
            <h1 className="font-display-md text-headline-lg-mobile text-primary uppercase tracking-tight">foodmood</h1>
          </div>
          <div className="flex items-center gap-sm">
            <div className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-full border border-primary/10">
              <span className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-green-600 animate-pulse' : 'bg-on-surface-variant/30'}`} />
              <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">{sseConnected ? 'Live' : 'Offline'}</span>
            </div>
            <div className="bg-primary text-on-primary font-headline-sm px-4 py-1.5 rounded-full text-xs shadow-sm uppercase">
              TABLE {activeSession?.tableNumber}
            </div>
          </div>
        </header>

        <main className="px-gutter py-lg space-y-md">
          {/* Live Status Hero Card */}
          <section className="bg-primary-container/10 border border-primary-container rounded-xl p-md relative overflow-hidden">
            <div className="relative z-10 space-y-sm">
              <span className="bg-primary text-on-primary font-bold text-[9px] px-3 py-1 rounded-full uppercase tracking-wider">
                Dine-In Session Active
              </span>
              <h2 className="font-display-md text-2xl text-primary leading-none mt-sm">
                {currentStep === 3 ? 'Ready to Serve!' : currentStep === 2 ? 'Chef is Crafting...' : 'Order Received'}
              </h2>
              <p className="text-on-surface-variant text-xs leading-normal">
                {currentStep === 3 
                  ? 'Your fresh dishes are ready! The waiter is on their way to serve you.' 
                  : 'Your selection of signatures is being prepared in the kitchen. Enjoy the experience.'
                }
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 text-primary pointer-events-none select-none">
              <span className="material-symbols-outlined text-[100px]">skillet</span>
            </div>
          </section>

          {/* Stepper progress */}
          <section className="bg-surface-container-low rounded-xl p-md border border-outline-variant/30 space-y-md shadow-sm">
            <h3 className="font-headline-sm text-xs uppercase tracking-wider text-primary">Live Tracking</h3>
            <div className="space-y-sm">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs border ${
                    currentStep >= 1 ? 'bg-green-600 border-green-600 shadow-sm' : 'bg-surface-container-highest border-outline-variant text-on-surface-variant'
                  }`}>
                    {currentStep >= 1 ? <span className="material-symbols-outlined text-[14px]">check</span> : '1'}
                  </div>
                  <div className={`w-[2px] h-8 ${currentStep >= 2 ? 'bg-green-600' : 'bg-outline-variant/30'}`}></div>
                </div>
                <div>
                  <p className="font-bold text-xs text-on-surface uppercase">Order Received</p>
                  <p className="text-[10px] text-on-surface-variant">Live tableside connection ready</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs border ${
                    currentStep >= 2 ? 'bg-primary border-primary shadow-sm' : 'bg-surface-container-highest border-outline-variant text-on-surface-variant'
                  }`}>
                    {currentStep >= 2 ? <span className="material-symbols-outlined text-[14px]">skillet</span> : '2'}
                  </div>
                  <div className={`w-[2px] h-8 ${currentStep >= 3 ? 'bg-green-600' : 'bg-outline-variant/30'}`}></div>
                </div>
                <div>
                  <p className={`font-bold text-xs uppercase ${currentStep >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>Preparing Food</p>
                  {currentStep >= 2 && <p className="text-[10px] text-primary font-bold">Chef has started preparing</p>}
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs border ${
                    currentStep >= 3 ? 'bg-green-600 border-green-600 shadow-sm' : 'bg-surface-container-highest border-outline-variant text-on-surface-variant'
                  }`}>
                    {currentStep >= 3 ? <span className="material-symbols-outlined text-[14px]">restaurant_menu</span> : '3'}
                  </div>
                </div>
                <div>
                  <p className={`font-bold text-xs uppercase ${currentStep >= 3 ? 'text-on-surface' : 'text-on-surface-variant'}`}>Ready to Serve</p>
                  {currentStep >= 3 && <p className="text-[10px] text-green-600 font-bold">Waiter is bringing food</p>}
                </div>
              </div>
            </div>
          </section>

          {/* Active Dishes list */}
          <section className="space-y-sm">
            <h3 className="font-headline-sm text-sm uppercase tracking-wider text-primary">Session Dishes</h3>
            <div className="flex flex-col gap-sm">
              {orders.length === 0 ? (
                <div className="text-center py-6 text-xs text-on-surface-variant font-bold bg-surface-container rounded-xl">
                  No active orders yet.
                </div>
              ) : (
                orders.map((o) => {
                  if (o.status === 'CANCELLED') return null;
                  const isLocked = o.status !== 'RECEIVED' && o.status !== 'PLACED';

                  return o.items.map((item) => {
                    const cardStyle = getItemCardStyle(item.name);
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`p-md rounded-xl border flex items-center gap-md relative ${cardStyle.bg}`}
                      >
                        <div className={`w-12 h-12 rounded-full ${cardStyle.iconBg} flex items-center justify-center shrink-0 border border-outline-variant/20 bg-white`}>
                          <span className="material-symbols-outlined text-xl">{cardStyle.icon}</span>
                        </div>
                        <div className="flex-grow min-w-0 pr-4">
                          <div className="flex justify-between items-center gap-sm">
                            <p className="font-headline-sm text-xs truncate uppercase text-on-surface">{item.name}</p>
                            <span className="bg-white border border-outline font-bold text-[10px] px-2 py-0.5 rounded-full shrink-0">
                              Qty: {item.quantity}
                            </span>
                          </div>
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest truncate mt-0.5">
                              {item.selectedModifiers.map(m => m.name).join(', ')}
                            </p>
                          )}
                          <p className="text-[10px] mt-1 font-bold">
                            {isLocked ? (
                              <span className="text-red-600 flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[12px]">lock</span>
                                Cooking started. Locked
                              </span>
                            ) : (
                              <span className="text-green-600 flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[12px]">edit</span>
                                Editable (STARTERS / MAINS)
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Interactive Edit Action buttons for pre-cooking items */}
                        {!isLocked && (
                          <div className="flex items-center gap-sm bg-white/80 p-1.5 rounded-full border border-outline">
                            <button 
                              onClick={() => handleUpdateItemQuantity(o.id, item.id, item.quantity, -1)}
                              className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-primary border border-outline active:scale-90"
                              title="Decrease"
                            >
                              -
                            </button>
                            <button 
                              onClick={() => handleUpdateItemQuantity(o.id, item.id, item.quantity, 1)}
                              className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-primary border border-outline active:scale-90"
                              title="Increase"
                            >
                              +
                            </button>
                            <button 
                              onClick={() => handleCancelItem(o.id, item.id)}
                              className="w-7 h-7 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-200 active:scale-90"
                              title="Cancel Item"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  });
                })
              )}
            </div>
          </section>

          {/* Sticky Total bill panel */}
          {sessionTotal > 0 && (
            <section className="bg-primary p-md rounded-xl border border-outline-variant/30 flex justify-between items-center shadow-md">
              <div>
                <p className="text-[10px] text-on-primary/75 uppercase font-bold tracking-wider leading-none">Running Session Total</p>
                <p className="font-headline-sm text-2xl text-on-primary mt-1.5 leading-none">₹{sessionTotal}</p>
              </div>
              <button 
                onClick={() => router.push(`/dine-in/${sessionId}/bill`)}
                className="bg-white text-primary px-6 py-2.5 rounded-full font-headline-sm text-xs hover:bg-slate-100 transition-all active:scale-95 shadow border-none"
              >
                View Bill
              </button>
            </section>
          )}
        </main>

        {/* Bottom Persistent Actions */}
        <div className="fixed bottom-0 left-0 w-full z-50 px-6 py-4 flex gap-4 bg-white border-t border-outline-variant/30 max-w-md mx-auto left-1/2 -translate-x-1/2 shadow-lg rounded-t-xl">
          <button 
            onClick={() => router.push(`/dine-in/${sessionId}/menu`)}
            className="flex-grow border-2 border-primary py-4 rounded-full font-headline-sm text-xs text-primary active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined font-bold text-sm">add</span>
            <span>Add Items</span>
          </button>
          <button 
            onClick={() => router.push(`/dine-in/${sessionId}/bill`)}
            className="flex-grow bg-primary text-on-primary py-4 rounded-full font-headline-sm text-xs active:scale-95 transition-all flex items-center justify-center gap-2 hover:opacity-90 border-none"
          >
            <span className="material-symbols-outlined text-sm">payments</span>
            <span>Pay Bill</span>
          </button>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block min-h-screen bg-surface relative">
        <header className="bg-surface fixed top-0 w-full z-50 flex justify-between items-center px-margin h-20 shadow-sm">
          <div className="flex items-center gap-8">
            <span onClick={() => router.push('/')} className="font-display-md text-display-md text-primary cursor-pointer">foodmood OS</span>
            <nav className="hidden md:flex gap-6 items-center">
              <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-lg text-label-lg" href={`/dine-in/${sessionId}/menu`}>Menu</Link>
              <span className="text-primary border-b-2 border-primary font-bold py-1 font-label-lg text-label-lg">Order Tracking</span>
              <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-lg text-label-lg" href={`/dine-in/${sessionId}/bill`}>Pay Bill</Link>
            </nav>
          </div>
          <div className="flex items-center gap-sm">
            <div className="bg-primary text-on-primary font-headline-sm px-6 py-2 rounded-full uppercase">
              TABLE {activeSession?.tableNumber}
            </div>
          </div>
        </header>

        <main className="max-w-screen-xl mx-auto pt-24 pb-12 px-margin grid grid-cols-12 gap-gutter">
          <div className="col-span-8 space-y-md">
            <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Active Dishes in Session</h3>
            
            <div className="space-y-sm">
              {orders.length === 0 ? (
                <div className="text-center py-10 bg-surface-container rounded-xl border border-outline-variant/30">
                  No active orders recorded yet.
                </div>
              ) : (
                orders.map((o) => {
                  if (o.status === 'CANCELLED') return null;
                  const isLocked = o.status !== 'RECEIVED' && o.status !== 'PLACED';

                  return o.items.map((item) => {
                    const cardStyle = getItemCardStyle(item.name);
                    return (
                      <div key={item.id} className="bg-surface-container-low p-md rounded-xl border border-outline-variant/35 shadow-sm flex items-center gap-md justify-between">
                        <div className="flex items-center gap-md">
                          <div className={`w-12 h-12 rounded-full ${cardStyle.iconBg} flex items-center justify-center shrink-0 border border-outline-variant/20 bg-white`}>
                            <span className="material-symbols-outlined text-xl">{cardStyle.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-headline-sm text-sm uppercase truncate text-on-surface">{item.name}</h4>
                            {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                              <p className="text-xs text-on-surface-variant uppercase mt-xs">
                                {item.selectedModifiers.map(m => m.name).join(', ')}
                              </p>
                            )}
                            <p className="text-[10px] mt-1 font-bold">
                              {isLocked ? (
                                <span className="text-red-600 flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[12px]">lock</span>
                                  Chef has started preparing. Locked.
                                </span>
                              ) : (
                                <span className="text-green-600 flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[12px]">edit</span>
                                  Modify starters or mains before cooking starts
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-lg">
                          <span className="font-bold text-xs uppercase text-on-surface-variant">Qty: {item.quantity}</span>
                          <span className="font-headline-sm text-primary text-base">₹{item.totalPrice}</span>

                          {!isLocked && (
                            <div className="flex items-center gap-sm bg-white p-1 rounded-full border border-outline">
                              <button 
                                onClick={() => handleUpdateItemQuantity(o.id, item.id, item.quantity, -1)}
                                className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-primary active:scale-95 border-none"
                              >
                                -
                              </button>
                              <button 
                                onClick={() => handleUpdateItemQuantity(o.id, item.id, item.quantity, 1)}
                                className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-primary active:scale-95 border-none"
                              >
                                +
                              </button>
                              <button 
                                onClick={() => handleCancelItem(o.id, item.id)}
                                className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-200 active:scale-95"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })
              )}
            </div>
          </div>

          <aside className="col-span-4 space-y-md h-fit sticky top-24">
            <div className="bg-surface-container-high p-lg rounded-xl border border-outline-variant/30 space-y-lg">
              <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Session Summary</h3>
              
              <div className="space-y-sm">
                <div className="flex justify-between items-center text-xs text-on-surface-variant uppercase tracking-wider font-bold">
                  <span>Connection</span>
                  <span className="text-green-600">SSE active</span>
                </div>
                <div className="flex justify-between items-center text-xs text-on-surface-variant uppercase tracking-wider font-bold">
                  <span>Cooking Status</span>
                  <span>{currentStep === 3 ? 'Ready to serve' : currentStep === 2 ? 'Preparing' : 'Received'}</span>
                </div>
              </div>

              <div className="border-t border-outline-variant/30 pt-md flex justify-between items-center">
                <span className="font-bold text-xs uppercase text-on-surface-variant">Total Bill Value</span>
                <span className="font-headline-sm text-2xl text-primary">₹{sessionTotal}</span>
              </div>

              <button 
                onClick={() => router.push(`/dine-in/${sessionId}/bill`)}
                className="w-full bg-primary text-on-primary py-4 rounded-full font-headline-sm uppercase active:scale-95 shadow-md flex justify-center items-center gap-sm border-none"
              >
                Proceed to Payment
                <span className="material-symbols-outlined">payments</span>
              </button>
            </div>
          </aside>
        </main>
      </div>

    </div>
  );
}
