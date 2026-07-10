'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore, selectCartSubtotal, selectCartTax, selectCartTotal } from '../../../stores/cartStore';
import { api } from '@foodmart/shared';
import Link from 'next/link';

export default function TakeawayCartPage() {
  const { restaurantId } = useParams();
  const router = useRouter();
  const { items: cartItems, updateQuantity, clearCart } = useCartStore();
  const cartSubtotal = useCartStore(selectCartSubtotal);
  const cartTax = useCartStore(selectCartTax);
  const cartTotal = useCartStore(selectCartTotal);
  
  const [restaurantName, setRestaurantName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'ONLINE' | 'UPI' | 'COUNTER'>('ONLINE');
  const [showRazorpayLoader, setShowRazorpayLoader] = useState(false);
  const [error, setError] = useState('');
  const [takeawayNotes, setTakeawayNotes] = useState('');

  useEffect(() => {
    if (!restaurantId) return;

    // Fetch restaurant name
    api.get<any>(`/restaurants/${restaurantId}`)
      .then((res: any) => {
        if (res.success && res.data) {
          setRestaurantName(res.data.name);
        }
      })
      .catch(() => {});
  }, [restaurantId]);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || !restaurantId) return;
    
    setError('');
    
    // Simulate Razorpay Gateway redirect/popup for online payments
    if (paymentOption === 'ONLINE' || paymentOption === 'UPI') {
      setShowRazorpayLoader(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowRazorpayLoader(false);
    }

    setSubmitting(true);

    const payload = {
      restaurantId,
      items: cartItems.map((item: any) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        notes: item.notes || '',
        selectedModifiers: item.selectedModifiers,
      })),
      notes: takeawayNotes,
    };

    try {
      const res: any = await api.post('/takeaway', payload);
      if (res.success && res.data) {
        clearCart();
        // Redirect to success confirmation page
        router.push(`/takeaway/${restaurantId}/success?orderId=${res.data.id}&token=${res.data.tokenNumber}`);
      } else {
        setError(res.message || 'Failed to place takeaway order. Please try again.');
        setSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place takeaway order. Please check your connection.');
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="font-hanken text-on-surface bg-background min-h-screen flex flex-col justify-center items-center p-md">
        <span className="material-symbols-outlined text-primary text-6xl mb-md">shopping_basket</span>
        <h2 className="font-headline-sm text-lg uppercase tracking-tight text-on-surface mb-xs">Your basket is empty</h2>
        <p className="text-on-surface-variant text-xs text-center max-w-xs mb-lg leading-normal">
          Pick your favorite dishes from our takeaway menu and customize them.
        </p>
        <Link 
          href={`/takeaway/${restaurantId}/menu`}
          className="bg-primary text-on-primary px-8 py-3 rounded-full font-headline-sm uppercase tracking-wider text-xs border-none"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="font-hanken text-on-surface bg-background min-h-screen pb-32">
      
      {/* simulated Razorpay gateway popup */}
      {showRazorpayLoader && (
        <div className="fixed inset-0 bg-black/65 z-[100] flex items-center justify-center p-md">
          <div className="bg-white p-lg rounded-xl border border-outline w-full max-w-sm text-center space-y-md animate-sheet">
            <div className="flex justify-center">
              <span className="material-symbols-outlined text-primary text-5xl animate-bounce">payments</span>
            </div>
            <h3 className="font-headline-sm text-base uppercase text-primary">Razorpay Gateway</h3>
            <p className="text-on-surface-variant text-xs leading-normal">
              Connecting to secure payment portal. Do not close this window or refresh the page.
            </p>
            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-full rounded-full animate-[shimmer_1.5s_infinite] w-2/3"></div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE VIEW */}
      <div className="block md:hidden min-h-screen bg-background flex flex-col relative">
        <header className="bg-surface sticky top-0 w-full z-50 flex justify-between items-center px-gutter h-20 shadow-sm">
          <div className="flex items-center gap-base">
            <span onClick={() => router.push(`/takeaway/${restaurantId}/menu`)} className="material-symbols-outlined text-primary p-2 cursor-pointer active:scale-95">arrow_back</span>
            <div>
              <h1 className="font-display-md text-headline-lg-mobile text-primary uppercase tracking-tight">Basket</h1>
              <p className="text-on-surface-variant text-[9px] font-extrabold uppercase tracking-widest leading-none mt-0.5">{restaurantName}</p>
            </div>
          </div>
        </header>

        <main className="px-gutter py-lg space-y-md">
          {error && (
            <div className="bg-error/95 text-white text-xs p-4 rounded-xl font-bold text-center">
              {error}
            </div>
          )}

          {/* Basket list */}
          <section className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30 space-y-md shadow-sm">
            <h3 className="font-headline-sm text-xs uppercase tracking-wider text-primary border-b border-outline-variant/20 pb-base">Your Selections</h3>
            <div className="space-y-md divide-y divide-outline-variant/20">
              {cartItems.map((item: any) => (
                <div key={item.id} className="pt-md first:pt-0 flex gap-base items-center justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-headline-sm text-xs truncate uppercase text-on-surface">{item.name}</p>
                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest truncate mt-0.5">
                        {item.selectedModifiers.map((m: any) => m.name).join(', ')}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-[9px] text-primary/80 font-bold uppercase mt-1">Note: "{item.notes}"</p>
                    )}
                    <span className="font-headline-sm text-primary text-xs mt-1 block">₹{item.price * item.quantity}</span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-sm bg-white p-1 rounded-full border border-outline shrink-0">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-primary border border-outline active:scale-90"
                    >
                      -
                    </button>
                    <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-primary border border-outline active:scale-90"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Kitchen instructions */}
          <section className="space-y-sm">
            <h4 className="font-label-lg text-label-lg uppercase tracking-wider text-primary">Instructions (Optional)</h4>
            <textarea
              placeholder="e.g. Please pack sauces separately, no forks, etc."
              className="w-full bg-surface-container border border-outline-variant p-4 rounded-xl font-body-md text-xs outline-none text-on-surface focus:border-primary"
              value={takeawayNotes}
              onChange={(e) => setTakeawayNotes(e.target.value)}
            />
          </section>

          {/* Payment Method selector */}
          <section className="bg-surface p-md rounded-xl border border-outline-variant/30 space-y-md shadow-sm">
            <h3 className="font-headline-sm text-xs uppercase tracking-wider text-primary border-b border-outline-variant/20 pb-base">Choose Payment</h3>
            <div className="space-y-sm">
              <label 
                onClick={() => setPaymentOption('ONLINE')}
                className={`flex justify-between items-center p-4 rounded-xl border transition-all cursor-pointer ${
                  paymentOption === 'ONLINE' ? 'bg-primary/5 border-primary' : 'bg-surface-container border-transparent'
                }`}
              >
                <div>
                  <p className="font-headline-sm text-xs uppercase text-on-surface">Card / Net Banking</p>
                  <p className="text-[10px] text-on-surface-variant">Secure checkout via Razorpay</p>
                </div>
                <span className="material-symbols-outlined text-primary text-xl">credit_card</span>
              </label>

              <label 
                onClick={() => setPaymentOption('UPI')}
                className={`flex justify-between items-center p-4 rounded-xl border transition-all cursor-pointer ${
                  paymentOption === 'UPI' ? 'bg-primary/5 border-primary' : 'bg-surface-container border-transparent'
                }`}
              >
                <div>
                  <p className="font-headline-sm text-xs uppercase text-on-surface">UPI Pay (GooglePay, PhonePe)</p>
                  <p className="text-[10px] text-on-surface-variant">Instant mobile verification</p>
                </div>
                <span className="material-symbols-outlined text-primary text-xl">qr_code_2</span>
              </label>

              <label 
                onClick={() => setPaymentOption('COUNTER')}
                className={`flex justify-between items-center p-4 rounded-xl border transition-all cursor-pointer ${
                  paymentOption === 'COUNTER' ? 'bg-primary/5 border-primary' : 'bg-surface-container border-transparent'
                }`}
              >
                <div>
                  <p className="font-headline-sm text-xs uppercase text-on-surface">Pay at Counter</p>
                  <p className="text-[10px] text-on-surface-variant">Pay when collecting your box</p>
                </div>
                <span className="material-symbols-outlined text-primary text-xl">storefront</span>
              </label>
            </div>
          </section>

          {/* Receipt Panel */}
          <section className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30 space-y-sm text-xs font-bold shadow-sm">
            <div className="flex justify-between text-on-surface-variant">
              <span>Subtotal</span>
              <span>₹{cartSubtotal}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Estimated GST (5%)</span>
              <span>₹{cartTax}</span>
            </div>
            <div className="flex justify-between text-primary text-sm font-headline-sm border-t border-dashed border-outline-variant/40 pt-sm">
              <span>Total Amount</span>
              <span>₹{cartTotal}</span>
            </div>
          </section>
        </main>

        {/* Sticky footer actions */}
        <div className="fixed bottom-0 left-0 w-full z-50 px-6 py-4 bg-white border-t border-outline-variant/30 max-w-md mx-auto left-1/2 -translate-x-1/2 shadow-lg rounded-t-xl">
          <button 
            onClick={handlePlaceOrder}
            disabled={submitting}
            className="w-full bg-primary text-on-primary py-4 rounded-full font-headline-sm text-xs uppercase active:scale-95 transition-all flex items-center justify-center gap-2 hover:opacity-90 border-none"
          >
            <span className="material-symbols-outlined text-sm">shopping_bag</span>
            <span>{submitting ? 'Confirming Order...' : 'Place Takeaway Order'}</span>
          </button>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block min-h-screen bg-surface relative">
        <header className="bg-surface fixed top-0 w-full z-50 flex justify-between items-center px-margin h-20 shadow-sm">
          <div className="flex items-center gap-8">
            <span onClick={() => router.push('/')} className="font-display-md text-display-md text-primary cursor-pointer">foodmood OS</span>
            <nav className="hidden md:flex gap-6 items-center">
              <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-lg text-label-lg" href={`/takeaway/${restaurantId}/menu`}>Takeaway Menu</Link>
              <span className="text-primary border-b-2 border-primary font-bold py-1 font-label-lg text-label-lg">Review Cart</span>
            </nav>
          </div>
          <div className="flex items-center gap-sm">
            <div className="bg-primary text-on-primary font-headline-sm px-6 py-2 rounded-full uppercase">
              TAKEAWAY
            </div>
          </div>
        </header>

        <main className="max-w-screen-xl mx-auto pt-24 pb-12 px-margin grid grid-cols-12 gap-gutter">
          <div className="col-span-8 space-y-md">
            <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Basket items</h3>
            
            <div className="bg-surface-container-low p-lg rounded-xl border border-outline-variant/30 space-y-md">
              <div className="space-y-md divide-y divide-outline-variant/20">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="pt-md first:pt-0 flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="font-headline-sm text-sm uppercase truncate text-on-surface">{item.name}</h4>
                      {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                        <p className="text-xs text-on-surface-variant uppercase mt-xs">
                          {item.selectedModifiers.map((m: any) => m.name).join(', ')}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-primary font-bold mt-1">Note: "{item.notes}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-lg">
                      <div className="flex items-center gap-sm bg-white p-1 rounded-full border border-outline">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-primary border-none active:scale-95"
                        >
                          -
                        </button>
                        <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-primary border-none active:scale-95"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-headline-sm text-primary text-base min-w-[70px] text-right">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special notes */}
            <div className="space-y-sm">
              <h4 className="font-label-lg uppercase tracking-wider text-primary">Instructions Note</h4>
              <textarea
                placeholder="Type cooking or packing notes here..."
                className="w-full bg-surface-container border border-outline-variant p-4 rounded-xl font-body-md outline-none text-on-surface focus:border-primary"
                value={takeawayNotes}
                onChange={(e) => setTakeawayNotes(e.target.value)}
              />
            </div>
          </div>

          <aside className="col-span-4 space-y-md h-fit sticky top-24">
            {/* Payment Details Bento */}
            <div className="bg-surface-container-high p-lg rounded-xl border border-outline-variant/30 space-y-lg">
              <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Payment Options</h3>
              
              <div className="space-y-sm">
                <div 
                  onClick={() => setPaymentOption('ONLINE')}
                  className={`p-md rounded-xl border transition-all cursor-pointer ${
                    paymentOption === 'ONLINE' ? 'bg-primary/5 border-primary' : 'bg-surface-bright border-outline-variant/30'
                  }`}
                >
                  <p className="font-bold text-xs uppercase text-on-surface">Online Card payment</p>
                  <p className="text-[10px] text-on-surface-variant mt-xs">Powered by Razorpay Secure</p>
                </div>

                <div 
                  onClick={() => setPaymentOption('UPI')}
                  className={`p-md rounded-xl border transition-all cursor-pointer ${
                    paymentOption === 'UPI' ? 'bg-primary/5 border-primary' : 'bg-surface-bright border-outline-variant/30'
                  }`}
                >
                  <p className="font-bold text-xs uppercase text-on-surface">UPI Verification</p>
                  <p className="text-[10px] text-on-surface-variant mt-xs">Pay via PhonePe or GooglePay</p>
                </div>

                <div 
                  onClick={() => setPaymentOption('COUNTER')}
                  className={`p-md rounded-xl border transition-all cursor-pointer ${
                    paymentOption === 'COUNTER' ? 'bg-primary/5 border-primary' : 'bg-surface-bright border-outline-variant/30'
                  }`}
                >
                  <p className="font-bold text-xs uppercase text-on-surface">Cash at Counter</p>
                  <p className="text-[10px] text-on-surface-variant mt-xs">Complete checkout in-store</p>
                </div>
              </div>

              <div className="space-y-sm text-xs font-bold text-on-surface-variant uppercase border-t border-outline-variant/30 pt-md">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{cartTax}</span>
                </div>
              </div>

              <div className="border-t border-outline-variant/30 pt-md flex justify-between items-center">
                <span className="font-bold text-xs uppercase text-on-surface-variant">Amount Payable</span>
                <span className="font-headline-sm text-2xl text-primary">₹{cartTotal}</span>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full bg-primary text-on-primary py-4 rounded-full font-headline-sm uppercase active:scale-95 shadow-md flex justify-center items-center gap-sm border-none"
              >
                Place Takeaway Order
                <span className="material-symbols-outlined">shopping_bag</span>
              </button>
            </div>
          </aside>
        </main>
      </div>

    </div>
  );
}
