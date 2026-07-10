'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useLoyalty } from '../hooks/useLoyalty';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Transaction {
  id: string;
  points: number;
  type: string; // 'EARNED' | 'REDEEMED'
  description: string;
  createdAt: string;
}

export default function LoyaltyPage() {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const router = useRouter();

  const { data: loyaltyData, isLoading: queryLoading } = useLoyalty(user?.userId || null);
  const points = loyaltyData?.balance || 0;
  const transactions = (loyaltyData?.transactions || []) as Transaction[];
  const loading = queryLoading;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading || (!user && loading)) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6 animate-pulse text-center pt-24 bg-background min-h-screen">
        <div className="h-12 w-1/3 bg-surface-container mx-auto rounded-full" />
        <div className="h-48 bg-surface-container rounded-3xl" />
      </div>
    );
  }

  // Next reward math
  const nextRewardTarget = 15000;
  const pointsToGo = nextRewardTarget - points > 0 ? nextRewardTarget - points : 100;
  const progressPercent = Math.min(Math.round((points / nextRewardTarget) * 100), 100);

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

        <main className="max-w-xl mx-auto px-gutter py-lg pb-32">
          {/* Rewards Hero Section */}
          <section className="mb-lg">
            <div className="bg-primary-container text-on-primary-container p-md rounded-xl shadow-[0_8px_30px_rgb(176,47,0,0.12)] relative overflow-hidden active:scale-[0.98] transition-all duration-200">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <p className="font-label-lg text-label-lg uppercase mb-xs opacity-90">Current Balance</p>
                <div className="flex items-baseline gap-xs">
                  <span className="font-display-lg text-display-lg">{points.toLocaleString()}</span>
                  <span className="font-headline-sm text-headline-sm uppercase ml-1">POINTS</span>
                </div>
                <div className="mt-lg">
                  <div className="flex justify-between items-end mb-sm">
                    <span className="font-label-lg text-label-lg uppercase">Next Reward: Free Miso Cake</span>
                    <span className="font-label-sm text-label-sm">{pointsToGo} TO GO</span>
                  </div>
                  <div className="h-4 bg-on-primary-container/20 rounded-full w-full overflow-hidden">
                    <div className="h-full bg-on-primary-container rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Perks Bento Grid */}
          <section className="mb-lg">
            <h2 className="font-headline-lg text-headline-lg uppercase mb-md tracking-tight">Active Perks</h2>
            <div className="grid grid-cols-2 gap-md">
              <div className="bg-surface-container-high p-md rounded-xl flex flex-col justify-between min-h-[160px] hover:bg-surface-container-highest transition-colors cursor-pointer group">
                <span className="material-symbols-outlined text-primary text-4xl group-hover:scale-110 transition-transform">local_fire_department</span>
                <div>
                  <p className="font-label-lg text-label-lg uppercase">2x Points</p>
                  <p className="text-on-surface-variant text-label-sm">Happy Hour Drinks</p>
                </div>
              </div>
              <div className="bg-surface-container-high p-md rounded-xl flex flex-col justify-between min-h-[160px] hover:bg-surface-container-highest transition-colors cursor-pointer group">
                <span className="material-symbols-outlined text-primary text-4xl group-hover:scale-110 transition-transform">delivery_dining</span>
                <div>
                  <p className="font-label-lg text-label-lg uppercase">Free Delivery</p>
                  <p className="text-on-surface-variant text-label-sm">Orders over $50</p>
                </div>
              </div>
            </div>
          </section>

          {/* Transaction History */}
          <section>
            <div className="flex justify-between items-center mb-md">
              <h2 className="font-headline-lg text-headline-lg uppercase tracking-tight">Transaction History</h2>
              <button className="text-primary font-label-lg text-label-lg uppercase hover:opacity-70">View All</button>
            </div>
            <div className="space-y-md">
              {transactions.map((tx) => {
                const isEarned = tx.type === 'EARNED';
                return (
                  <div key={tx.id} className="bg-surface-container rounded-t-xl overflow-hidden active:scale-[0.99] transition-transform">
                    <div className="p-md flex justify-between items-center border-b-2 border-dashed border-on-surface/10">
                      <div className="flex items-center gap-md">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-surface flex items-center justify-center shrink-0 border border-outline-variant/10">
                          {isEarned ? (
                            <span className="material-symbols-outlined text-primary">add_circle</span>
                          ) : (
                            <span className="material-symbols-outlined text-secondary">redeem</span>
                          )}
                        </div>
                        <div>
                          <p className="font-label-lg text-label-lg uppercase truncate max-w-[150px]">{tx.description.split('-')[0]}</p>
                          <p className="text-on-surface-variant text-label-sm uppercase">{new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-headline-sm text-headline-sm ${isEarned ? 'text-primary' : 'text-secondary'}`}>
                          {isEarned ? `+${tx.points}` : `-${tx.points}`}
                        </p>
                        <p className="text-on-surface-variant text-label-sm uppercase">{isEarned ? 'Earned' : 'Spent'}</p>
                      </div>
                    </div>
                    {/* Jagged Bottom Jagged Metaphor */}
                    <div className="h-2 w-full bg-surface-container" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 95%, 98% 93%, 96% 95%, 94% 93%, 92% 95%, 90% 93%, 88% 95%, 86% 93%, 84% 95%, 82% 93%, 80% 95%, 78% 93%, 76% 95%, 74% 93%, 72% 95%, 70% 93%, 68% 95%, 66% 93%, 64% 95%, 62% 93%, 60% 95%, 58% 93%, 56% 95%, 54% 93%, 52% 95%, 50% 93%, 48% 95%, 46% 93%, 44% 95%, 42% 93%, 40% 95%, 38% 93%, 36% 95%, 34% 93%, 32% 95%, 30% 93%, 28% 95%, 26% 93%, 24% 95%, 22% 93%, 0% 95%)' }}></div>
                  </div>
                );
              })}
            </div>
          </section>
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
          <Link href="/orders" className="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim px-sm py-xs hover:text-primary transition-all duration-200">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-label-sm text-label-sm mt-xs">Orders</span>
          </Link>
          <Link href="/loyalty" className="flex flex-col items-center justify-center bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary rounded-full px-sm py-xs active:scale-90 transition-all duration-200">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>wallet</span>
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
                <Link className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-lg text-label-lg" href="/orders">Orders</Link>
                <Link className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-lg text-label-lg" href="/orders">Reservations</Link>
                <Link className="text-primary font-bold border-b-2 border-primary pb-1 font-label-lg text-label-lg" href="/loyalty">Loyalty</Link>
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

        <main className="max-w-screen-2xl mx-auto pt-28 pb-12 px-margin grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Dashboard Left Column */}
          <div className="lg:col-span-4 space-y-gutter">
            <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase mb-md">Loyalty Wallet</h1>
            
            {/* Points ticket summary card */}
            <div className="bg-surface-container p-lg flex flex-col gap-sm relative overflow-hidden group shadow-md" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 95%, 98% 100%, 96% 95%, 94% 100%, 92% 95%, 90% 100%, 88% 95%, 86% 100%, 84% 95%, 82% 100%, 80% 95%, 78% 100%, 76% 95%, 74% 100%, 72% 95%, 70% 100%, 68% 95%, 66% 100%, 64% 95%, 62% 100%, 60% 95%, 58% 100%, 56% 95%, 54% 100%, 52% 95%, 50% 100%, 48% 95%, 46% 100%, 44% 95%, 42% 100%, 40% 95%, 38% 100%, 36% 95%, 34% 100%, 32% 95%, 30% 100%, 28% 95%, 26% 100%, 24% 95%, 22% 100%, 20% 95%, 18% 100%, 16% 95%, 14% 100%, 12% 95%, 10% 100%, 8% 95%, 6% 100%, 4% 95%, 2% 100%, 0% 95%)' }}>
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <p className="font-label-lg text-label-lg uppercase tracking-widest text-secondary">Active Points Balance</p>
              
              <div className="flex items-baseline gap-xs">
                <span className="font-display-lg text-display-lg text-primary">{points.toLocaleString()}</span>
                <span className="font-headline-sm text-headline-sm text-on-surface-variant">PTS</span>
              </div>

              <div className="mt-base flex flex-col gap-xs border-t border-dashed border-outline-variant pt-base pb-6">
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-body-md text-on-surface-variant">Lifetime Earned</span>
                  <span className="font-label-lg text-label-lg text-on-surface">{(points + 33350).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-body-md text-on-surface-variant">Total Redeemed</span>
                  <span className="font-label-lg text-label-lg text-on-surface">33,350</span>
                </div>
              </div>

              <button className="mt-md bg-primary text-on-primary rounded-full px-md py-4 font-label-lg text-label-lg uppercase hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-sm">
                <span className="material-symbols-outlined">qr_code_scanner</span>
                Scan at POS
              </button>
            </div>

            {/* Tier status card */}
            <div className="bg-surface-container-high rounded-xl p-md flex flex-col gap-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-label-lg text-label-lg uppercase text-secondary">Current Status</p>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">foodmood Gold</h2>
                </div>
                <div className="bg-primary text-on-primary px-sm py-xs rounded-full font-label-sm text-label-sm uppercase">Elite</div>
              </div>
              <div className="w-full bg-surface-dim rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Earn <strong>2,550</strong> more points to reach <strong>foodmood Diamond</strong> status.
              </p>
            </div>
          </div>

          {/* Dashboard Right Column */}
          <div className="lg:col-span-8 space-y-gutter">
            {/* Redeemable Rewards */}
            <section>
              <div className="flex justify-between items-center mb-md">
                <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface">Redeemable Rewards</h2>
                <button className="text-primary font-bold hover:underline font-label-lg text-label-lg transition-all">View All</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {/* Reward Card 1 */}
                <div className="group bg-surface-container-low rounded-xl p-sm flex gap-md hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-outline-variant/10">
                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Burger" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhNZemJ5HVFTOFHkKXeGHHwSzyHRrVXnddOtlUgrj9Bdo0yG0Py1nut3MClERPsSFJV9YWutplTshInHaxdJGl8wFp6fK12WoX5Oe-D9uQeJTtdxjA5sX7-91v3OibVDqjIX-BnVKMkfE2vhdmNFsDbnHl4r0_4SMPZx-9xzByeX3cgrmf-rdPW3M-aCUPqJh3NmFn5GICKaA-kCLV1XL7otTO5vYNyKX7CmDR_X5aUZo5R6to7fYwn15x5peACWjq35aAig0Ljy8" />
                  </div>
                  <div className="flex flex-col justify-between py-xs">
                    <div>
                      <h3 className="font-label-lg text-label-lg text-on-surface font-bold">Signature foodmood Burger</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">2,500 PTS</p>
                    </div>
                    <button className="text-primary font-bold text-left font-label-sm text-label-sm uppercase flex items-center gap-xs hover:underline">
                      Redeem <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* Reward Card 2 */}
                <div className="group bg-surface-container-low rounded-xl p-sm flex gap-md hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-outline-variant/10">
                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Iced latte" src="https://lh3.googleusercontent.com/aida-public/AB6AXu83mGTa3fvup8nnqlraRBZ84k_Ed10U1idWXNoM4iJV_s8Un7jVpKYT97PP0J8zG9gvdvyKlJl64lZey0CwhQ8vCyi0Cc51nF5AXT-OqV5TJADd9eaR4S13xwC0xLjb0ENztUdyvEcQg-l3JnknAFfZYtub7X3WpwOrCWLAa8Q7fPWcv9ev8TfZwHmaxi1ekgcUfWdByuWyJgkO60FSbFEf1hWqwRHSy5ovcdwrlO3wL2btDhKHP8ONt-pNYLcwMbqUj8EeEYZz0k" />
                  </div>
                  <div className="flex flex-col justify-between py-xs">
                    <div>
                      <h3 className="font-label-lg text-label-lg text-on-surface font-bold">Any Large Specialty Coffee</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">850 PTS</p>
                    </div>
                    <button className="text-primary font-bold text-left font-label-sm text-label-sm uppercase flex items-center gap-xs hover:underline">
                      Redeem <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Activity Log */}
            <section className="bg-surface-container-low rounded-xl overflow-hidden shadow-sm">
              <div className="px-md py-md border-b border-surface-variant flex justify-between items-center">
                <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface">Activity Log</h2>
                <div className="flex gap-sm">
                  <button className="bg-surface-variant/30 p-xs rounded-full hover:bg-surface-variant transition-colors"><span className="material-symbols-outlined text-secondary">filter_list</span></button>
                  <button className="bg-surface-variant/30 p-xs rounded-full hover:bg-surface-variant transition-colors"><span className="material-symbols-outlined text-secondary">download</span></button>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-dim">
                    <tr>
                      <th className="px-md py-sm font-label-lg text-label-lg uppercase text-secondary">Date</th>
                      <th className="px-md py-sm font-label-lg text-label-lg uppercase text-secondary">Description</th>
                      <th className="px-md py-sm font-label-lg text-label-lg uppercase text-secondary text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant/50">
                    {transactions.map((tx) => {
                      const isEarned = tx.type === 'EARNED';
                      return (
                        <tr key={tx.id} className="hover:bg-surface-variant/20 transition-colors">
                          <td className="px-md py-md font-body-md text-body-md text-on-surface">
                            {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-md py-md">
                            <div className="flex flex-col">
                              <span className="font-label-lg text-label-lg font-bold">{tx.description}</span>
                            </div>
                          </td>
                          <td className={`px-md py-md text-right font-bold ${isEarned ? 'text-accent-green' : 'text-accent-red'}`}>
                            {isEarned ? `+${tx.points}` : `-${tx.points}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full flex flex-col items-center justify-center gap-md px-margin text-center py-lg bg-surface-dim border-t border-surface-container-highest/20 mt-16">
          <h2 className="font-display-lg text-display-lg text-primary uppercase">foodmood OS</h2>
          <div className="flex flex-wrap justify-center gap-md mb-md">
            <span className="text-on-surface-variant font-label-sm">© 2026 foodmood. All rights reserved.</span>
          </div>
        </footer>
      </div>

    </div>
  );
}
