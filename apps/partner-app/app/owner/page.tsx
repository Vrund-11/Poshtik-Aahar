'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@foodmart/shared';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

interface AnalyticsData {
  todayOrderCount: number;
  todayRevenue: number;
  totalUniqueCustomers: number;
  topDishes: Array<{
    menuItemId: string;
    name: string;
    totalOrdered: number;
  }>;
  ordersByHour: number[];
}

interface Complaint {
  id: string;
  rawText: string;
  rating?: number;
  category?: string;
  urgency?: string;
  sentiment?: string;
  summary?: string;
  isResolved: boolean;
  createdAt: string;
}

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchOwnerDashboard = async () => {
      try {
        const res: any = await api.get('/api/v1/owner/analytics');
        if (res.success && res.data) {
          setData(res.data);
        }

        if (user.restaurantId) {
          const complaintsRes: any = await api.get(`/api/v1/complaints/restaurant/${user.restaurantId}?limit=3`);
          if (complaintsRes.success && complaintsRes.data) {
            setComplaints(complaintsRes.data.slice(0, 3));
          }
        }
      } catch (e) {
        console.error('Failed to load owner dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerDashboard();
  }, [user]);

  const avgOrderValue = data && data.todayOrderCount > 0
    ? Math.round((data.todayRevenue / data.todayOrderCount) * 100) / 100
    : 0;

  const maxHourlyOrders = data?.ordersByHour ? Math.max(...data.ordersByHour, 1) : 1;

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <>
      {/* ═══════════════════════════════ */}
      {/* MOBILE VIEW                     */}
      {/* ═══════════════════════════════ */}
      <div className="md:hidden space-y-md">
        {/* Welcome Section */}
        <section className="mt-sm">
          <p className="font-label-lg text-label-lg text-primary uppercase tracking-widest mb-xs">Operational Hub</p>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">HELLO, CHEF.</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Service is active. {data?.todayOrderCount || 0} orders pending.
          </p>
        </section>

        {/* Quick Action Buttons */}
        <section className="grid grid-cols-2 gap-sm">
          <button className="bg-primary-container text-on-primary-container px-md py-sm rounded-full flex items-center justify-center gap-xs font-label-lg text-label-lg active:scale-95 transition-all umami-shadow">
            <span className="material-symbols-outlined">bolt</span>
            Live Orders
          </button>
          <button className="border-2 border-on-surface text-on-surface px-md py-sm rounded-full flex items-center justify-center gap-xs font-label-lg text-label-lg active:scale-95 transition-all">
            <span className="material-symbols-outlined">add</span>
            Add Branch
          </button>
        </section>

        {/* Revenue Card */}
        <div className="bg-surface-container-high rounded-xl p-md umami-shadow relative overflow-hidden">
          <div className="flex justify-between items-start mb-sm">
            <div>
              <p className="font-label-lg text-label-lg text-on-surface-variant uppercase">Daily Revenue</p>
              <h3 className="font-headline-lg text-headline-lg mt-xs">₹{data?.todayRevenue?.toLocaleString() || '0'}</h3>
            </div>
            <div className="bg-primary text-on-primary p-xs rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined fill-icon">trending_up</span>
            </div>
          </div>
          <div className="flex items-center gap-xs">
            <span className="font-label-sm text-label-sm text-primary">+12.5%</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">vs yesterday</span>
          </div>
          <div className="absolute bottom-0 right-0 left-0 h-1 bg-primary/10">
            <div className="h-full bg-primary w-3/4"></div>
          </div>
        </div>

        {/* Active Orders Card */}
        <div className="bg-surface-container-high rounded-xl p-md umami-shadow">
          <div className="flex justify-between items-start mb-sm">
            <div>
              <p className="font-label-lg text-label-lg text-on-surface-variant uppercase">Active Orders</p>
              <h3 className="font-headline-lg text-headline-lg mt-xs">{data?.todayOrderCount || 0}</h3>
            </div>
            <div className="bg-on-secondary-fixed text-primary-fixed p-xs rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
          </div>
          <div className="flex gap-sm">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Dine-in</span>
              <span className="font-headline-sm text-headline-sm">{Math.round((data?.todayOrderCount || 0) * 0.6)}</span>
            </div>
            <div className="w-px bg-outline-variant h-8 self-center"></div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Delivery</span>
              <span className="font-headline-sm text-headline-sm">{Math.round((data?.todayOrderCount || 0) * 0.4)}</span>
            </div>
          </div>
        </div>

        {/* Cover Count Card */}
        <div className="bg-surface-container-high rounded-xl p-md umami-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-label-lg text-label-lg text-on-surface-variant uppercase">Cover Count</p>
              <h3 className="font-headline-lg text-headline-lg mt-xs">{data?.totalUniqueCustomers || 0}</h3>
            </div>
            <div className="bg-surface-container text-on-surface-variant p-xs rounded-full">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-sm">Peak Hour: 19:00 – 21:00</p>
        </div>

        {/* Priority Ticket */}
        <section>
          <div className="flex justify-between items-center mb-sm">
            <p className="font-label-lg text-label-lg text-primary uppercase tracking-widest">Priority Ticket</p>
            <Link href="/kitchen" className="font-label-sm text-label-sm text-on-surface-variant underline">View Kitchen Display</Link>
          </div>
          <div className="bg-surface-container-low rounded-xl p-md umami-shadow relative">
            <div className="flex justify-between items-center mb-sm border-b-2 border-primary pb-base">
              <span className="font-headline-sm text-headline-sm">#T-4201</span>
              <span className="bg-primary text-on-primary px-sm py-xs rounded-lg font-label-sm text-label-sm">URGENT</span>
            </div>
            <div className="space-y-sm">
              <div className="flex justify-between items-center">
                <span className="font-body-md">2× Wagyu Smash Burger</span>
                <span className="font-label-lg text-label-lg text-primary">M-RARE</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body-md">1× Truffle Fries</span>
                <span className="font-label-lg text-label-lg text-on-surface-variant">-</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body-md text-primary">1× Spicy Miso Ramen</span>
                <span className="font-label-lg text-label-lg text-primary font-bold">NO ONIONS</span>
              </div>
            </div>
            <div className="mt-md pt-sm border-t border-outline-variant flex justify-between items-center">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Table 12 • Server: Marco</span>
              <span className="font-headline-sm text-headline-sm text-primary">12:04m</span>
            </div>
          </div>
        </section>

        {/* Performance Insight Banner */}
        <div className="bg-inverse-surface text-inverse-on-surface p-md rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-inverse-primary">insights</span>
            <div>
              <p className="font-label-lg text-label-lg">Performance Insight</p>
              <p className="font-label-sm text-label-sm opacity-80">Upsell rate is up 4% today.</p>
            </div>
          </div>
          <button className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center active:scale-95">
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════ */}
      {/* DESKTOP VIEW                    */}
      {/* ═══════════════════════════════ */}
      <div className="hidden md:block space-y-lg">
        {/* Trial Banner */}
        <div className="mb-lg p-md bg-secondary-container text-on-secondary-container rounded-xl flex items-center justify-between border-l-8 border-primary relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-md">
            <span className="material-symbols-outlined text-4xl fill-icon">info</span>
            <div>
              <h2 className="font-headline-sm text-headline-sm">Trial expires in 4 days.</h2>
              <p className="font-body-md text-body-md opacity-80">Upgrade now to keep your restaurant running at peak performance without interruption.</p>
            </div>
          </div>
          <button className="relative z-10 bg-on-secondary-container text-surface-container-lowest px-lg py-sm rounded-full font-label-lg hover:scale-105 transition-transform active:scale-95">
            Upgrade Pro
          </button>
          <div className="absolute right-0 top-0 w-64 h-full bg-primary/10 -skew-x-12 translate-x-12"></div>
        </div>

        {/* Dashboard Title */}
        <div className="flex items-end justify-between mb-lg">
          <div>
            <h3 className="font-display-md text-display-md text-on-surface leading-tight">Welcome back, Chef.</h3>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Here is your kitchen&apos;s performance today, {dateString}.</p>
          </div>
          <div className="flex gap-base">
            <div className="bg-surface-container-high p-sm rounded-lg flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary">calendar_today</span>
              <span className="font-label-lg">Last 24 Hours</span>
            </div>
          </div>
        </div>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-12 gap-gutter mb-lg">
          {/* Revenue Card (Large) */}
          <div className="col-span-12 lg:col-span-5 bg-surface-container p-lg rounded-xl umami-shadow relative overflow-hidden group">
            <div className="flex justify-between items-start mb-md">
              <span className="material-symbols-outlined text-primary text-4xl">payments</span>
              <div className="bg-primary/10 text-primary px-sm py-xs rounded-full text-label-sm font-bold">+12.4%</div>
            </div>
            <div className="relative z-10">
              <h4 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest">Total Revenue</h4>
              <div className="font-display-md text-display-md mt-base">₹{data?.todayRevenue?.toLocaleString() || '0'}</div>
            </div>
            <div className="mt-lg h-32 w-full flex items-end gap-1">
              <div className="w-full bg-primary/20 h-1/2 rounded-t-md group-hover:h-3/4 transition-all duration-500"></div>
              <div className="w-full bg-primary/20 h-2/3 rounded-t-md group-hover:h-1/2 transition-all duration-500"></div>
              <div className="w-full bg-primary h-full rounded-t-md"></div>
              <div className="w-full bg-primary/20 h-3/4 rounded-t-md group-hover:h-2/3 transition-all duration-500"></div>
              <div className="w-full bg-primary/20 h-1/3 rounded-t-md group-hover:h-1/2 transition-all duration-500"></div>
              <div className="w-full bg-primary/20 h-1/2 rounded-t-md group-hover:h-3/4 transition-all duration-500"></div>
            </div>
          </div>

          {/* Metrics Column */}
          <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-gutter">
            {/* Daily Orders */}
            <div className="bg-surface-container p-md rounded-xl umami-shadow border-b-4 border-primary">
              <div className="flex justify-between items-center mb-base">
                <h4 className="font-label-lg text-label-lg text-on-surface-variant">Daily Orders</h4>
                <span className="material-symbols-outlined text-primary">shopping_bag</span>
              </div>
              <div className="font-headline-lg text-headline-lg">{data?.todayOrderCount || 0}</div>
              <div className="text-label-sm text-on-surface-variant mt-sm">28 orders currently cooking</div>
            </div>

            {/* New Customers */}
            <div className="bg-surface-container p-md rounded-xl umami-shadow">
              <div className="flex justify-between items-center mb-base">
                <h4 className="font-label-lg text-label-lg text-on-surface-variant">New Customers</h4>
                <span className="material-symbols-outlined text-primary">person_add</span>
              </div>
              <div className="font-headline-lg text-headline-lg">{data?.totalUniqueCustomers || 0}</div>
              <div className="text-label-sm text-primary mt-sm flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>15% up from yesterday</span>
              </div>
            </div>

            {/* Average Order Value */}
            <div className="bg-surface-container-highest p-md rounded-xl umami-shadow col-span-2">
              <div className="flex justify-between items-center mb-base">
                <h4 className="font-label-lg text-label-lg text-on-surface-variant">Average Order Value</h4>
                <span className="material-symbols-outlined text-primary">insights</span>
              </div>
              <div className="flex items-baseline gap-md">
                <div className="font-headline-lg text-headline-lg">₹{avgOrderValue}</div>
                <div className="text-on-surface-variant line-through font-label-lg opacity-50">₹{Math.round(avgOrderValue * 0.87)}</div>
              </div>
              <div className="mt-md h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                <div className="h-full bg-primary w-4/5 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Kitchen Command Center */}
        <div className="mb-xl">
          <h3 className="font-headline-sm text-headline-sm mb-md text-primary uppercase tracking-widest">Kitchen Command Center</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Add Menu Item */}
            <Link href="/owner/menu" className="group cursor-pointer">
              <div className="aspect-video relative rounded-xl overflow-hidden mb-md bg-surface-container-high">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <span className="material-symbols-outlined text-primary text-6xl group-hover:scale-110 transition-transform">restaurant_menu</span>
                </div>
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-symbols-outlined text-surface text-5xl">add_circle</span>
                </div>
              </div>
              <h4 className="font-headline-sm text-headline-sm">Add Menu Item</h4>
              <p className="text-on-surface-variant font-body-md">Update your seasonal flavors and daily specials.</p>
            </Link>

            {/* Add Staff */}
            <Link href="/owner/staff" className="group cursor-pointer">
              <div className="aspect-video relative rounded-xl overflow-hidden mb-md bg-surface-container-high">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/10 to-secondary/5">
                  <span className="material-symbols-outlined text-secondary text-6xl group-hover:scale-110 transition-transform">groups</span>
                </div>
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-symbols-outlined text-surface text-5xl">group_add</span>
                </div>
              </div>
              <h4 className="font-headline-sm text-headline-sm">Add Staff</h4>
              <p className="text-on-surface-variant font-body-md">Onboard new team members to your kitchen squad.</p>
            </Link>

            {/* View Floor Plan */}
            <Link href="/owner/setup" className="group cursor-pointer">
              <div className="aspect-video relative rounded-xl overflow-hidden mb-md bg-surface-container-highest flex items-center justify-center border-2 border-dashed border-primary/30">
                <div className="text-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-6xl mb-base">grid_view</span>
                  <p className="font-label-lg text-primary">Open Interactive Map</p>
                </div>
              </div>
              <h4 className="font-headline-sm text-headline-sm">View Floor Plan</h4>
              <p className="text-on-surface-variant font-body-md">Manage table assignments and reservations live.</p>
            </Link>
          </div>
        </div>

        {/* Ticket + Popular Items */}
        <div className="grid grid-cols-12 gap-gutter mb-xl">
          {/* Ticket Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-surface-container-low p-lg rounded-t-xl relative umami-shadow min-h-[400px]">
              <div className="flex justify-between items-center mb-md border-b-2 border-primary pb-base">
                <div className="font-display-md text-headline-lg">TICKET #842</div>
                <div className="bg-primary text-on-primary px-sm py-xs rounded-lg text-label-sm">URGENT</div>
              </div>
              <div className="space-y-md">
                <div className="flex justify-between items-center">
                  <span className="font-body-lg">1× Truffle Risotto</span>
                  <span className="font-label-lg">₹2,800</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body-lg">2× Wagyu Sliders</span>
                  <span className="font-label-lg">₹4,400</span>
                </div>
                <div className="flex justify-between items-center border-t border-outline-variant pt-md">
                  <span className="font-headline-sm">TOTAL</span>
                  <span className="font-headline-sm">₹7,200</span>
                </div>
              </div>
              <div className="mt-lg">
                <p className="font-label-sm text-on-surface-variant mb-xs">SERVER: MARCO</p>
                <p className="font-label-sm text-on-surface-variant">TABLE: 14 • 12:45 PM</p>
              </div>
              <div className="absolute bottom-4 left-0 w-full px-lg">
                <button className="w-full bg-primary text-on-primary py-md rounded-full font-label-lg shadow-md hover:brightness-110 active:scale-95 transition-all">COMPLETE ORDER</button>
              </div>
            </div>
          </div>

          {/* Popular Items Today */}
          <div className="col-span-12 lg:col-span-8 bg-surface p-lg rounded-xl umami-shadow">
            <div className="flex justify-between items-center mb-lg">
              <h3 className="font-headline-sm text-headline-sm">Popular Items Today</h3>
              <Link href="/owner/analytics" className="text-primary font-label-lg flex items-center gap-xs">
                View Report <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            <div className="space-y-md">
              {(data?.topDishes || []).slice(0, 3).map((dish, i) => (
                <div key={dish.menuItemId || i} className="flex items-center gap-md p-md hover:bg-surface-container-low rounded-xl transition-colors">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl">lunch_dining</span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-headline-sm text-body-lg">{dish.name}</h5>
                    <p className="text-on-surface-variant text-label-sm">{dish.totalOrdered} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-headline-sm text-primary">₹{(dish.totalOrdered * (avgOrderValue || 18)).toLocaleString()}</p>
                    <p className="text-label-sm text-secondary-fixed-dim">Revenue</p>
                  </div>
                </div>
              ))}
              {(!data?.topDishes || data.topDishes.length === 0) && (
                <>
                  <div className="flex items-center gap-md p-md hover:bg-surface-container-low rounded-xl transition-colors">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-3xl">local_pizza</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-headline-sm text-body-lg">Artisanal Margarita</h5>
                      <p className="text-on-surface-variant text-label-sm">84 units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-headline-sm text-primary">₹1,512</p>
                      <p className="text-label-sm text-secondary-fixed-dim">Revenue</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-md p-md hover:bg-surface-container-low rounded-xl transition-colors">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-3xl">cake</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-headline-sm text-body-lg">Chocolate Lava Fondant</h5>
                      <p className="text-on-surface-variant text-label-sm">62 units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-headline-sm text-primary">₹868</p>
                      <p className="text-label-sm text-secondary-fixed-dim">Revenue</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Atmosphere Elements */}
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full pointer-events-none hidden md:block"></div>
      <div className="fixed bottom-0 left-0 -z-10 w-1/4 h-1/4 bg-secondary-container/20 blur-[100px] rounded-full pointer-events-none hidden md:block"></div>
    </>
  );
}
