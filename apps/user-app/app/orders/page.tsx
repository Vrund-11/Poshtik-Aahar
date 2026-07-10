'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@foodmart/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useOrderHistory } from '../hooks/useOrderHistory';
import { useRestaurants } from '../hooks/useRestaurants';
import { useLoyalty } from '../hooks/useLoyalty';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  menuItemId: string;
  selectedModifiers?: any[];
}

interface Order {
  id: string;
  restaurantId: string;
  type: 'DINE_IN' | 'TAKEAWAY';
  status: string;
  totalAmount: number;
  createdAt: string;
  restaurantName?: string;
  itemsCount: number;
  items: OrderItem[];
}

interface Reservation {
  id: string;
  branchId: string;
  status: string;
  date: string;
  timeSlot: string;
  partySize: number;
  branch: {
    name: string;
    restaurant: {
      name: string;
    };
  };
}

export default function MyOrdersPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const [activeTab, setActiveTab] = useState<'ALL' | 'DINE_IN' | 'TAKEAWAY'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PREPARING' | 'CANCELLED'>('ALL');
  const [timeFilter, setTimeFilter] = useState<'30_DAYS' | '3_MONTHS' | 'ARCHIVE'>('30_DAYS');
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const { data: orderHistory = [], isLoading: ordersLoading } = useOrderHistory(user?.userId || null);
  const { data: restaurants = [] } = useRestaurants();
  const { data: loyaltyData, isLoading: loyaltyLoading } = useLoyalty(user?.userId || null);
  const points = loyaltyData?.balance || 0;

  // Query reservations
  const { data: reservations = [], isLoading: reservationsLoading } = useQuery<Reservation[]>({
    queryKey: ['my-reservations', user?.userId],
    queryFn: async () => {
      const res: any = await api.get('/reservations/customer/my');
      return res.success ? res.data : [];
    },
    enabled: !!user?.userId,
  });

  const loading = ordersLoading || reservationsLoading || loyaltyLoading;

  // Merge orders and restaurant names
  const orders = useMemo<Order[]>(() => {
    if (!orderHistory) return [];
    const nameMap = new Map<string, string>(restaurants.map((r: any) => [r.id as string, r.name as string]));
    return (orderHistory as any[]).map((o: any) => ({
      id: o.id,
      restaurantId: o.restaurantId,
      type: o.type,
      status: o.status,
      totalAmount: Number(o.totalAmount),
      createdAt: o.createdAt,
      restaurantName: nameMap.get(o.restaurantId) || 'foodmood Kitchen',
      itemsCount: o.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0,
      items: o.items || [],
    }));
  }, [orderHistory, restaurants]);

  const handleReorder = (order: Order) => {
    if (!order.items || order.items.length === 0) return;
    setReorderingId(order.id);
    
    try {
      order.items.forEach((item) => {
        addItem({
          menuItemId: item.menuItemId,
          name: item.name,
          price: Number(item.unitPrice),
          quantity: item.quantity,
          selectedModifiers: item.selectedModifiers || [],
          notes: '',
        }, order.restaurantId);
      });

      if (order.type === 'DINE_IN') {
        router.push(`/dine-in/${order.restaurantId}/cart`);
      } else {
        router.push(`/takeaway/${order.restaurantId}/cart`);
      }
    } catch (e) {
      console.error(e);
      setReorderingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
      case 'SERVED':
      case 'READY':
      case 'COMPLETED':
        return 'bg-accent-green/10 text-accent-green font-bold';
      case 'PREPARING':
      case 'RECEIVED':
      case 'CONFIRMED':
        return 'bg-primary/10 text-primary font-bold';
      case 'CANCELLED':
        return 'bg-accent-red/10 text-accent-red font-bold';
      default:
        return 'bg-surface-container-highest text-on-surface-variant';
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab !== 'ALL' && o.type !== activeTab) return false;
    
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'COMPLETED' && !['COMPLETED', 'DELIVERED', 'SERVED', 'READY'].includes(o.status.toUpperCase())) return false;
      if (statusFilter === 'PREPARING' && !['PREPARING', 'RECEIVED', 'CONFIRMED'].includes(o.status.toUpperCase())) return false;
      if (statusFilter === 'CANCELLED' && o.status.toUpperCase() !== 'CANCELLED') return false;
    }

    const orderDate = new Date(o.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (timeFilter === '30_DAYS' && diffDays > 30) return false;
    if (timeFilter === '3_MONTHS' && diffDays > 90) return false;
    
    return true;
  });

  return (
    <div className="font-hanken text-on-surface bg-background min-h-screen relative w-full select-none pb-24 md:pb-0">
      
      {/* MOBILE VIEW */}
      <div className="block md:hidden min-h-screen bg-background flex flex-col relative pb-12">
        <header className="bg-surface dark:bg-surface-dim text-primary dark:text-primary-fixed w-full sticky top-0 z-50 shadow-sm">
          <div className="flex justify-between items-center px-gutter py-base max-w-md mx-auto w-full">
            <button onClick={() => router.push('/')} className="active:scale-95 transition-transform bg-transparent border-none text-primary flex items-center">
              <span className="material-symbols-outlined text-[32px]">arrow_back</span>
            </button>
            <h1 className="font-display-md text-display-md text-primary dark:text-primary-fixed uppercase tracking-tighter">foodmood</h1>
            <button onClick={() => router.push('/profile')} className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent border-none text-primary">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </header>

        <main className="max-w-xl mx-auto px-gutter py-lg pb-32 space-y-md">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary opacity-60">Activity history</span>
            <h1 className="font-headline-lg text-headline-lg uppercase text-on-surface tracking-tight mt-xs">Order History</h1>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-sm overflow-x-auto pb-xs scrollbar-hide">
            {(['ALL', 'DINE_IN', 'TAKEAWAY'] as const).map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full font-label-lg text-label-lg transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab === 'DINE_IN' ? 'Dine-in' : 'Takeaway'}
              </button>
            ))}
          </div>

          {/* Orders Stack */}
          <div className="space-y-gutter">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2].map((n) => (
                  <div key={n} className="h-36 bg-surface-container rounded-xl" />
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-low rounded-xl border border-outline-variant/20">
                <span className="material-symbols-outlined text-5xl text-secondary opacity-30 block mb-2">receipt_long</span>
                <p className="font-body-lg text-on-surface-variant">No orders match these criteria.</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const itemsStr = order.items.map((i: OrderItem) => `${i.quantity}x ${i.name}`).join(', ');
                return (
                  <div key={order.id} className="group relative bg-surface-container-low rounded-xl shadow-sm overflow-hidden transition-all hover:scale-[1.01]">
                    <div className="p-md">
                      <div className="flex justify-between items-start mb-sm">
                        <div className="flex items-center gap-sm">
                          <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
                            <span className="material-symbols-outlined text-[28px]">restaurant</span>
                          </div>
                          <div>
                            <h3 className="font-headline-sm text-headline-sm uppercase">{order.restaurantName || 'foodmood Kitchen'}</h3>
                            <p className="font-label-sm text-label-sm text-on-surface-variant">
                              {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm uppercase ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="my-md py-sm border-y border-outline-variant/30">
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          {itemsStr}
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Amount</p>
                          <p className="font-headline-sm text-headline-sm text-primary">₹{order.totalAmount}</p>
                        </div>
                        <button 
                          onClick={() => handleReorder(order)}
                          disabled={reorderingId === order.id}
                          className="bg-primary-container text-on-primary-container px-8 py-3 rounded-full font-label-lg text-label-lg hover:shadow-lg active:scale-95 transition-all"
                        >
                          {reorderingId === order.id ? 'Loading...' : 'Reorder'}
                        </button>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-surface-container-low opacity-30" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 95%, 98% 93%, 96% 95%, 94% 93%, 92% 95%, 90% 93%, 88% 95%, 86% 93%, 84% 95%, 82% 93%, 80% 95%, 78% 93%, 76% 95%, 74% 93%, 72% 95%, 70% 93%, 68% 95%, 66% 93%, 64% 95%, 62% 93%, 60% 95%, 58% 93%, 56% 95%, 54% 93%, 52% 95%, 50% 93%, 48% 95%, 46% 93%, 44% 95%, 42% 93%, 40% 95%, 38% 93%, 36% 95%, 34% 93%, 32% 95%, 30% 93%, 28% 95%, 26% 93%, 24% 95%, 22% 93%, 0% 95%)' }}></div>
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* BottomNavBar */}
        <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-surface-container dark:bg-surface-container-high z-50 rounded-t-lg shadow-[0_-4px_20px_0_rgba(62,31,26,0.08)]">
          <Link href="/" className="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim px-sm py-xs hover:text-primary transition-all duration-200">
            <span className="material-symbols-outlined">explore</span>
            <span className="font-label-sm text-label-sm mt-xs">Explore</span>
          </Link>
          <Link href="/scan" className="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim px-sm py-xs hover:text-primary transition-all duration-200">
            <span className="material-symbols-outlined">qr_code_scanner</span>
            <span className="font-label-sm text-label-sm mt-xs">Scan</span>
          </Link>
          <Link href="/orders" className="flex flex-col items-center justify-center bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary rounded-full px-sm py-xs active:scale-90 transition-all duration-200">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
            <span className="font-label-sm text-label-sm mt-xs">Orders</span>
          </Link>
          <Link href="/loyalty" className="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim px-sm py-xs hover:text-primary transition-all duration-200">
            <span className="material-symbols-outlined">wallet</span>
            <span className="font-label-sm text-label-sm mt-xs">Rewards</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim px-sm py-xs hover:text-primary transition-all duration-200">
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-sm text-label-sm mt-xs">Profile</span>
          </Link>
        </nav>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block min-h-screen bg-surface relative pb-20">
        <header className="fixed top-0 w-full z-50 bg-surface-container-low shadow-[0_8px_30px_rgb(62,31,26,0.08)]">
          <div className="flex justify-between items-center w-full px-margin py-base max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-md">
              <Link href="/" className="font-display-md text-display-md text-primary tracking-tighter uppercase">foodmood OS</Link>
              <nav className="hidden md:flex items-center gap-md ml-lg">
                <Link className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-lg text-label-lg" href="/">Discover</Link>
                <Link className="text-primary font-bold border-b-2 border-primary pb-1 font-label-lg text-label-lg" href="/orders">Orders</Link>
                <Link className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-lg text-label-lg" href="/orders">Reservations</Link>
                <Link className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-lg text-label-lg" href="/loyalty">Loyalty</Link>
              </nav>
            </div>
            <div className="flex items-center gap-sm">
              <button className="p-base hover:bg-surface-variant/50 transition-all duration-300 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant">shopping_bag</span>
              </button>
              <button className="p-base hover:bg-surface-variant/50 transition-all duration-300 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              </button>
              <Link href="/profile" className="flex items-center gap-xs ml-sm group cursor-pointer">
                <img className="w-10 h-10 rounded-full object-cover border-2 border-primary" alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLBQOKPkaKn4Sm3KxpZyGnZfEp97zSgBFTaLWUhdHS6ByTaXT-16kvBOfElDdqZHXXugzlnQhWM3KUQcc9Nk9GLNpuFLm3PhVru5vuL3y6qYbyYprbjYGPBkZPYoosZz89yiQp3aVx7vvFxZTLHejwQobW_ETqvk-H762lghiptLN7f7o2o7brRLtm4tfeAu8k32XYw3C_wlvzbSKxuMZta8mp8YEoems9IJaC6AnmROMtf18_D1UJfYD4BngjkPy-skdOpK0dIOY" />
                <span className="font-label-lg text-label-lg text-on-surface ml-xs font-bold hover:text-primary transition-colors">Profile</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="pt-28 pb-12 px-margin max-w-[1600px] mx-auto grid grid-cols-12 gap-gutter">
          {/* Sidebar Filter (Desktop) */}
          <aside className="col-span-3 space-y-8 h-fit sticky top-28">
            <div className="bg-surface-container-low p-md rounded-xl space-y-6">
              <div>
                <h2 className="font-headline-lg text-headline-sm text-primary mb-4">Filter Orders</h2>
                <div className="flex flex-wrap gap-2">
                  <span 
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-4 py-2 rounded-full font-label-sm text-label-sm cursor-pointer border ${
                      statusFilter === 'ALL' ? 'bg-primary-container text-on-primary-container border-primary' : 'bg-surface-container-highest text-on-surface-variant border-transparent'
                    }`}
                  >
                    All
                  </span>
                  <span 
                    onClick={() => setStatusFilter('COMPLETED')}
                    className={`px-4 py-2 rounded-full font-label-sm text-label-sm cursor-pointer border ${
                      statusFilter === 'COMPLETED' ? 'bg-primary-container text-on-primary-container border-primary' : 'bg-surface-container-highest text-on-surface-variant border-transparent'
                    }`}
                  >
                    Delivered
                  </span>
                  <span 
                    onClick={() => setStatusFilter('PREPARING')}
                    className={`px-4 py-2 rounded-full font-label-sm text-label-sm cursor-pointer border ${
                      statusFilter === 'PREPARING' ? 'bg-primary-container text-on-primary-container border-primary' : 'bg-surface-container-highest text-on-surface-variant border-transparent'
                    }`}
                  >
                    In Kitchen
                  </span>
                  <span 
                    onClick={() => setStatusFilter('CANCELLED')}
                    className={`px-4 py-2 rounded-full font-label-sm text-label-sm cursor-pointer border ${
                      statusFilter === 'CANCELLED' ? 'bg-primary-container text-on-primary-container border-primary' : 'bg-surface-container-highest text-on-surface-variant border-transparent'
                    }`}
                  >
                    Cancelled
                  </span>
                </div>
              </div>

              <div className="border-t border-outline-variant pt-6">
                <span className="font-display-md text-[12px] text-on-surface-variant uppercase tracking-widest block mb-4">Time Period</span>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded-full border-2 border-outline-variant group-hover:border-primary transition-colors flex items-center justify-center">
                      <div className={`w-2.5 h-2.5 rounded-full bg-primary ${timeFilter === '30_DAYS' ? 'opacity-100' : 'opacity-0'}`}></div>
                    </div>
                    <input checked={timeFilter === '30_DAYS'} onChange={() => setTimeFilter('30_DAYS')} className="hidden" type="radio"/>
                    <span className="font-body-md text-body-md text-on-surface">Last 30 Days</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded-full border-2 border-outline-variant group-hover:border-primary transition-colors flex items-center justify-center">
                      <div className={`w-2.5 h-2.5 rounded-full bg-primary ${timeFilter === '3_MONTHS' ? 'opacity-100' : 'opacity-0'}`}></div>
                    </div>
                    <input checked={timeFilter === '3_MONTHS'} onChange={() => setTimeFilter('3_MONTHS')} className="hidden" type="radio"/>
                    <span className="font-body-md text-body-md text-on-surface">Last 3 Months</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded-full border-2 border-outline-variant group-hover:border-primary transition-colors flex items-center justify-center">
                      <div className={`w-2.5 h-2.5 rounded-full bg-primary ${timeFilter === 'ARCHIVE' ? 'opacity-100' : 'opacity-0'}`}></div>
                    </div>
                    <input checked={timeFilter === 'ARCHIVE'} onChange={() => setTimeFilter('ARCHIVE')} className="hidden" type="radio"/>
                    <span className="font-body-md text-body-md text-on-surface">Archive</span>
                  </label>
                </div>
              </div>

              <div className="bg-secondary-container p-md rounded-xl border border-secondary">
                <div className="flex items-center gap-3 text-on-secondary-container mb-2">
                  <span className="material-symbols-outlined">stars</span>
                  <span className="font-label-lg text-label-lg uppercase">foodmood Rewards</span>
                </div>
                <p className="font-body-md text-on-secondary-container text-sm leading-relaxed">You have {points} foodie points! That's enough for a free Truffle Mochi appetizer.</p>
                <button onClick={() => router.push('/loyalty')} className="mt-4 w-full py-2 bg-secondary text-white rounded-full font-label-sm text-label-sm hover:scale-95 transition-transform">Redeem Points</button>
              </div>
            </div>
          </aside>

          {/* Main Content (Bento Grid Style) */}
          <div className="col-span-9 space-y-8">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="font-display-lg text-headline-lg text-on-surface uppercase leading-none">Order History</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">Managing your historical transactions</p>
              </div>
            </header>

            <div className="space-y-6">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-28 bg-surface-container-high rounded-xl" />
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <span className="material-symbols-outlined text-5xl text-secondary opacity-30 block mb-2">receipt_long</span>
                  <p className="font-body-lg text-on-surface-variant">No orders match these criteria.</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const itemsStr = order.items.map((i: OrderItem) => `${i.quantity}x ${i.name}`).join(', ');
                  return (
                    <div key={order.id} className="bg-surface-container rounded-t-xl transition-all hover:translate-y-[-4px] cursor-pointer overflow-hidden group shadow-sm">
                      <div className="p-md flex justify-between items-start border-b border-dashed border-outline-variant">
                        <div className="flex gap-6">
                          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-outline-variant/10">
                            <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Burger" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrAYwSX-epjtUgrkPKnXvyISIYdcNtpRIB_9dMGbbMqVxX624msufvdmsNU1Hru4xoBqD6hiTKJ6HoOK7KLouyNSeDroRn_VvzrlG3bjdhsjCLwDqimMIfU08Tdv9zLAzdvna6NV-9RrM8C0K5sF2gHhkWmlXlEDvFwwiNX1fI_lwj2kstS4pEl5R3mJ0YEq8rZR3g5MvEYsBhgYE9OsNQQF_cAEtTHsq8bol-W1GPnjLA2W5margWKbG5Ac6tIbQ8uqwkMTrBhgU" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-headline-sm text-headline-sm">Order #{order.id}</h3>
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${getStatusBadge(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-on-surface-variant text-sm">
                              {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="font-label-lg text-label-lg mt-1">{itemsStr}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display-md text-headline-sm text-on-surface">₹{order.totalAmount}</p>
                          <p className="text-on-surface-variant text-sm mt-1">{order.type === 'DINE_IN' ? 'Dine-in' : 'Takeaway'}</p>
                        </div>
                      </div>
                      <div className="bg-surface-container-low px-md py-4 flex justify-between items-center" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 95%, 98% 100%, 96% 95%, 94% 100%, 92% 95%, 90% 100%, 88% 95%, 86% 100%, 84% 95%, 82% 100%, 80% 95%, 78% 100%, 76% 95%, 74% 100%, 72% 95%, 70% 100%, 68% 95%, 66% 100%, 64% 95%, 62% 100%, 60% 95%, 58% 100%, 56% 95%, 54% 100%, 52% 95%, 50% 100%, 48% 95%, 46% 100%, 44% 95%, 42% 100%, 40% 95%, 38% 100%, 36% 95%, 34% 100%, 32% 95%, 30% 100%, 28% 95%, 26% 100%, 24% 95%, 22% 100%, 20% 95%, 18% 100%, 16% 95%, 14% 100%, 12% 95%, 10% 100%, 8% 95%, 6% 100%, 4% 95%, 2% 100%, 0% 95%)' }}>
                        <div className="flex gap-4">
                          <button className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 text-sm font-label-lg">
                            <span className="material-symbols-outlined text-[18px]">receipt</span> View Receipt
                          </button>
                          <button className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 text-sm font-label-lg bg-transparent border-none">
                            <span className="material-symbols-outlined text-[18px]">chat</span> Support
                          </button>
                        </div>
                        <button 
                          onClick={() => handleReorder(order)}
                          disabled={reorderingId === order.id}
                          className="bg-primary-container text-on-primary-container font-label-lg px-8 py-3 rounded-full hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[20px]">refresh</span>
                          {reorderingId === order.id ? 'Reordering...' : 'Reorder Now'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}
