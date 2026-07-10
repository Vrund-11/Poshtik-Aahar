'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSessionStore } from '../../../stores/sessionStore';
import { useSessionOrders } from '../../../hooks/useSessionOrders';
import { useTableStream } from '../../../hooks/useTableStream';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedModifiers?: Array<{ name: string; price: number }>;
}

interface Order {
  id: string;
  status: string;
  items: OrderItem[];
}

export default function DineInBillPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { activeSession, refreshSession, claimPayment } = useSessionStore();
  const { data: orders = [], isLoading: loading } = useSessionOrders(activeSession?.id || null);

  const [error, setError] = useState('');
  const [paymentState, setPaymentState] = useState<'idle' | 'verifying' | 'notified'>('idle');
  const [sseConnected, setSseConnected] = useState(false);

  // Subscribe to SSE stream for live updates (no polling)
  useTableStream(activeSession?.id || null, setSseConnected);

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

  // Handle redirect if session is completed/closed
  useEffect(() => {
    if (activeSession?.status === 'CLOSED') {
      router.push(`/dine-in/${sessionId}/success`);
    }
  }, [activeSession?.status, sessionId, router]);

  const handleIvePaid = async () => {
    setPaymentState('verifying');
    setError('');
    
    // Simulate verification delay matching template
    setTimeout(async () => {
      try {
        await claimPayment('UPI');
        setPaymentState('notified');
      } catch (err: any) {
        setError(err.message || 'Failed to notify payment. Please try again.');
        setPaymentState('idle');
      }
    }, 1500);
  };

  if (!activeSession) {
    return null;
  }

  // Calculate totals from orders
  const activeOrders = (orders as Order[]).filter((o: Order) => o.status !== 'CANCELLED');
  const allOrderedItems = activeOrders.reduce<OrderItem[]>((acc: OrderItem[], order: Order) => {
    return [...acc, ...order.items];
  }, []);

  // Group items by name to show a clean consolidated bill list
  const consolidatedItems: Record<string, { quantity: number; totalPrice: number; unitPrice: number; modifiers?: string }> = {};
  allOrderedItems.forEach((item: OrderItem) => {
    const modsStr = item.selectedModifiers && item.selectedModifiers.length > 0 
      ? item.selectedModifiers.map((m: any) => m.name).join(', ')
      : '';
    const key = item.name + (modsStr ? ` (${modsStr})` : '');
    
    if (consolidatedItems[key]) {
      consolidatedItems[key].quantity += item.quantity;
      consolidatedItems[key].totalPrice += Number(item.totalPrice);
    } else {
      consolidatedItems[key] = {
        quantity: item.quantity,
        totalPrice: Number(item.totalPrice),
        unitPrice: Number(item.unitPrice),
        modifiers: modsStr,
      };
    }
  });

  const subtotal = Object.values(consolidatedItems).reduce((sum: number, item: any) => sum + item.totalPrice, 0);
  const gstPercent = 5.0; // Standard GST
  const tax = Math.round((subtotal * gstPercent) / 100 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  // If session is complete, redirect to success rating page
  if (activeSession.status === 'COMPLETED' || activeSession.status === 'PAID') {
    router.push(`/dine-in/${sessionId}/success?totalPaid=${total}`);
  }

  return (
    <div className="font-hanken text-on-surface bg-background min-h-screen pb-32">
      
      {/* MOBILE VIEW */}
      <div className="block md:hidden min-h-screen bg-background flex flex-col relative">
        <header className="bg-surface sticky top-0 w-full z-50 flex justify-between items-center px-gutter h-20 shadow-sm">
          <div className="flex items-center gap-base">
            <span onClick={() => router.push(`/dine-in/${sessionId}/tracking`)} className="material-symbols-outlined text-primary p-2 cursor-pointer active:scale-95">arrow_back</span>
            <h1 className="font-display-md text-headline-lg-mobile text-primary uppercase tracking-tight">foodmood</h1>
          </div>
          <div className="bg-primary text-on-primary font-headline-sm px-4 py-1.5 rounded-full text-xs shadow-sm uppercase">
            TABLE {activeSession?.tableNumber}
          </div>
        </header>

        <main className="px-gutter py-lg space-y-md">
          <div className="text-center pt-2">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary leading-tight">Billing & Payments</p>
            <h2 className="font-headline-sm text-lg font-black text-primary uppercase leading-tight mt-1">
              {activeSession.restaurantName}
            </h2>
          </div>

          {error && (
            <div className="bg-error/95 text-white text-xs p-4 rounded-xl font-bold text-center">
              {error}
            </div>
          )}

          {/* Consolidated list */}
          <section className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30 space-y-md shadow-sm">
            <h3 className="font-headline-sm text-xs uppercase tracking-wider text-primary border-b border-outline-variant/20 pb-base">Consolidated Bill</h3>
            <div className="space-y-base">
              {Object.entries(consolidatedItems).map(([key, item]) => (
                <div key={key} className="flex justify-between items-start text-xs font-bold">
                  <div>
                    <p className="uppercase text-on-surface">{key}</p>
                    <p className="text-on-surface-variant text-[10px] uppercase">₹{item.unitPrice} x {item.quantity}</p>
                  </div>
                  <span className="text-primary font-headline-sm text-xs">₹{item.totalPrice}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-outline-variant/30 pt-md space-y-sm text-xs font-bold">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>GST (5%)</span>
                <span>₹{tax}</span>
              </div>
              <div className="flex justify-between text-primary text-sm font-headline-sm border-t border-dashed border-outline-variant/40 pt-sm">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
            </div>
          </section>

          {/* Payment interactive action widget */}
          <section className="bg-surface p-md rounded-xl border border-outline-variant/30 text-center space-y-md shadow-sm">
            <h4 className="font-headline-sm text-xs uppercase tracking-wider text-primary">UPI / CASH Payment</h4>
            <p className="text-on-surface-variant text-xs leading-normal">
              Click the button below after making the payment at the counter or scan the QR. We will notify the manager to verify.
            </p>

            {paymentState === 'idle' && (
              <button 
                onClick={handleIvePaid}
                className="w-full bg-primary text-on-primary py-4 rounded-full font-headline-sm uppercase active:scale-95 shadow-md flex justify-center items-center gap-sm border-none"
              >
                I've Paid
                <span className="material-symbols-outlined">done</span>
              </button>
            )}

            {paymentState === 'verifying' && (
              <div className="py-4 font-bold text-xs text-primary flex items-center justify-center gap-2">
                <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                <span>Notifying manager...</span>
              </div>
            )}

            {paymentState === 'notified' && (
              <div className="bg-green-600/10 border border-green-600 p-4 rounded-xl text-green-600 font-bold text-xs">
                <span className="block font-headline-sm text-sm uppercase mb-xs">Notification Sent!</span>
                Waiting for manager to confirm payment at Table {activeSession.tableNumber}.
              </div>
            )}
          </section>
        </main>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block min-h-screen bg-surface relative">
        <header className="bg-surface fixed top-0 w-full z-50 flex justify-between items-center px-margin h-20 shadow-sm">
          <div className="flex items-center gap-8">
            <span onClick={() => router.push('/')} className="font-display-md text-display-md text-primary cursor-pointer">foodmood OS</span>
            <nav className="hidden md:flex gap-6 items-center">
              <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-lg text-label-lg" href={`/dine-in/${sessionId}/menu`}>Menu</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-lg text-label-lg" href={`/dine-in/${sessionId}/tracking`}>Order Tracking</Link>
              <span className="text-primary border-b-2 border-primary font-bold py-1 font-label-lg text-label-lg">Pay Bill</span>
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
            <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Bill Summary details</h3>
            
            <div className="bg-surface-container-low p-lg rounded-xl border border-outline-variant/30 space-y-md">
              <div className="border-b border-outline-variant/20 pb-sm flex justify-between font-bold text-xs uppercase text-on-surface-variant">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="space-y-md">
                {Object.entries(consolidatedItems).map(([key, item]) => (
                  <div key={key} className="flex justify-between items-center text-sm font-bold">
                    <div>
                      <p className="text-on-surface uppercase">{key}</p>
                      <p className="text-on-surface-variant text-xs uppercase">₹{item.unitPrice} x {item.quantity}</p>
                    </div>
                    <span className="text-primary font-headline-sm">₹{item.totalPrice}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="col-span-4 space-y-md h-fit sticky top-24">
            <div className="bg-surface-container-high p-lg rounded-xl border border-outline-variant/30 space-y-lg">
              <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Payment Summary</h3>
              
              <div className="space-y-sm text-xs font-bold text-on-surface-variant uppercase">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{tax}</span>
                </div>
              </div>

              <div className="border-t border-outline-variant/30 pt-md flex justify-between items-center">
                <span className="font-bold text-xs uppercase text-on-surface-variant">Final Total</span>
                <span className="font-headline-sm text-2xl text-primary">₹{total}</span>
              </div>

              {paymentState === 'idle' && (
                <button 
                  onClick={handleIvePaid}
                  className="w-full bg-primary text-on-primary py-4 rounded-full font-headline-sm uppercase active:scale-95 shadow-md flex justify-center items-center gap-sm border-none"
                >
                  I've Paid
                  <span className="material-symbols-outlined">done</span>
                </button>
              )}

              {paymentState === 'verifying' && (
                <div className="py-4 font-bold text-xs text-primary flex items-center justify-center gap-2">
                  <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                  <span>Sending request...</span>
                </div>
              )}

              {paymentState === 'notified' && (
                <div className="bg-green-600/10 border border-green-600 p-4 rounded-xl text-green-600 font-bold text-xs text-center">
                  <span className="block font-headline-sm text-sm uppercase mb-xs">Notification Sent!</span>
                  Payment verification requested. The manager will complete the session.
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>

    </div>
  );
}
