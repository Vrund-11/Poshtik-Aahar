'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@foodmart/shared';
import { useCartStore } from '../../stores/cartStore';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  menuItemId: string;
  selectedModifiers?: any[];
}

interface OrderDetails {
  id: string;
  restaurantId: string;
  type: 'DINE_IN' | 'TAKEAWAY';
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  tokenNumber?: string;
  tableNumber?: string;
  notes?: string;
  items: OrderItem[];
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  // Accordion Toggles (Mobile view)
  const [viewItemsOpen, setViewItemsOpen] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [diningOpen, setDiningOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('auth-page-active');
    return () => {
      document.body.classList.remove('auth-page-active');
    };
  }, []);

  // Query order details
  const { data: order, isLoading: orderLoading } = useQuery<OrderDetails | null>({
    queryKey: ['order', id],
    queryFn: async () => {
      const res: any = await api.get(`/orders/${id}`);
      return res.success ? res.data : null;
    },
    enabled: !!id,
  });

  // Query restaurant details
  const { data: restaurant, isLoading: restLoading } = useQuery<any | null>({
    queryKey: ['restaurant-info', order?.restaurantId],
    queryFn: async () => {
      const res: any = await api.get(`/restaurants/${order?.restaurantId}`);
      return res.success ? res.data : null;
    },
    enabled: !!order?.restaurantId,
  });

  const loading = orderLoading || restLoading;
  const restaurantName = restaurant?.name || '';
  const restaurantAddress = restaurant?.address || 'Midtown Manhattan, NY';

  const handleReorderEverything = () => {
    if (!order || !order.items || order.items.length === 0) return;

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
      router.push(`/dine-in/${order.id}/cart`);
    } else {
      router.push(`/takeaway/${order.restaurantId}/cart`);
    }
  };

  if (loading) {
    return (
      <div className="auth-page max-w-md mx-auto p-6 space-y-6 animate-pulse text-center pt-24 bg-background min-h-screen">
        <div className="h-10 w-1/3 bg-surface-container mx-auto rounded-full" />
        <div className="h-64 bg-surface-container rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="auth-page max-w-md mx-auto mt-12 text-center space-y-4 p-8 bg-background min-h-screen pt-24">
        <span className="material-symbols-outlined text-4xl text-error">error</span>
        <h3 className="font-headline-sm text-headline-sm text-primary uppercase">Order Not Found</h3>
        <p className="font-body-md text-on-surface-variant">The receipt details could not be loaded.</p>
        <Link href="/orders" className="inline-block px-6 py-3 bg-primary text-on-primary font-label-lg rounded-full">
          Go to Bookings
        </Link>
      </div>
    );
  }

  const isActive = ['PREPARING', 'RECEIVED', 'CONFIRMED'].includes(order.status);
  const isCompleted = ['DELIVERED', 'SERVED', 'COMPLETED'].includes(order.status);
  const isCancelled = order.status === 'CANCELLED';

  const statusLabel = isActive
    ? 'Preparing your order'
    : isCompleted
      ? 'Completed'
      : isCancelled
        ? 'Cancelled'
        : order.status;

  const serviceCharge = Math.round(Number(order.subtotal) * 0.1 * 100) / 100;

  const getItemImage = (name: string) => {
    const lowercase = name.toLowerCase();
    if (lowercase.includes('burger') || lowercase.includes('wagyu')) {
      return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200&auto=format&fit=crop';
    }
    if (lowercase.includes('pizza')) {
      return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200&auto=format&fit=crop';
    }
    if (lowercase.includes('fries') || lowercase.includes('potatoes')) {
      return 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=200&auto=format&fit=crop';
    }
    if (lowercase.includes('salad')) {
      return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200&auto=format&fit=crop';
    }
    if (lowercase.includes('mojito') || lowercase.includes('drink') || lowercase.includes('cocktail')) {
      return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=200&auto=format&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop';
  };

  return (
    <div className="auth-page w-full min-h-screen bg-background relative text-on-surface select-none">
      
      {/* ═══════════════════════════════ */}
      {/* MOBILE VIEW                     */}
      {/* ═══════════════════════════════ */}
      <div className="block md:hidden min-h-screen bg-background flex flex-col relative pb-28">
        {/* Sticky Top Bar */}
        <header className="bg-surface sticky top-0 z-50 w-full">
          <div className="flex justify-between items-center px-gutter py-base max-w-md mx-auto w-full">
            <div className="flex items-center gap-sm">
              <button onClick={() => router.push('/orders')} className="active:scale-95 transition-transform text-primary bg-transparent border-none">
                <span className="material-symbols-outlined text-[32px]">arrow_back</span>
              </button>
              <h1 className="font-display-md text-display-md text-primary uppercase">foodmood</h1>
            </div>
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-[32px]">account_circle</span>
            </div>
          </div>
        </header>

        <main className="flex-grow pt-base pb-12 px-gutter max-w-md mx-auto w-full space-y-6">
          {/* Header Section */}
          <section className="mt-base mb-lg">
            <div className="flex flex-col gap-xs">
              <span className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest">Order Receipt</span>
              <h2 className="font-display-md text-[40px] text-primary leading-none">#UK-{order.id.slice(-6).toUpperCase()}</h2>
            </div>
            <div className={`mt-sm inline-flex items-center gap-xs px-sm py-xs rounded-full ${
              isActive
                ? 'bg-on-primary-fixed text-primary-container'
                : isCompleted
                  ? 'bg-primary text-on-primary'
                  : 'bg-error text-on-error'
            }`}>
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isActive ? 'restaurant' : isCompleted ? 'check_circle' : 'cancel'}
              </span>
              <span className="font-label-sm text-label-sm uppercase">{statusLabel}</span>
            </div>
          </section>

          {/* Interactive Accordion Container */}
          <div className="flex flex-col gap-md">
            
            {/* View Items Accordion */}
            <div className="bg-surface-container rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(62,31,26,0.04)]">
              <button 
                onClick={() => setViewItemsOpen(!viewItemsOpen)}
                className="w-full flex justify-between items-center px-md py-md active:scale-[0.98] transition-transform border-none bg-transparent outline-none"
              >
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">lunch_dining</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">View Items</span>
                </div>
                <span className={`material-symbols-outlined transition-transform duration-300 text-on-surface-variant ${viewItemsOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${viewItemsOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-md pb-md flex flex-col gap-md">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-md items-center">
                      <div
                        className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0"
                        style={{ backgroundImage: `url('${getItemImage(item.name)}')` }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-label-lg text-label-lg text-on-surface truncate">{item.name}</p>
                        <p className="font-body-md text-label-sm text-on-surface-variant">
                          x{item.quantity}
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && ` • ${item.selectedModifiers.map((m: any) => m.name).join(', ')}`}
                        </p>
                      </div>
                      <span className="font-headline-sm text-headline-sm text-primary shrink-0">₹{Number(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Details Accordion */}
            <div className="bg-surface-container rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(62,31,26,0.04)]">
              <button 
                onClick={() => setPaymentOpen(!paymentOpen)}
                className="w-full flex justify-between items-center px-md py-md active:scale-[0.98] transition-transform border-none bg-transparent outline-none"
              >
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">payments</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">Payment Details</span>
                </div>
                <span className={`material-symbols-outlined transition-transform duration-300 text-on-surface-variant ${paymentOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${paymentOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-md pb-md flex flex-col gap-sm border-t border-outline-variant pt-md">
                  <div className="flex justify-between">
                    <span className="font-body-md text-on-surface-variant">Subtotal</span>
                    <span className="font-label-lg text-on-surface">₹{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body-md text-on-surface-variant">GST (5%)</span>
                    <span className="font-label-lg text-on-surface">₹{order.taxAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body-md text-on-surface-variant">Service Charge (10%)</span>
                    <span className="font-label-lg text-on-surface">₹{serviceCharge}</span>
                  </div>
                  <div className="flex justify-between mt-sm pt-sm border-t border-outline-variant">
                    <span className="font-headline-sm text-headline-sm text-on-surface">Total</span>
                    <span className="font-display-md text-[32px] text-primary">₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dining Details Accordion */}
            <div className="bg-surface-container rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(62,31,26,0.04)]">
              <button 
                onClick={() => setDiningOpen(!diningOpen)}
                className="w-full flex justify-between items-center px-md py-md active:scale-[0.98] transition-transform border-none bg-transparent outline-none"
              >
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">storefront</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    {order.type === 'DINE_IN' ? 'Dining Details' : 'Takeaway Details'}
                  </span>
                </div>
                <span className={`material-symbols-outlined transition-transform duration-300 text-on-surface-variant ${diningOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${diningOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-md pb-md flex flex-col gap-sm border-t border-outline-variant pt-md">
                  <div>
                    <p className="font-label-sm text-on-surface-variant uppercase">Restaurant</p>
                    <p className="font-label-lg text-on-surface">{restaurantName || 'foodmood Kitchen'}</p>
                  </div>
                  <div className="mt-sm">
                    <p className="font-label-sm text-on-surface-variant uppercase">Address</p>
                    <p className="font-label-lg text-on-surface">{restaurantAddress}</p>
                  </div>
                  <div className="mt-sm">
                    <p className="font-label-sm text-on-surface-variant uppercase">Order Type</p>
                    <div className="inline-flex items-center gap-xs text-primary-container bg-on-primary-fixed px-sm py-xs rounded-full mt-xs">
                      <span className="material-symbols-outlined text-[16px]">restaurant</span>
                      <span className="font-label-sm">{order.type === 'DINE_IN' ? 'DINE-IN' : 'TAKEAWAY'}</span>
                    </div>
                  </div>
                  {order.tableNumber && (
                    <div className="mt-sm">
                      <p className="font-label-sm text-on-surface-variant uppercase">Table</p>
                      <p className="font-label-lg text-on-surface">Table #{order.tableNumber}</p>
                    </div>
                  )}
                  {order.tokenNumber && (
                    <div className="mt-sm">
                      <p className="font-label-sm text-on-surface-variant uppercase">Token Number</p>
                      <p className="font-label-lg text-on-surface">{order.tokenNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Secure Ticket */}
          <div className="mt-xl relative">
            <div className="bg-surface-container-high ticket-edge p-lg rounded-t-xl text-center flex flex-col items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <p className="font-headline-lg text-headline-lg uppercase text-on-surface">Transaction Secure</p>
              <p className="font-body-md text-on-surface-variant px-md">
                {isActive
                  ? "Your chef is currently crafting your experience. We'll notify you when it's ready."
                  : isCompleted
                    ? 'Your order has been successfully completed. Thank you for dining with us!'
                    : 'This order was cancelled.'}
              </p>
              {isActive && (
                <>
                  <div className="w-full h-[1px] bg-outline-variant my-sm border-dashed border-t-[2px]"></div>
                  <div className="flex flex-col gap-xs">
                    <p className="font-label-sm text-on-surface-variant">ESTIMATED WAIT</p>
                    <p className="font-display-md text-[32px] text-primary">12-15 MINS</p>
                  </div>
                </>
              )}
              {isCompleted && (
                <>
                  <div className="w-full h-[1px] bg-outline-variant my-sm border-dashed border-t-[2px]"></div>
                  <div className="flex flex-col gap-xs">
                    <p className="font-label-sm text-on-surface-variant uppercase">Order Type</p>
                    <p className="font-headline-sm text-headline-sm text-primary uppercase">
                      {order.type === 'DINE_IN' ? 'Dine-In Experience' : 'Takeaway Pickup'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Button */}
          {isActive ? (
            <button
              onClick={() => {
                if (order.type === 'DINE_IN') {
                  router.push(`/dine-in/${order.id}/tracking`);
                } else {
                  router.push(`/takeaway/tracking/${order.id}`);
                }
              }}
              className="w-full bg-primary-container text-on-primary-container font-headline-sm py-md rounded-full shadow-lg active:scale-95 transition-all duration-200 uppercase tracking-widest"
            >
              Track Order
            </button>
          ) : (
            <button 
              onClick={handleReorderEverything}
              className="w-full bg-primary-container text-on-primary-container font-headline-sm py-md rounded-full shadow-lg active:scale-95 transition-all duration-200 uppercase tracking-widest"
            >
              Reorder Everything
            </button>
          )}
        </main>

        {/* Bottom Nav Bar */}
        <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-surface-container shadow-[0_-4px_20px_0_rgba(62,31,26,0.08)] z-50 rounded-t-lg">
          <Link href="/" className="flex flex-col items-center justify-center text-secondary px-sm py-xs hover:text-primary transition-all active:scale-90">
            <span className="material-symbols-outlined">explore</span>
            <span className="font-label-sm text-label-sm">Explore</span>
          </Link>
          <Link href="/" className="flex flex-col items-center justify-center text-secondary px-sm py-xs hover:text-primary transition-all active:scale-90">
            <span className="material-symbols-outlined">qr_code_scanner</span>
            <span className="font-label-sm text-label-sm">Scan</span>
          </Link>
          <Link href="/orders" className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-sm py-xs transition-all active:scale-90">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
            <span className="font-label-sm text-label-sm">Orders</span>
          </Link>
          <Link href="/loyalty" className="flex flex-col items-center justify-center text-secondary px-sm py-xs hover:text-primary transition-all active:scale-90">
            <span className="material-symbols-outlined">wallet</span>
            <span className="font-label-sm text-label-sm">Rewards</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center text-secondary px-sm py-xs hover:text-primary transition-all active:scale-90">
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-sm text-label-sm">Profile</span>
          </Link>
        </nav>
      </div>

      {/* ═══════════════════════════════ */}
      {/* DESKTOP VIEW                    */}
      {/* ═══════════════════════════════ */}
      <div className="hidden md:block min-h-screen bg-surface relative pb-20">
        {/* Top Bar */}
        <header className="w-full sticky top-0 z-50 bg-surface">
          <div className="flex justify-between items-center px-gutter py-base max-w-7xl mx-auto w-full">
            <button onClick={() => router.push('/orders')} className="hover:opacity-80 transition-opacity active:scale-95 flex items-center bg-transparent border-none">
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <h1 className="font-display-md text-display-md text-primary uppercase tracking-tighter">foodmood</h1>
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary hover:opacity-85 cursor-pointer">share</span>
              <span className="material-symbols-outlined text-primary hover:opacity-85 cursor-pointer">help_outline</span>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-margin pt-sm lg:pt-md">
          {/* Order Identification Header */}
          <div className="mb-lg">
            <div className="flex justify-between items-end mb-xs">
              <div>
                <p className="font-label-lg text-label-lg text-on-surface-variant uppercase mb-xs">Order Summary</p>
                <h2 className="font-display-md text-[32px] leading-tight text-on-surface">#UK-{order.id.slice(-6).toUpperCase()}</h2>
              </div>
              <div className={`px-sm py-xs rounded-full flex items-center gap-xs ${
                isCompleted
                  ? 'bg-primary text-on-primary'
                  : isActive
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-error text-on-error'
              }`}>
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isCompleted ? 'check_circle' : isActive ? 'restaurant' : 'cancel'}
                </span>
                <span className="font-label-sm text-label-sm uppercase">{statusLabel}</span>
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Placed on {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Bento Layout: Total Paid + Restaurant Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
            {/* Total Paid Card */}
            <div className="md:col-span-1 bg-surface-container-high rounded-xl p-md flex flex-col justify-between border-none umami-shadow min-h-[140px]">
              <p className="font-label-lg text-label-lg text-on-surface-variant uppercase">Total Paid</p>
              <div>
                <p className="font-display-md text-[40px] text-primary">₹{order.totalAmount}</p>
                <div className="flex items-center gap-xs text-secondary mt-xs">
                  <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                  <span className="font-label-sm text-label-sm">Via UPI</span>
                </div>
              </div>
            </div>

            {/* Restaurant Info Card */}
            <div className="md:col-span-2 bg-surface-container rounded-xl p-md flex gap-md umami-shadow">
              <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-outline-variant/20">
                <img className="w-full h-full object-cover" alt="Restaurant" src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=300&auto=format&fit=crop" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">{restaurantName || 'foodmood Eatery'}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-xs">{restaurantAddress}</p>
                <div className="inline-flex items-center gap-xs bg-on-secondary-fixed text-on-secondary py-1 px-3 rounded-full w-fit">
                  <span className="material-symbols-outlined text-[14px]">restaurant</span>
                  <span className="font-label-sm text-label-sm">
                    {order.type === 'DINE_IN' ? 'Dine-in' : 'Takeaway'}
                    {order.tableNumber && ` • Table #${order.tableNumber}`}
                    {order.tokenNumber && ` • Token ${order.tokenNumber}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* The Order Items — Jagged Ticket */}
          <div className="mb-xl">
            <h4 className="font-headline-lg text-headline-lg text-on-surface mb-md">Your Order</h4>
            <div className="ticket-jagged rounded-t-xl p-lg umami-shadow">
              <div className="space-y-lg">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex gap-md">
                      <div className="bg-primary-container text-on-primary-container font-headline-sm text-headline-sm w-10 h-10 flex items-center justify-center rounded-lg">
                        {item.quantity}
                      </div>
                      <div>
                        <h5 className="font-headline-sm text-headline-sm text-on-surface">{item.name}</h5>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          {item.selectedModifiers && item.selectedModifiers.length > 0
                            ? item.selectedModifiers.map((m: any) => m.name).join(', ')
                            : 'Standard preparation'}
                        </p>
                      </div>
                    </div>
                    <p className="font-headline-sm text-headline-sm text-on-surface">₹{Number(item.totalPrice)}</p>
                  </div>
                ))}
              </div>
              {/* Spacer for the jagged edge */}
              <div className="h-12"></div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-surface-container-low rounded-xl p-lg mb-xl umami-shadow">
            <h4 className="font-label-lg text-label-lg text-on-surface-variant uppercase mb-md">Payment Details</h4>
            <div className="space-y-sm">
              <div className="flex justify-between">
                <span className="font-body-lg text-body-lg text-on-surface-variant">Subtotal</span>
                <span className="font-body-lg text-body-lg text-on-surface">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body-lg text-body-lg text-on-surface-variant">GST (5%)</span>
                <span className="font-body-lg text-body-lg text-on-surface">₹{order.taxAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body-lg text-body-lg text-on-surface-variant">Service Charge (10%)</span>
                <span className="font-body-lg text-body-lg text-on-surface">₹{serviceCharge}</span>
              </div>
              <div className="pt-md border-t-2 border-outline-variant flex justify-between items-center">
                <span className="font-headline-sm text-headline-sm text-on-surface">Total Amount</span>
                <span className="font-headline-lg text-headline-lg text-primary">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-md">
            {isActive ? (
              <button
                onClick={() => {
                  if (order.type === 'DINE_IN') {
                    router.push(`/dine-in/${order.id}/tracking`);
                  } else {
                    router.push(`/takeaway/tracking/${order.id}`);
                  }
                }}
                className="flex-1 bg-primary text-on-primary font-label-lg text-label-lg uppercase py-md px-lg rounded-full active:scale-[0.98] transition-all hover:opacity-90"
              >
                Track Live Order
              </button>
            ) : (
              <button
                onClick={handleReorderEverything}
                className="flex-1 bg-primary text-on-primary font-label-lg text-label-lg uppercase py-md px-lg rounded-full active:scale-[0.98] transition-all hover:opacity-90"
              >
                Reorder Items
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="flex-1 border-2 border-on-surface text-on-surface font-label-lg text-label-lg uppercase py-md px-lg rounded-full active:scale-[0.98] transition-all hover:bg-surface-variant"
            >
              Download Receipt
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
