'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@foodmart/shared';
import Link from 'next/link';

interface ReservationItem {
  id: string;
  status: string;
  partySize: number;
  date: string;
  timeSlot: string;
  notes?: string;
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read query params passed from reservation form
  const dateStr = searchParams.get('date') || 'Friday, Oct 24';
  const timeSlot = searchParams.get('time') || '19:00';
  const guests = searchParams.get('guests') || '2';
  const branchName = searchParams.get('branchName') || 'foodmood Kitchen';
  const restaurantName = searchParams.get('restaurantName') || 'foodmood';
  const fullName = searchParams.get('fullName') || 'Guest';
  const phone = searchParams.get('phone') || '';
  const notes = searchParams.get('notes') || 'None';
  const bookingRef = searchParams.get('ref') || '';

  const [dbStatus, setDbStatus] = useState<string>('PENDING');

  const pollReservationStatus = async () => {
    if (!bookingRef) return;
    try {
      const res: any = await api.get('/reservations/customer/my');
      if (res.success && res.data) {
        const found = res.data.find((item: ReservationItem) => item.id === bookingRef);
        if (found) {
          setDbStatus(found.status);
        }
      }
    } catch (err) {
      console.error('Failed to poll reservation status:', err);
    }
  };

  useEffect(() => {
    // Initial fetch
    pollReservationStatus();

    // Set up polling interval every 5 seconds
    const interval = setInterval(pollReservationStatus, 5000);
    return () => clearInterval(interval);
  }, [bookingRef]);

  return (
    <div className="font-hanken text-on-surface bg-background min-h-screen pb-32">
      
      {/* MOBILE VIEW */}
      <div className="block md:hidden min-h-screen bg-background flex flex-col relative">
        <header className="bg-surface sticky top-0 w-full z-50 flex justify-between items-center px-gutter h-20 shadow-sm">
          <span className="font-display-md text-headline-lg-mobile text-primary uppercase tracking-tight">foodmood</span>
          <button 
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-variant transition-all border-none"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <main className="px-gutter py-lg space-y-md">
          {/* Status Header based on 3 states */}
          <div className="flex flex-col items-center justify-center text-center py-4">
            {dbStatus === 'CONFIRMED' ? (
              <>
                <div className="w-24 h-24 rounded-full bg-green-600/10 border-2 border-green-600 flex items-center justify-center mb-4 shadow-sm text-green-600">
                  <span className="material-symbols-outlined text-5xl">check_circle</span>
                </div>
                <h2 className="font-display-md text-2xl text-primary leading-none uppercase">Booking Confirmed!</h2>
                <div className="mt-md bg-green-600 text-white font-bold text-[10px] px-4 py-1.5 rounded-full uppercase tracking-wider">
                  ACCEPTED BY KITCHEN
                </div>
              </>
            ) : dbStatus === 'PENDING' ? (
              <>
                <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center mb-4 shadow-sm text-amber-500 animate-pulse">
                  <span className="material-symbols-outlined text-5xl">hourglass_empty</span>
                </div>
                <h2 className="font-display-md text-2xl text-primary leading-none uppercase">Request Sent!</h2>
                <div className="mt-md bg-amber-500 text-white font-bold text-[10px] px-4 py-1.5 rounded-full uppercase tracking-wider">
                  PENDING CALLBACK VERIFICATION
                </div>
              </>
            ) : (
              <>
                <div className="w-24 h-24 rounded-full bg-red-600/10 border-2 border-red-600 flex items-center justify-center mb-4 shadow-sm text-red-600">
                  <span className="material-symbols-outlined text-5xl">cancel</span>
                </div>
                <h2 className="font-display-md text-2xl text-primary leading-none uppercase">Booking Cancelled</h2>
                <div className="mt-md bg-red-600 text-white font-bold text-[10px] px-4 py-1.5 rounded-full uppercase tracking-wider">
                  DECLINED OR CANCELLED
                </div>
              </>
            )}
          </div>

          {/* Description Callout */}
          <div className="bg-surface-container p-md rounded-xl border border-outline-variant/30 text-center text-xs font-bold text-on-surface-variant">
            {dbStatus === 'CONFIRMED' ? (
              <p className="leading-normal">
                Awesome! Your table reservation is confirmed. We look forward to hosting you.
              </p>
            ) : dbStatus === 'PENDING' ? (
              <p className="leading-normal">
                Your request has been sent successfully. The restaurant manager will manually review the slot and call you at <span className="text-primary">{phone || 'your phone number'}</span> shortly to verify.
              </p>
            ) : (
              <p className="leading-normal">
                This table booking request was cancelled. Please select another timing or restaurant branch.
              </p>
            )}
          </div>

          {/* Details list card */}
          <section className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30 space-y-md shadow-sm">
            <h3 className="font-headline-sm text-xs uppercase tracking-wider text-primary border-b border-outline-variant/20 pb-base">
              Details — {bookingRef}
            </h3>
            <div className="space-y-sm text-xs font-bold text-on-surface">
              <div className="flex justify-between items-center">
                <span className="opacity-60 uppercase text-[10px]">Location</span>
                <span>{branchName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-60 uppercase text-[10px]">Date</span>
                <span>{dateStr}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-60 uppercase text-[10px]">Time Slot</span>
                <span>{timeSlot}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-60 uppercase text-[10px]">Guests</span>
                <span>{guests} People</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-60 uppercase text-[10px]">Name</span>
                <span>{fullName}</span>
              </div>
              {notes && notes !== 'None' && (
                <div className="flex justify-between items-start pt-sm border-t border-outline-variant/25">
                  <span className="opacity-60 uppercase text-[10px]">Notes</span>
                  <span className="italic max-w-[200px] text-right truncate">{notes}</span>
                </div>
              )}
            </div>
          </section>

          <button 
            onClick={() => router.push('/')}
            className="w-full bg-primary text-on-primary py-4 rounded-full font-headline-sm text-xs uppercase active:scale-95 transition-all border-none"
          >
            Back to Discovery
          </button>
        </main>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block min-h-screen bg-surface relative">
        <header className="bg-surface fixed top-0 w-full z-50 flex justify-between items-center px-margin h-20 shadow-sm">
          <div className="font-display-md text-display-md text-primary">foodmood OS</div>
          <button 
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-variant transition-all border-none"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <main className="max-w-xl mx-auto pt-28 pb-12 px-margin text-center space-y-lg">
          <div className="bg-surface-container-low p-lg rounded-xl shadow-md border border-outline-variant/30 space-y-md">
            <div className="flex flex-col items-center">
              {dbStatus === 'CONFIRMED' ? (
                <>
                  <div className="w-20 h-20 bg-green-600/10 border-2 border-green-600 rounded-full flex items-center justify-center mb-md shadow-sm text-green-600">
                    <span className="material-symbols-outlined text-5xl">check_circle</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase">Booking Confirmed</h1>
                  <p className="text-on-surface-variant text-sm font-bold mt-xs">Your table booking at {branchName} is verified.</p>
                </>
              ) : dbStatus === 'PENDING' ? (
                <>
                  <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500 rounded-full flex items-center justify-center mb-md shadow-sm text-amber-500 animate-pulse">
                    <span className="material-symbols-outlined text-5xl">hourglass_empty</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase">Request Submitted</h1>
                  <p className="text-on-surface-variant text-sm font-bold mt-xs">Awaiting manual call confirmation from staff.</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-600/10 border-2 border-red-600 rounded-full flex items-center justify-center mb-md shadow-sm text-red-600">
                    <span className="material-symbols-outlined text-5xl">cancel</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase">Request Declined</h1>
                  <p className="text-on-surface-variant text-sm font-bold mt-xs">This request has been cancelled or declined.</p>
                </>
              )}
            </div>

            <div className="bg-primary text-on-primary p-lg rounded-xl shadow-sm text-center">
              <p className="text-xs text-on-primary/75 uppercase tracking-wider mb-1 font-bold">Table for</p>
              <p className="font-headline-sm text-4xl">{guests} Guests</p>
            </div>

            <div className="grid grid-cols-2 gap-md text-left text-xs font-bold uppercase">
              <div className="bg-surface-bright p-md rounded-xl border border-outline-variant/30 shadow-sm">
                <p className="text-[10px] text-on-surface-variant mb-2">Reserved Time</p>
                <p className="font-headline-sm text-lg text-primary">{timeSlot}</p>
              </div>
              <div className="bg-surface-bright p-md rounded-xl border border-outline-variant/30 shadow-sm">
                <p className="text-[10px] text-on-surface-variant mb-2">Reserved Date</p>
                <p className="font-headline-sm text-lg text-primary">{dateStr}</p>
              </div>
            </div>

            {/* Stage descriptive text */}
            <div className="bg-surface-container p-4 rounded-xl text-center border border-outline-variant/30 text-xs font-bold text-on-surface-variant">
              {dbStatus === 'CONFIRMED' ? (
                <p>Enjoy your dinner at {branchName}. Remember to check in 10 minutes prior.</p>
              ) : dbStatus === 'PENDING' ? (
                <p>The manager will review table layouts and manually confirm your slot. You will receive a verification call shortly at {phone}.</p>
              ) : (
                <p>This table reservation is currently closed. If you require support, please contact restaurant concierge.</p>
              )}
            </div>

            <button 
              onClick={() => router.push('/')}
              className="w-full bg-primary text-on-primary py-3 rounded-full font-headline-sm uppercase active:scale-95 transition-all border-none"
            >
              Go Back Home
            </button>
          </div>
        </main>
      </div>

    </div>
  );
}

export default function ReservationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto p-6 space-y-6 animate-pulse text-center pt-24 bg-background min-h-screen">
        <div className="h-20 w-20 rounded-full bg-surface-container mx-auto" />
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
