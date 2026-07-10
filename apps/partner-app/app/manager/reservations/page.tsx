'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@foodmart/shared';
import { useAuth } from '../../context/AuthContext';

interface Reservation {
  id: string;
  partySize: number;
  date: string;
  timeSlot: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
}

interface Branch {
  id: string;
  name: string;
}

export default function ReservationsBoard() {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'CONFIRMED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBranches = async () => {
    try {
      const res: any = await api.get('/api/v1/owner/branches');
      if (res.success && res.data) {
        setBranches(res.data);
        if (res.data.length > 0) {
          setSelectedBranch(res.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReservations = async () => {
    if (!selectedBranch) return;
    setLoading(true);
    try {
      const res: any = await api.get(`/api/v1/reservations/${selectedBranch.id}?date=${selectedDate}`);
      if (res.success && res.data) {
        setReservations(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [selectedBranch, selectedDate]);

  const handleUpdateStatus = async (id: string, status: Reservation['status']) => {
    try {
      const res: any = await api.patch(`/api/v1/reservations/${id}/status`, { status });
      if (res.success) {
        fetchReservations();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredReservations = reservations.filter((r) => {
    // Apply search filter
    if (searchQuery) {
      const matches = r.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.customer.phone.includes(searchQuery) ||
        r.timeSlot.includes(searchQuery);
      if (!matches) return false;
    }

    // Apply status tab filter
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PENDING') return r.status === 'PENDING';
    if (activeTab === 'CONFIRMED') return r.status === 'CONFIRMED';
    return true;
  });

  const getStatusBadgeClass = (status: Reservation['status']) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-primary text-on-primary';
      case 'PENDING': return 'bg-inverse-surface text-inverse-on-surface';
      case 'CANCELLED': return 'bg-error text-on-error';
      default: return 'bg-surface-container text-on-surface-variant';
    }
  };

  // Generate calendar days for October (or current month) matching screen mockup style
  const getDaysArray = () => {
    const today = new Date();
    const days = [];
    for (let i = -3; i <= 6; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const calendarDays = getDaysArray();

  return (
    <div className="space-y-lg font-hanken">
      {/* Header operations */}
      <div className="flex justify-between items-center flex-wrap gap-md">
        <div>
          <h2 className="font-display-md text-display-md text-on-surface leading-tight uppercase">Reservations</h2>
          <p className="font-body-md text-on-surface-variant">Manage guest flow, table availability, and daily floor book covers.</p>
        </div>

        <div className="flex items-center gap-md">
          {/* Search bar */}
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high border-none rounded-full py-2 pl-12 pr-4 font-label-lg text-on-surface focus:ring-2 focus:ring-primary outline-none"
              placeholder="Search bookings..."
            />
          </div>

          {/* Branch Select */}
          {branches.length > 0 && (
            <select
              value={selectedBranch?.id || ''}
              onChange={(e) => {
                const b = branches.find((x) => x.id === e.target.value);
                if (b) setSelectedBranch(b);
              }}
              className="bg-surface-container border border-outline-variant rounded-full px-md py-sm font-label-lg text-on-surface outline-none cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Calendar Card (Left 4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-md">
          <div className="bg-surface-container p-md rounded-xl border border-outline-variant/30 space-y-md umami-shadow">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-sm text-body-lg text-secondary uppercase font-bold">
                {new Date(selectedDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-xs">
                <button className="material-symbols-outlined text-xl text-on-surface-variant">chevron_left</button>
                <button className="material-symbols-outlined text-xl text-on-surface-variant">chevron_right</button>
              </div>
            </div>

            {/* Horizontal mini calendar calendar strips */}
            <div className="grid grid-cols-7 gap-xs text-center border-b border-outline-variant/30 pb-sm">
              {['S','M','T','W','T','F','S'].map((day, idx) => (
                <span key={idx} className="font-label-sm text-label-sm text-on-surface-variant/40">{day}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-xs text-center">
              {calendarDays.map((date, idx) => {
                const isSelected = date.toISOString().split('T')[0] === selectedDate;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
                    className={`w-10 h-10 rounded-full font-label-lg text-label-lg flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-primary text-on-primary font-bold'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Daily Occupancy */}
            <div className="pt-md border-t border-outline-variant/30 space-y-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block">Daily Occupancy</span>
              <div className="space-y-xs">
                <div className="flex justify-between text-label-lg text-on-surface">
                  <span>Dinner Rush</span>
                  <span className="font-bold">88%</span>
                </div>
                <div className="w-full bg-[#7c544e]/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[88%]" />
                </div>
              </div>
              <div className="space-y-xs">
                <div className="flex justify-between text-label-lg text-on-surface">
                  <span>Lunch Service</span>
                  <span className="font-bold">42%</span>
                </div>
                <div className="w-full bg-[#7c544e]/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#7c544e] h-full w-[42%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Event Card Banner */}
          <div className="bg-[#fff3eb] text-secondary p-lg rounded-xl border border-[#ffdbd1] flex items-center justify-between">
            <div>
              <span className="font-display-md text-headline-sm text-primary uppercase block">Special Event Night</span>
              <p className="font-body-md text-xs mt-xs text-secondary/80">Omasake Tasting Menu (2nd Floor). Total 12 seats remaining.</p>
            </div>
            <button className="bg-secondary text-white px-md py-sm rounded-full font-label-lg uppercase shadow-sm hover:brightness-110 active:scale-95 transition-all flex-shrink-0 ml-sm">
              Manage
            </button>
          </div>
        </div>

        {/* Bookings List (Right 8 cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-md">
          {/* Reservation Tabs */}
          <div className="flex border-b border-outline-variant/30 gap-md">
            {(['ALL', 'PENDING', 'CONFIRMED'] as const).map((tab) => {
              const isActive = activeTab === tab;
              const count = tab === 'ALL' 
                ? reservations.length 
                : reservations.filter((r) => r.status === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-sm font-label-lg text-label-lg uppercase tracking-wider transition-all border-b-2 ${
                    isActive
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {tab === 'ALL' ? 'All Bookings' : tab === 'PENDING' ? 'Pending' : 'Confirmed'} ({count})
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="py-xl text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="bg-surface-container p-xl rounded-xl text-center text-on-surface-variant font-label-lg">
              No reservations found on this date.
            </div>
          ) : (
            <div className="space-y-md">
              {filteredReservations.map((r) => {
                const isPending = r.status === 'PENDING';
                return (
                  <div 
                    key={r.id}
                    className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30 flex justify-between items-center shadow-sm flex-wrap gap-md"
                  >
                    <div className="flex items-center gap-md">
                      <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">person</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-sm">
                          <h4 className="font-headline-sm text-body-lg text-secondary">{r.customer.name}</h4>
                          <span className={`px-sm py-0.5 rounded font-label-sm text-label-sm uppercase ${getStatusBadgeClass(r.status)}`}>
                            {r.status.toLowerCase()}
                          </span>
                        </div>
                        <p className="font-label-lg text-label-lg text-on-surface-variant mt-xs">
                          {r.customer.phone} • Party of {r.partySize} Guests {r.notes && `• "${r.notes}"`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-md">
                      {/* Time info */}
                      <div className="text-right mr-sm">
                        <span className="font-label-sm text-on-surface-variant block uppercase tracking-wider">BOOKING TIME</span>
                        <span className="font-headline-sm text-body-lg text-secondary">{r.timeSlot}</span>
                      </div>

                      {isPending ? (
                        <div className="flex gap-sm">
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'CANCELLED')}
                            className="border border-outline-variant hover:bg-surface-container-high text-on-surface-variant px-md py-sm rounded-full font-label-lg uppercase active:scale-95 transition-all"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'CONFIRMED')}
                            className="bg-primary text-on-primary px-md py-sm rounded-full font-label-lg uppercase shadow-sm hover:brightness-110 active:scale-95 transition-all"
                          >
                            Confirm
                          </button>
                        </div>
                      ) : (
                        <button className="border border-outline-variant hover:bg-surface-container-high text-on-surface-variant px-md py-sm rounded-full font-label-lg uppercase active:scale-95 transition-all">
                          View Table
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
