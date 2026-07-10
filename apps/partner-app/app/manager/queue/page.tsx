'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@foodmart/shared';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../hooks/useQueue';

interface QueueEntry {
  id: string;
  name: string;
  phone: string;
  partySize: number;
  position: number;
  status: 'WAITING' | 'CALLED' | 'SEATED' | 'LEFT';
  notes?: string;
  createdAt: string;
}

interface Branch {
  id: string;
  name: string;
}

export default function QueueTracker() {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [loadingBranches, setLoadingBranches] = useState(true);

  // Add guest modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Query queue list using custom hook
  const { data: rawQueue = [], isLoading: loadingQueue, refetch: fetchQueue } = useQueue(selectedBranch?.id || null);
  const queue = (rawQueue as QueueEntry[]).filter((e: QueueEntry) => ['WAITING', 'CALLED'].includes(e.status));

  const loading = loadingBranches || loadingQueue;

  const fetchBranches = async () => {
    try {
      const res: any = await api.get('/owner/branches');
      if (res.success && res.data) {
        setBranches(res.data);
        if (res.data.length > 0) {
          setSelectedBranch(res.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch || !name || !phone) return;
    setSubmitting(true);

    try {
      const res: any = await api.post(`/queue/${selectedBranch.id}`, {
        name,
        phone,
        partySize: Number(partySize),
        notes: notes || undefined,
      });

      if (res.success) {
        setModalOpen(false);
        setName('');
        setPhone('');
        setPartySize(2);
        setNotes('');
        fetchQueue();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCallGuest = async (id: string) => {
    try {
      const res: any = await api.patch(`/queue/${id}/call`);
      if (res.success) {
        fetchQueue();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSeatGuest = async (id: string) => {
    try {
      const res: any = await api.patch(`/queue/${id}/seat`);
      if (res.success) {
        fetchQueue();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getElapsedTimeMins = (createdAt: string) => {
    const elapsedMs = Date.now() - new Date(createdAt).getTime();
    return Math.floor(elapsedMs / 60000);
  };

  // Filter VIP vs General for VIP priority box
  const vipEntry = queue.find((q) => q.notes?.toLowerCase().includes('vip') || q.notes?.toLowerCase().includes('anniversary'));
  const regularQueue = queue.filter((q) => q.id !== vipEntry?.id);

  const smallParties = queue.filter((q) => q.partySize <= 2).length;
  const largeParties = queue.filter((q) => q.partySize > 2).length;

  return (
    <div className="space-y-lg font-hanken">
      {/* Top Header Row */}
      <div className="flex justify-between items-center flex-wrap gap-md">
        <div>
          <h2 className="font-display-md text-display-md text-on-surface leading-tight uppercase">Live Queue</h2>
          <p className="font-body-md text-on-surface-variant">Seat waiting walk-in parties, trigger notifications, and dispatch tables.</p>
        </div>

        <div className="flex items-center gap-md">
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {/* Metric 1 */}
        <div className="bg-primary text-on-primary p-lg rounded-xl border border-outline-variant/10 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div>
            <span className="font-label-sm text-label-sm text-on-primary/60 uppercase block">Active Queue</span>
            <p className="font-display-md text-[56px] leading-none mt-sm">{queue.length} Parties</p>
          </div>
          <div className="flex gap-sm text-label-sm">
            <span>{smallParties} Small (1-2)</span>
            <span>•</span>
            <span>{largeParties} Large (4+)</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-low p-lg rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between min-h-[140px] umami-shadow">
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase block">Est. Wait Time</span>
            <p className="font-display-md text-[56px] text-secondary leading-none mt-sm">35 Mins</p>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">trending_up</span> +5 min from last hour
          </span>
        </div>

        {/* Action Add Card */}
        <div 
          onClick={() => setModalOpen(true)}
          className="border-2 border-dashed border-outline-variant rounded-xl p-lg flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-low hover:border-primary active:scale-98 transition-all min-h-[140px]"
        >
          <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-primary text-2xl">person_add</span>
          </div>
          <span className="font-display-md text-headline-sm text-secondary uppercase mt-sm">Add to Queue</span>
        </div>
      </div>

      {/* Main List layout */}
      <div className="space-y-md">
        <h3 className="font-display-md text-headline-sm text-secondary uppercase tracking-wider">Queue Roster</h3>

        {/* VIP Priority Box (if any VIP guest matches) */}
        {vipEntry && (
          <div className="bg-[#fdc8bf] border border-[#ffb5a0] p-md rounded-xl space-y-md relative overflow-hidden umami-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-sm text-primary uppercase tracking-widest font-black block">VIP Priority Alert</span>
                <h4 className="font-display-md text-headline-sm text-secondary mt-xs">{vipEntry.name}</h4>
                <p className="font-label-lg text-label-lg text-secondary/70">
                  Party of {vipEntry.partySize} • {vipEntry.notes} • Joined {getElapsedTimeMins(vipEntry.createdAt)}m ago
                </p>
              </div>
              <div className="flex gap-sm">
                <button
                  onClick={() => handleCallGuest(vipEntry.id)}
                  className="bg-secondary text-white px-md py-sm rounded-full font-label-lg uppercase shadow-sm hover:brightness-110 active:scale-95 transition-all"
                >
                  Call Party
                </button>
                <button
                  onClick={() => handleSeatGuest(vipEntry.id)}
                  className="bg-primary text-white px-md py-sm rounded-full font-label-lg uppercase shadow-sm hover:brightness-110 active:scale-95 transition-all"
                >
                  Quick Seat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Regular Queue List */}
        {loading ? (
          <div className="py-xl text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : regularQueue.length === 0 && !vipEntry ? (
          <div className="bg-surface-container p-xl rounded-xl text-center text-on-surface-variant font-label-lg">
            Queue is empty. Select Add to Queue to register new guest cards.
          </div>
        ) : (
          <div className="space-y-md">
            {regularQueue.map((entry, idx) => {
              const elapsed = getElapsedTimeMins(entry.createdAt);
              const isOverdue = elapsed > 30;
              const isCalled = entry.status === 'CALLED';

              return (
                <div 
                  key={entry.id}
                  className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30 flex justify-between items-center shadow-sm hover:scale-[1.005] transition-all flex-wrap gap-md"
                >
                  <div className="flex items-center gap-md">
                    {/* Index circle */}
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-display-md text-headline-sm text-secondary">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-body-lg text-secondary">{entry.name}</h4>
                      <p className="font-label-lg text-label-lg text-on-surface-variant">
                        Party of {entry.partySize} • Waiting {elapsed}m • {entry.phone}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Alerts */}
                  <div className="flex items-center gap-md">
                    {isOverdue && (
                      <span className="bg-error/10 text-error px-sm py-xs rounded font-label-sm text-label-sm uppercase tracking-wider font-black">
                        Overdue
                      </span>
                    )}
                    {isCalled && (
                      <span className="bg-primary/10 text-primary px-sm py-xs rounded font-label-sm text-label-sm uppercase tracking-wider font-black">
                        Notified
                      </span>
                    )}

                    <button
                      onClick={() => handleCallGuest(entry.id)}
                      className="border border-outline-variant hover:bg-surface-container-high text-on-surface-variant px-md py-sm rounded-full font-label-lg uppercase active:scale-95 transition-all flex items-center gap-xs"
                    >
                      <span className="material-symbols-outlined text-sm">notifications</span>
                      {isCalled ? 'Recall' : 'Call'}
                    </button>
                    <button
                      onClick={() => handleSeatGuest(entry.id)}
                      className="bg-primary text-on-primary px-md py-sm rounded-full font-label-lg uppercase shadow-sm hover:brightness-110 active:scale-95 transition-all"
                    >
                      Seat Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Guest Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm p-md">
          <form 
            onSubmit={handleAddGuest}
            className="bg-surface w-full max-w-md rounded-xl border border-outline-variant p-lg space-y-md shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div className="flex justify-between items-center border-b border-outline-variant pb-md">
              <h3 className="font-display-md text-headline-sm text-secondary uppercase">Register Guest</h3>
              <button 
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-xs bg-surface-container hover:bg-surface-container-high rounded-full transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-sm">
              <div>
                <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Customer Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
                  placeholder="e.g. Monica Geller"
                />
              </div>

              <div>
                <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Phone Number</label>
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Party Size</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Notes / Tag</label>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
                    placeholder="e.g. VIP, Window Table"
                  />
                </div>
              </div>
            </div>

            <div className="pt-md flex gap-sm">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-md border border-outline-variant rounded-full text-on-surface-variant font-label-lg uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-md bg-primary text-on-primary rounded-full font-label-lg uppercase shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                {submitting ? 'Registering...' : 'Add to Queue'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
