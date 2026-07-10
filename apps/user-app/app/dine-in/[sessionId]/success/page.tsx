'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSessionStore } from '../../../stores/sessionStore';

function SuccessContent() {
  const { sessionId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeSession, refreshSession, clearSession } = useSessionStore();

  const totalPaid = searchParams.get('totalPaid') || '0';
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (!activeSession) {
      refreshSession();
    }
  }, [activeSession]);

  const handleStarClick = (starNum: number) => {
    setRating(starNum);
  };

  const handleReviewSubmit = () => {
    setReviewSubmitted(true);
  };

  const handleCloseSession = () => {
    clearSession();
    router.push('/');
  };

  if (!activeSession) {
    return null;
  }

  return (
    <div className="font-hanken text-on-surface bg-background min-h-screen flex flex-col items-center w-full pb-32 relative">
      
      {/* MOBILE VIEW */}
      <div className="block md:hidden min-h-screen w-full flex flex-col relative pb-12">
        <header className="bg-surface sticky top-0 w-full z-50 flex justify-between items-center px-gutter h-20 shadow-sm">
          <span className="font-display-md text-headline-lg-mobile text-primary uppercase tracking-tight">foodmood</span>
          <button 
            onClick={handleCloseSession}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-variant transition-all border-none"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <main className="w-full max-w-md px-gutter flex-grow pb-10 space-y-lg mt-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-28 bg-primary/10 border-2 border-primary rounded-full flex items-center justify-center mb-6 shadow-sm">
              <span className="material-symbols-outlined text-primary text-6xl">check_circle</span>
            </div>
            <h1 className="font-headline-lg text-2xl uppercase tracking-tight mb-2">Payment Confirmed!</h1>
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Your table session is closed.</p>
          </div>

          {/* Details Bento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-primary text-on-primary p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-[10px] text-on-primary/75 uppercase tracking-wider mb-1">Total Paid</span>
              <span className="font-headline-lg text-4xl">₹{totalPaid}</span>
            </div>
            <div className="bg-surface-container p-4 rounded-xl flex flex-col justify-between shadow-sm border border-outline-variant/35">
              <span className="text-[9px] text-on-surface-variant uppercase tracking-wider mb-4">Loyalty Points</span>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-sm text-2xl text-primary">+120</span>
                  <span className="text-xs font-bold text-on-surface-variant">pts</span>
                </div>
                <p className="text-[9px] text-on-surface-variant mt-1 leading-tight">Gold Tier reached!</p>
              </div>
            </div>
            <div className="bg-surface-container p-4 rounded-xl flex flex-col justify-between shadow-sm border border-outline-variant/35">
              <span className="text-[9px] text-on-surface-variant uppercase tracking-wider mb-4">Dine-In Table</span>
              <div>
                <span className="font-headline-sm text-2xl text-primary">Table {activeSession.tableNumber}</span>
                <p className="text-[9px] text-on-surface-variant font-bold uppercase mt-1">Closed Session</p>
              </div>
            </div>
          </div>

          {/* Review stars section */}
          <section className="bg-surface p-6 rounded-xl border border-outline-variant/30 shadow-sm space-y-sm">
            <h2 className="font-headline-sm text-center uppercase mb-4">Rate your experience</h2>
            {reviewSubmitted ? (
              <div className="text-center py-6 text-green-600 font-bold text-sm flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
                <span>Thank you for sharing your feedback!</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((starNum) => {
                    const isFilled = rating >= starNum;
                    return (
                      <button 
                        key={starNum}
                        className="text-primary transition-all duration-200" 
                        onClick={() => handleStarClick(starNum)}
                        type="button"
                      >
                        <span 
                          className="material-symbols-outlined text-4xl select-none" 
                          style={{ 
                            fontVariationSettings: `'FILL' ${isFilled ? 1 : 0}, 'wght' 700`
                          }}
                        >
                          star
                        </span>
                      </button>
                    );
                  })}
                </div>
                <textarea 
                  placeholder="Tell us what you liked..." 
                  className="w-full bg-surface-container border border-outline-variant p-4 rounded-xl font-body-md text-xs outline-none text-on-surface focus:border-primary"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
                <button 
                  onClick={handleReviewSubmit}
                  disabled={rating === 0}
                  className="w-full bg-primary text-on-primary py-3 rounded-full font-headline-sm uppercase active:scale-95 transition-all border-none"
                >
                  Submit Review
                </button>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block min-h-screen w-full relative bg-surface">
        <header className="bg-surface fixed top-0 w-full z-50 flex justify-between items-center px-margin h-20 shadow-sm">
          <div className="font-display-md text-display-md text-primary">foodmood OS</div>
          <button 
            onClick={handleCloseSession}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-variant transition-all border-none"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <main className="max-w-xl mx-auto pt-28 pb-12 px-margin text-center space-y-lg">
          <div className="bg-surface-container-low p-lg rounded-xl shadow-md border border-outline-variant/30 space-y-md">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-primary/10 border-2 border-primary rounded-full flex items-center justify-center mb-md shadow-sm">
                <span className="material-symbols-outlined text-primary text-5xl">check_circle</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase">Payment Confirmed!</h1>
              <p className="text-on-surface-variant text-sm font-bold mt-xs">Your table session is closed.</p>
            </div>

            <div className="bg-primary text-on-primary p-lg rounded-xl shadow-sm text-center">
              <p className="text-xs text-on-primary/75 uppercase tracking-wider mb-1">Total Amount Paid</p>
              <p className="font-headline-sm text-4xl">₹{totalPaid}</p>
            </div>

            <div className="grid grid-cols-2 gap-md text-left">
              <div className="bg-surface-bright p-md rounded-xl border border-outline-variant/30 shadow-sm">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-2">Loyalty points earned</p>
                <p className="font-headline-sm text-lg text-primary">+120 pts</p>
              </div>
              <div className="bg-surface-bright p-md rounded-xl border border-outline-variant/30 shadow-sm">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-2">Closed table number</p>
                <p className="font-headline-sm text-lg text-primary">Table {activeSession.tableNumber}</p>
              </div>
            </div>

            <section className="bg-surface-bright p-md rounded-xl border border-outline-variant/30 shadow-sm space-y-sm text-center">
              <h2 className="font-headline-sm uppercase text-on-surface">Rate your dining experience</h2>
              {reviewSubmitted ? (
                <div className="text-center py-6 text-green-600 font-bold text-sm flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                  <span>Thank you for sharing your feedback!</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((starNum) => {
                      const isFilled = rating >= starNum;
                      return (
                        <button 
                          key={starNum}
                          className="text-primary transition-all duration-200" 
                          onClick={() => handleStarClick(starNum)}
                          type="button"
                        >
                          <span 
                            className="material-symbols-outlined text-4xl select-none" 
                            style={{ 
                              fontVariationSettings: `'FILL' ${isFilled ? 1 : 0}, 'wght' 700`
                            }}
                          >
                            star
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <textarea 
                    placeholder="Provide your feedback..." 
                    className="w-full bg-surface-container border border-outline-variant p-4 rounded-xl font-body-md text-xs outline-none text-on-surface focus:border-primary"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />
                  <button 
                    onClick={handleReviewSubmit}
                    disabled={rating === 0}
                    className="w-full bg-primary text-on-primary py-3 rounded-full font-headline-sm uppercase active:scale-95 transition-all border-none"
                  >
                    Submit Review
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading success details...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
