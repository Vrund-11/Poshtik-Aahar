'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@foodmart/shared';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedModifiers?: Array<{ groupName: string; name: string; price: number }>;
}

interface OrderDetails {
  id: string;
  status: string;
  tokenNumber: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}

export default function TakeawayTrackingPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    try {
      const res: any = await api.get(`/takeaway/${orderId}`);
      if (res.success && res.data) {
        setOrder(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch takeaway details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();

    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('foodmood_token='))
      ?.split('=')[1];

    const sseUrl = `http://localhost:5000/api/v1/sse/takeaway/${orderId}?token=${token || ''}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      setSseConnected(true);
      console.log('[SSE] Connected to takeaway tracking stream');
    };

    const handleEvent = () => {
      console.log('[SSE] Takeaway status updated event');
      fetchOrderDetails();
    };

    eventSource.addEventListener('ORDER_CONFIRMED', handleEvent);
    eventSource.addEventListener('ORDER_CANCELLED', handleEvent);
    eventSource.addEventListener('ORDER_READY', handleEvent);
    eventSource.addEventListener('ORDER_COMPLETE', handleEvent);

    eventSource.onerror = (err: any) => {
      console.error('[SSE] Connection error:', err);
      setSseConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6 animate-pulse text-center pt-24 bg-background min-h-screen">
        <div className="h-10 w-1/3 bg-surface-container rounded-full mx-auto" />
        <div className="h-64 bg-surface-container rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center space-y-4 p-8 rounded-3xl bg-surface-container-low border border-outline-variant/30 min-h-screen pt-24">
        <span className="material-symbols-outlined text-4xl text-error">error</span>
        <h3 className="font-headline-sm text-xl uppercase text-primary">Order Not Found</h3>
        <p className="text-on-surface-variant text-xs font-bold uppercase">The takeaway order details could not be loaded.</p>
        <Link href="/" className="inline-block px-6 py-3 bg-primary text-on-primary font-headline-sm rounded-full active:scale-95 border-none mt-4 text-xs uppercase">
          Go Back Home
        </Link>
      </div>
    );
  }

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY':
        return 3;
      case 'DELIVERED':
        return 4;
      case 'CANCELLED':
        return 0;
      default:
        return 1;
    }
  };

  const currentStep = getStatusStep(order.status);

  return (
    <div className="font-hanken text-on-surface bg-background min-h-screen pb-32">
      
      {/* MOBILE VIEW */}
      <div className="block md:hidden min-h-screen bg-background flex flex-col relative">
        <header className="bg-surface sticky top-0 w-full z-50 flex justify-between items-center px-gutter h-20 shadow-sm">
          <div className="flex items-center gap-base">
            <span onClick={() => router.push('/')} className="material-symbols-outlined text-primary p-2 cursor-pointer active:scale-95">arrow_back</span>
            <h1 className="font-display-md text-headline-lg-mobile text-primary uppercase tracking-tight">foodmood</h1>
          </div>
          <div className="flex items-center gap-sm">
            <div className="flex items-center gap-1 bg-surface-container-high px-2.5 py-1 rounded-full border border-primary/10 mr-1">
              <span className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-green-600 animate-pulse' : 'bg-on-surface-variant/30'}`} />
              <span className="font-bold text-[8px] uppercase tracking-wider text-on-surface-variant">{sseConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </header>

        <main className="px-gutter py-lg space-y-md">
          {/* Status Header */}
          <div className="bg-primary-container/10 border border-primary-container rounded-xl p-md relative overflow-hidden">
            <div className="relative z-10 space-y-sm">
              <span className="bg-primary text-on-primary font-bold text-[9px] px-3 py-1 rounded-full uppercase tracking-wider">
                Takeaway Prep Active
              </span>
              <h2 className="font-display-md text-2xl text-primary leading-none mt-sm">
                {currentStep === 3 ? 'Ready to Collect!' : currentStep === 2 ? 'Chef is Crafting...' : 'Order Received'}
              </h2>
              <p className="text-on-surface-variant text-xs leading-normal">
                {currentStep === 3 
                  ? 'Your takeaway pack is hot and waiting at the counter! Grab it now.' 
                  : 'We are prepping your order fresh. Check token code below when collecting.'
                }
              </p>
            </div>
          </div>

          {/* Token Code Badge */}
          <div className="bg-primary text-on-primary p-md rounded-xl text-center shadow-md relative overflow-hidden flex flex-col items-center">
            <span className="text-[10px] text-on-primary/75 uppercase tracking-wider mb-1 font-bold">Your Pickup Token</span>
            <span className="font-headline-lg text-4xl">#{order.tokenNumber}</span>
          </div>

          {/* Stepper tracking progress */}
          <section className="bg-surface-container-low rounded-xl p-md border border-outline-variant/30 space-y-md shadow-sm">
            <h3 className="font-headline-sm text-xs uppercase tracking-wider text-primary">Live Prep Status</h3>
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
                  <p className="font-bold text-xs text-on-surface uppercase">Order Confirmed</p>
                  <p className="text-[10px] text-on-surface-variant">Kitchen has received your order</p>
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
                  <p className={`font-bold text-xs uppercase ${currentStep >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>Cooking Food</p>
                  {currentStep >= 2 && <p className="text-[10px] text-primary font-bold">Chef has started baking/preparing</p>}
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs border ${
                    currentStep >= 3 ? 'bg-green-600 border-green-600 shadow-sm' : 'bg-surface-container-highest border-outline-variant text-on-surface-variant'
                  }`}>
                    {currentStep >= 3 ? <span className="material-symbols-outlined text-[14px]">shopping_bag</span> : '3'}
                  </div>
                </div>
                <div>
                  <p className={`font-bold text-xs uppercase ${currentStep >= 3 ? 'text-on-surface' : 'text-on-surface-variant'}`}>Ready for Pickup</p>
                  {currentStep >= 3 && <p className="text-[10px] text-green-600 font-bold">Collect at takeaway counter</p>}
                </div>
              </div>
            </div>
          </section>

          {/* Items Summary list */}
          <section className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30 space-y-md shadow-sm">
            <h3 className="font-headline-sm text-xs uppercase tracking-wider text-primary border-b border-outline-variant/20 pb-base">Basket Summary</h3>
            <div className="space-y-base text-xs font-bold">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <p className="uppercase text-on-surface">{item.name} ×{item.quantity}</p>
                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                      <p className="text-on-surface-variant text-[9px] uppercase tracking-widest mt-0.5">
                        {item.selectedModifiers.map(m => m.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="text-primary font-headline-sm">₹{item.totalPrice}</span>
                </div>
              ))}
              <div className="flex justify-between text-primary text-sm font-headline-sm border-t border-dashed border-outline-variant/40 pt-sm mt-md">
                <span>Total Paid</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block min-h-screen bg-surface relative">
        <header className="bg-surface fixed top-0 w-full z-50 flex justify-between items-center px-margin h-20 shadow-sm">
          <div className="flex items-center gap-8">
            <span onClick={() => router.push('/')} className="font-display-md text-display-md text-primary cursor-pointer">foodmood OS</span>
            <nav className="hidden md:flex gap-6 items-center">
              <span className="text-primary border-b-2 border-primary font-bold py-1 font-label-lg text-label-lg">Order Tracking</span>
              <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-lg text-label-lg" href="/">Back to Home</Link>
            </nav>
          </div>
          <div className="flex items-center gap-sm">
            <div className="bg-primary text-on-primary font-headline-sm px-6 py-2 rounded-full uppercase">
              TOKEN #{order.tokenNumber}
            </div>
          </div>
        </header>

        <main className="max-w-screen-xl mx-auto pt-24 pb-12 px-margin grid grid-cols-12 gap-gutter">
          <div className="col-span-12 mb-8">
            <div className="bg-primary-container/10 border border-primary-container rounded-xl p-lg flex justify-between items-center">
              <div>
                <span className="text-xs uppercase text-primary font-bold tracking-widest">Est. Pickup Collection</span>
                <h1 className="font-display-md text-3xl text-primary mt-1">
                  {currentStep === 3 ? "Your Box is Ready!" : "Ready in 12 - 18 minutes"}
                </h1>
              </div>
              <div className="bg-primary text-on-primary font-headline-lg text-3xl px-8 py-3 rounded-xl shadow">
                #{order.tokenNumber}
              </div>
            </div>
          </div>

          <div className="col-span-5 space-y-md">
            <div className="bg-surface-container-low p-lg rounded-xl border border-outline-variant/30 space-y-md shadow-sm">
              <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Tracking Progress</h3>
              
              <div className="flex flex-col gap-0 relative">
                <div className="absolute left-[15px] top-4 bottom-4 w-1 bg-surface-container-high"></div>

                <div className="flex gap-6 pb-12 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  </div>
                  <div>
                    <p className="font-headline-sm text-sm text-on-surface uppercase">Order Confirmed</p>
                    <p className="text-xs text-on-surface-variant">Kitchen has received your order</p>
                  </div>
                </div>

                <div className={`flex gap-6 pb-12 relative z-10 ${currentStep < 2 ? 'opacity-40' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= 2 ? 'bg-primary text-white animate-pulse' : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">restaurant</span>
                  </div>
                  <div>
                    <p className="font-headline-sm text-sm text-on-surface uppercase">Cooking Fresh</p>
                    <p className="text-xs text-on-surface-variant font-bold text-primary">Est. prep time active</p>
                  </div>
                </div>

                <div className={`flex gap-6 relative z-10 ${currentStep < 3 ? 'opacity-40' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                  </div>
                  <div>
                    <p className="font-headline-sm text-sm text-on-surface uppercase">Ready to Collect</p>
                    <p className="text-xs text-on-surface-variant">Head over to the delivery counter</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Directions map card */}
            <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm">
              <div className="h-44 w-full relative">
                <img className="w-full h-full object-cover grayscale brightness-95" alt="Map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVQsZQbAJ7wKHu0moIxEomQzEaxvbKnX6GWrJDKygRL5_er1bIR-ou8wiTlkWSFndRgn5c0M_gJ21AkEO4SZXYBuqZNxXphebwJxDi_Waeo3EoD62eABNFmqkvnZGZhwrRji0NK9Lt-2GZj2nbIZIc6yvjx_UXzXzb-cjf0_kPoCdOdCz7WR6lFhtUfnx4Kgy1I5KCD0ku6IM3HQCsWsApjJYgtEXpydv5eRJqPh3W4GwsVnV6sw8h-uowf8yvt973aGXcsR7C8lM"/>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-sm uppercase text-on-surface">Store Location</h4>
                <p className="text-xs text-on-surface-variant mt-xs">foodmood Central Kitchen Outlet</p>
              </div>
            </div>
          </div>

          <div className="col-span-7">
            <div className="bg-surface-container-low p-lg rounded-xl border border-outline-variant/30 space-y-md shadow-sm">
              <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Invoice Receipt Summary</h3>
              <div className="space-y-md divide-y divide-outline-variant/20">
                {order.items.map((item) => (
                  <div key={item.id} className="pt-md first:pt-0 flex justify-between items-center text-sm font-bold">
                    <div>
                      <p className="text-on-surface uppercase">{item.name} ×{item.quantity}</p>
                      {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                        <p className="text-xs text-on-surface-variant uppercase mt-xs">
                          {item.selectedModifiers.map(m => m.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="text-primary font-headline-sm">₹{item.totalPrice}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-outline-variant/30 pt-md flex justify-between items-center">
                <span className="font-bold text-xs uppercase text-on-surface-variant">Amount Paid Online</span>
                <span className="font-headline-sm text-2xl text-primary">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}
