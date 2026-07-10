'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSessionStore } from '../../../stores/sessionStore';
import { useCartStore, selectCartTotal } from '../../../stores/cartStore';
import { usePlaceOrder } from '../../../hooks/usePlaceOrder';
import Link from 'next/link';

export default function DineInCartPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { activeSession, refreshSession } = useSessionStore();
  const { items: cartItems, updateQuantity, clearCart } = useCartStore();
  const cartTotal = useCartStore(selectCartTotal);
  
  const [error, setError] = useState('');
  const [cookingNotes, setCookingNotes] = useState('');

  const placeOrderMutation = usePlaceOrder(activeSession?.id || null);

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

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || !activeSession) return;
    setError('');

    const payload = {
      sessionId: activeSession.id,
      items: cartItems.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        notes: item.notes || '',
        selectedModifiers: item.selectedModifiers,
      })),
      notes: cookingNotes,
    };

    placeOrderMutation.mutate(payload, {
      onSuccess: () => {
        router.push(`/dine-in/${sessionId}/tracking`);
      },
      onError: (err: any) => {
        setError(err.message || 'Failed to place order. Please try again.');
      },
    });
  };

  if (!activeSession) {
    return null;
  }

  const submitting = placeOrderMutation.isPending;

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="font-hanken text-on-surface bg-background min-h-screen pb-32">
      
      {/* MOBILE VIEW */}
      <div className="block md:hidden min-h-screen bg-background flex flex-col relative">
        <header className="bg-surface sticky top-0 w-full z-50 flex justify-between items-center px-gutter h-20 shadow-sm">
          <div className="flex items-center gap-base">
            <span onClick={() => router.push(`/dine-in/${sessionId}/menu`)} className="material-symbols-outlined text-primary p-2 active:scale-95 cursor-pointer">arrow_back</span>
            <h1 className="font-display-md text-headline-lg-mobile text-primary uppercase tracking-tight">Your Cart</h1>
          </div>
          <div className="bg-primary text-on-primary font-headline-sm px-4 py-1 rounded-full text-xs shadow-sm uppercase">
            TABLE {activeSession?.tableNumber}
          </div>
        </header>

        <main className="px-gutter py-lg space-y-md">
          {/* Context Banner */}
          <section className="bg-surface-container-high p-md rounded-xl shadow-sm border border-outline-variant/20 flex items-center gap-md">
            <span className="material-symbols-outlined text-primary text-3xl">restaurant</span>
            <div>
              <h2 className="font-headline-sm text-sm uppercase text-on-surface leading-tight">
                {activeSession.restaurantName}
              </h2>
              <p className="text-on-surface-variant text-xs mt-0.5">
                Dine-In order verification session active
              </p>
            </div>
          </section>

          {error && (
            <div className="bg-error/10 border border-error text-error text-xs p-4 rounded-xl font-bold">
              {error}
            </div>
          )}

          {/* Cart list */}
          <section className="space-y-sm">
            <h3 className="font-headline-sm text-sm uppercase tracking-wider text-primary">Items ({totalItemsCount})</h3>

            {cartItems.length === 0 ? (
              <div className="text-center py-10 bg-surface-container p-6 rounded-xl space-y-md border border-outline-variant/30">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">shopping_basket</span>
                <p className="text-on-surface-variant font-bold text-sm">Your basket is currently empty</p>
                <Link href={`/dine-in/${sessionId}/menu`} className="inline-block px-6 py-2 bg-primary text-on-primary rounded-full uppercase font-headline-sm text-xs">
                  Browse Menu
                </Link>
              </div>
            ) : (
              <div className="space-y-sm">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-surface-container-low p-md rounded-xl border border-outline-variant/35 shadow-sm flex items-center gap-md">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-outline-variant/30 flex-shrink-0">
                      <img className="w-full h-full object-cover" src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'} alt={item.name} />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-headline-sm text-sm uppercase truncate">{item.name}</h4>
                      {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                        <p className="text-[10px] text-on-surface-variant uppercase mt-xs tracking-wider">
                          {item.selectedModifiers.map(m => m.name).join(', ')}
                        </p>
                      )}
                      <p className="text-primary font-headline-sm text-xs mt-xs">₹{item.price * item.quantity}</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-sm bg-surface-container-high px-3 py-1.5 rounded-full">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-primary active:scale-95"
                      >
                        -
                      </button>
                      <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-primary active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}

                {/* Special Instructions */}
                <div className="bg-surface-container p-md rounded-xl space-y-base border border-outline-variant/30">
                  <h4 className="font-headline-sm text-xs uppercase tracking-wider text-primary">Instructions for the Chef</h4>
                  <textarea
                    placeholder="E.g. No dairy, make it mild, etc."
                    value={cookingNotes}
                    onChange={(e) => setCookingNotes(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant p-3 rounded-lg font-body-md text-xs outline-none focus:border-primary text-on-surface"
                  />
                </div>

                {/* Submit Panel */}
                <div className="bg-surface-container-high p-md rounded-xl space-y-md border border-outline-variant/30">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs uppercase text-on-surface-variant">Basket Total</span>
                    <span className="font-headline-sm text-lg text-primary">₹{cartTotal}</span>
                  </div>
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                    className="w-full bg-primary text-on-primary py-4 rounded-full font-headline-sm uppercase active:scale-95 shadow-md flex justify-center items-center gap-sm border-none"
                  >
                    {submitting ? 'Placing Order...' : 'Send Order to Kitchen'}
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
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
              <span className="text-primary border-b-2 border-primary font-bold py-1 font-label-lg text-label-lg">Your Cart</span>
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
            <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Basket Items</h3>

            {cartItems.length === 0 ? (
              <div className="text-center py-20 bg-surface-container rounded-xl space-y-md border border-outline-variant/30">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">shopping_basket</span>
                <p className="text-on-surface-variant font-bold text-sm">Your basket is currently empty</p>
                <Link href={`/dine-in/${sessionId}/menu`} className="inline-block px-6 py-3 bg-primary text-on-primary rounded-full uppercase font-headline-sm text-xs">
                  Browse Menu
                </Link>
              </div>
            ) : (
              <div className="space-y-sm">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-surface-container p-md rounded-xl border border-outline-variant/35 shadow-sm flex items-center gap-md">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-white border border-outline-variant/30 flex-shrink-0">
                      <img className="w-full h-full object-cover" src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'} alt={item.name} />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-headline-sm text-lg uppercase truncate">{item.name}</h4>
                      {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                        <p className="text-xs text-on-surface-variant uppercase mt-xs">
                          {item.selectedModifiers.map(m => m.name).join(', ')}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-[10px] bg-primary/5 text-primary px-3 py-1 rounded-full w-fit mt-xs">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex items-center gap-lg">
                      <div className="font-headline-sm text-primary text-lg">₹{item.price * item.quantity}</div>
                      
                      {/* Quantity controls */}
                      <div className="flex items-center gap-sm bg-surface-container-high px-3 py-1.5 rounded-full">
                        <button 
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-primary active:scale-95"
                        >
                          -
                        </button>
                        <span className="font-headline-sm text-sm w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-primary active:scale-95"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="col-span-4 space-y-md h-fit sticky top-24">
            <div className="bg-surface-container-high p-lg rounded-xl border border-outline-variant/30 space-y-lg">
              <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Order Checkout</h3>
              
              {error && (
                <div className="bg-error-container text-on-error-container text-xs p-4 rounded-xl font-bold">
                  {error}
                </div>
              )}

              <div className="space-y-sm">
                <label className="text-xs text-on-surface-variant font-bold block uppercase tracking-wider">Instructions for Kitchen</label>
                <textarea
                  placeholder="e.g. Allergy details, make it mild, etc."
                  value={cookingNotes}
                  onChange={(e) => setCookingNotes(e.target.value)}
                  className="w-full bg-surface-bright border border-outline-variant p-4 rounded-xl font-body-md outline-none text-on-surface focus:border-primary"
                />
              </div>

              <div className="border-t border-outline-variant/30 pt-md flex justify-between items-center">
                <span className="font-bold text-xs uppercase text-on-surface-variant">Order Total</span>
                <span className="font-headline-sm text-2xl text-primary">₹{cartTotal}</span>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={submitting || cartItems.length === 0}
                className="w-full bg-primary text-on-primary py-4 rounded-full font-headline-sm uppercase active:scale-95 shadow-md flex justify-center items-center gap-sm border-none"
              >
                {submitting ? 'Placing Order...' : 'Send Order to Kitchen'}
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </aside>
        </main>
      </div>

    </div>
  );
}
