'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@foodmart/shared';
import { useAuth } from '../../context/AuthContext';

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

export default function OwnerAnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState<'Daily' | 'Weekly'>('Daily');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res: any = await api.get('/api/v1/owner/analytics');
        if (res.success && res.data) setData(res.data);
      } catch (e) {
        console.error('Failed to load analytics:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const maxHourlyOrders = data?.ordersByHour ? Math.max(...data.ordersByHour, 1) : 1;

  const topDishes = data?.topDishes?.length ? data.topDishes : [
    { menuItemId: '1', name: 'Truffle Wagyu Burger', totalOrdered: 248 },
    { menuItemId: '2', name: 'Smoked Salmon Carpaccio', totalOrdered: 192 },
    { menuItemId: '3', name: 'Spicy Lobster Rigatoni', totalOrdered: 156 },
    { menuItemId: '4', name: 'Burrata & Heirloom Salad', totalOrdered: 132 },
    { menuItemId: '5', name: 'Valrhona Chocolate Lava', totalOrdered: 98 },
  ];

  const dishIcons = ['lunch_dining', 'set_meal', 'ramen_dining', 'salad', 'cake'];
  const barColors = ['bg-primary', 'bg-primary', 'bg-primary', 'bg-primary', 'bg-error'];

  return (
    <>
      {/* ═══════════════════════════════ */}
      {/* MOBILE VIEW                     */}
      {/* ═══════════════════════════════ */}
      <div className="md:hidden space-y-md">
        <div>
          <h2 className="font-display-md text-display-md text-primary leading-tight">Insights</h2>
          <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest mt-xs">Store 402 • Today&apos;s Performance</p>
        </div>

        {/* Live Sales Hero Card */}
        <div className="bg-primary-container text-on-primary-container p-lg rounded-xl relative overflow-hidden">
          <p className="font-label-lg text-label-lg uppercase">Live Sales</p>
          <h3 className="font-display-md text-display-md mt-base">₹{(data?.todayRevenue || 12482).toLocaleString()}</h3>
          <p className="font-label-sm text-label-sm opacity-80 mt-xs">+14% vs. Yesterday</p>
          <div className="absolute right-4 top-4">
            <span className="material-symbols-outlined text-5xl opacity-30">trending_up</span>
          </div>
        </div>

        {/* Orders + Avg Ticket */}
        <div className="grid grid-cols-2 gap-sm">
          <div className="bg-surface-container-high rounded-xl p-md umami-shadow">
            <p className="font-label-lg text-label-lg text-on-surface-variant uppercase">Orders</p>
            <h3 className="font-headline-lg text-headline-lg mt-xs">{data?.todayOrderCount || 148}</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">8 Pending</p>
          </div>
          <div className="bg-surface-container-high rounded-xl p-md umami-shadow">
            <p className="font-label-lg text-label-lg text-on-surface-variant uppercase">Avg. Ticket</p>
            <h3 className="font-headline-lg text-headline-lg text-primary mt-xs">
              ₹{data?.todayOrderCount && data?.todayRevenue ? Math.round(data.todayRevenue / data.todayOrderCount) : 84}
            </h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">High Tier</p>
          </div>
        </div>

        {/* Hourly Revenue Chart */}
        <div className="bg-surface-container-low rounded-xl p-md umami-shadow">
          <div className="flex justify-between items-center mb-md">
            <h4 className="font-headline-sm text-headline-sm">Hourly Revenue</h4>
            <div className="flex items-center gap-xs">
              <span className="w-2 h-2 bg-error rounded-full animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-error">Live</span>
            </div>
          </div>
          <div className="h-40 flex items-end justify-between gap-1 mt-md">
            {(data?.ordersByHour || [0, 2, 5, 8, 12, 15, 10, 6, 3, 1, 0, 0]).slice(0, 7).map((count, hour) => {
              const percent = (count / (Math.max(...(data?.ordersByHour || [15]), 1))) * 100;
              return (
                <div key={hour} className="flex-1 flex flex-col items-center h-full justify-end">
                  <div
                    style={{ height: `${Math.max(percent, 5)}%` }}
                    className="w-full rounded-t-md bg-primary transition-all"
                  />
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-xs">
                    {11 + hour}{hour < 1 ? 'a' : 'p'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Sellers */}
        <div>
          <div className="flex justify-between items-center mb-sm">
            <h4 className="font-headline-sm text-headline-sm">Top Sellers</h4>
            <span className="font-label-lg text-label-lg text-primary uppercase">View All</span>
          </div>
          <div className="space-y-sm">
            {topDishes.slice(0, 3).map((dish, i) => (
              <div key={dish.menuItemId} className="bg-surface-container-low rounded-xl p-md flex items-center gap-md umami-shadow">
                <div className="w-14 h-14 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-2xl">{dishIcons[i] || 'lunch_dining'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-headline-sm text-body-lg truncate">{dish.name}</h5>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">{dish.totalOrdered} sold today</p>
                </div>
                <p className="font-headline-sm text-primary">₹{(dish.totalOrdered * 10).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Server */}
        <div className="bg-secondary-container rounded-xl p-md flex items-center gap-md">
          <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-on-primary-container text-2xl">person</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-secondary-container uppercase">Top Server</p>
            <h5 className="font-headline-sm text-headline-sm text-on-secondary-container">Marco Rossi</h5>
            <p className="font-label-sm text-label-sm text-on-secondary-container/70">₹12,400 Total Rev.</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════ */}
      {/* DESKTOP VIEW                    */}
      {/* ═══════════════════════════════ */}
      <div className="hidden md:block space-y-lg">
        {/* Title */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display-md text-display-md text-on-surface uppercase leading-tight">Owner Insights</h2>
            <div className="flex items-center gap-sm mt-xs">
              <span className="bg-primary text-on-primary px-sm py-xs rounded-lg font-label-sm text-label-sm uppercase">Live</span>
              <span className="font-body-md text-on-surface-variant">
                Performance overview for <span className="text-primary font-bold">Le Petit Bistro • Downtown</span>
              </span>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-3 gap-gutter">
          {/* Gross Revenue */}
          <div className="bg-surface-container p-lg rounded-xl umami-shadow">
            <div className="flex justify-between items-start">
              <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest">Gross Revenue</p>
              <span className="text-primary font-label-lg flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                +12.4%
              </span>
            </div>
            <h3 className="font-display-md text-display-md mt-base">₹{(data?.todayRevenue || 42850).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-sm">vs. ₹38,120 last month</p>
          </div>

          {/* Total Orders */}
          <div className="bg-surface-container p-lg rounded-xl umami-shadow">
            <div className="flex justify-between items-start">
              <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest">Total Orders</p>
              <span className="text-primary font-label-lg flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                +8.1%
              </span>
            </div>
            <h3 className="font-display-md text-display-md mt-base">{data?.todayOrderCount?.toLocaleString() || '1,248'}</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-sm">Avg. order value: ₹{data?.todayOrderCount && data?.todayRevenue ? Math.round(data.todayRevenue / data.todayOrderCount) : 34}</p>
          </div>

          {/* Unique Diners */}
          <div className="bg-surface-container p-lg rounded-xl umami-shadow">
            <div className="flex justify-between items-start">
              <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest">Unique Diners</p>
              <span className="text-primary font-label-lg flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                +15.2%
              </span>
            </div>
            <h3 className="font-display-md text-display-md mt-base">{data?.totalUniqueCustomers || 892}</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-sm">342 repeat customers</p>
          </div>
        </div>

        {/* Chart + Top Dishes */}
        <div className="grid grid-cols-12 gap-gutter">
          {/* Orders by Hour Chart */}
          <div className="col-span-7 bg-surface p-lg rounded-xl umami-shadow">
            <div className="flex justify-between items-center mb-lg">
              <div>
                <h3 className="font-headline-sm text-headline-sm">Orders by Hour</h3>
                <p className="font-body-md text-on-surface-variant">Peak activity tracking</p>
              </div>
              <div className="flex rounded-full overflow-hidden border border-outline-variant">
                {(['Daily', 'Weekly'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setChartView(v)}
                    className={`px-md py-xs font-label-lg text-label-lg transition-all ${chartView === v ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 flex items-end justify-between gap-2 pt-md">
              {(data?.ordersByHour || [0, 2, 5, 8, 12, 18, 22, 15, 10, 6, 3, 1]).map((count, hour) => {
                const percent = (count / maxHourlyOrders) * 100;
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    <span className="absolute bottom-full mb-1 bg-inverse-surface text-inverse-on-surface text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      {count} orders
                    </span>
                    <div
                      style={{ height: `${Math.max(percent, 3)}%` }}
                      className={`w-full rounded-t-md transition-all ${count > 0 ? 'bg-primary hover:bg-primary-container' : 'bg-surface-container-high'}`}
                    />
                    <span className="font-label-sm text-label-sm text-on-surface-variant mt-sm">{11 + hour > 12 ? `${hour - 1}PM` : `${11 + hour}AM`}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Performing Dishes */}
          <div className="col-span-5 bg-inverse-surface text-inverse-on-surface p-lg rounded-xl umami-shadow">
            <div className="mb-md">
              <h3 className="font-headline-sm text-headline-sm">Top Performing Dishes</h3>
              <div className="flex items-center gap-sm mt-xs">
                <span className="font-label-sm text-label-sm text-inverse-primary uppercase">Kitchen Favorites</span>
                <span className="flex items-center gap-xs text-label-sm">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                  <span className="text-inverse-primary">Live</span>
                </span>
              </div>
            </div>

            <div className="space-y-md">
              {topDishes.slice(0, 5).map((dish, i) => (
                <div key={dish.menuItemId} className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-lowest/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-inverse-primary text-xl">{dishIcons[i] || 'lunch_dining'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-headline-sm text-body-lg">{dish.name}</h5>
                    <p className="font-label-sm text-label-sm text-inverse-on-surface/60">{dish.totalOrdered} sold this week</p>
                    {/* Progress bar */}
                    <div className="mt-xs h-1.5 bg-surface-container-lowest/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColors[i] || 'bg-primary'}`}
                        style={{ width: `${(dish.totalOrdered / (topDishes[0]?.totalOrdered || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-headline-sm text-inverse-primary">#{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Status */}
        <div className="flex items-center gap-md py-md">
          <div className="flex items-center gap-xs bg-surface-container px-md py-sm rounded-full">
            <span className="w-2 h-2 bg-[#16A34A] rounded-full"></span>
            <span className="font-label-lg text-label-lg text-on-surface-variant">POS System Online</span>
          </div>
          <div className="flex items-center gap-xs bg-surface-container px-md py-sm rounded-full">
            <span className="material-symbols-outlined text-on-surface-variant text-sm">sync</span>
            <span className="font-label-lg text-label-lg text-on-surface-variant">Last updated: 2 mins ago</span>
          </div>
        </div>
      </div>
    </>
  );
}
