'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@foodmart/shared';
import { useAuth } from '../../context/AuthContext';

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
  orderNumber?: string;
  guestName?: string;
}

export default function ComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        if (!user?.restaurantId) return;
        const res: any = await api.get(`/api/v1/complaints/restaurant/${user.restaurantId}`);
        if (res.success && res.data) setComplaints(res.data);
      } catch (e) {
        console.error('Failed to load complaints:', e);
        // Demo data matching reference screenshots
        setComplaints([
          {
            id: '1',
            rawText: 'The ribeye arrived cold after a 45-minute wait. Floor manager ignored our table.',
            urgency: 'CRITICAL',
            sentiment: 'Angry',
            category: 'SERVICE',
            summary: "Guest reported the 'Toasted Bone Marrow' arrived cold after a 45-minute wait. They expressed frustration with the floor manager's lack of attention. Immediate recovery suggested: void appetizer and offer complimentary dessert.",
            isResolved: false,
            createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
            orderNumber: '#88291',
            guestName: 'Table 12',
          },
          {
            id: '2',
            rawText: 'The music volume in the North Wing was too high for conversation.',
            urgency: 'MEDIUM',
            sentiment: 'Frustrated',
            category: 'FACILITY',
            summary: 'The guest noted that the music volume in the North Wing was too high for conversation. This is the 3rd similar comment today regarding the North Wing atmosphere.',
            isResolved: false,
            createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            guestName: 'Sarah J.',
          },
          {
            id: '3',
            rawText: 'Customer enjoyed the meal quality but mentioned eco-friendly cutlery was requested but not included in the bag.',
            urgency: 'LOW',
            sentiment: 'Neutral',
            category: 'KITCHEN',
            summary: 'Customer enjoyed the meal quality but mentioned eco-friendly cutlery was requested but not included in the bag. Recommendation: Update packing checklist.',
            isResolved: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            orderNumber: '#90112',
            guestName: 'Takeout #112',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [user]);

  const markResolved = (id: string) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, isResolved: true } : c));
  };

  const sentimentEmojis: Record<string, string> = {
    Angry: '😠',
    Frustrated: '😤',
    Neutral: '😐',
    Happy: '😊',
  };

  const urgencyColors: Record<string, string> = {
    CRITICAL: 'bg-error text-on-error',
    MEDIUM: 'bg-primary-container text-on-primary-container',
    LOW: 'bg-surface-container-highest text-on-surface-variant',
  };

  const overallSentiment = 82;
  const criticalAlerts = complaints.filter(c => c.urgency === 'CRITICAL').length;
  const avgResponseTime = 14;
  const aiSummaries = 124;

  if (loading) {
    return <div className="space-y-md animate-pulse"><div className="h-8 bg-surface-container rounded-lg w-48" /><div className="h-64 bg-surface-container rounded-xl" /></div>;
  }

  return (
    <>
      {/* ═══════════════════════════════ */}
      {/* MOBILE VIEW                     */}
      {/* ═══════════════════════════════ */}
      <div className="md:hidden space-y-md">
        <div>
          <h2 className="font-display-md text-display-md text-on-surface leading-tight uppercase">Feedback</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            {complaints.filter(c => c.urgency === 'CRITICAL').length} Urgent tickets require your attention.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-sm">
          <div className="bg-surface-container-high rounded-xl p-md umami-shadow">
            <p className="font-label-lg text-label-lg text-on-surface-variant uppercase">Sentiments</p>
            <div className="flex items-center gap-xs mt-xs">
              <span className="font-headline-lg text-headline-lg text-primary">{overallSentiment}%</span>
              <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
            </div>
          </div>
          <div className="bg-surface-container-high rounded-xl p-md umami-shadow">
            <p className="font-label-lg text-label-lg text-on-surface-variant uppercase">Wait Time</p>
            <div className="flex items-center gap-xs mt-xs">
              <span className="font-headline-lg text-headline-lg">{avgResponseTime}m</span>
              <span className="material-symbols-outlined text-on-surface-variant text-sm">timer</span>
            </div>
          </div>
        </div>

        {/* Complaint Cards */}
        <div className="space-y-md">
          {complaints.map((complaint) => (
            <div key={complaint.id} className={`bg-surface-container-low rounded-xl p-md umami-shadow ${complaint.isResolved ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-sm mb-sm">
                <span className={`px-sm py-xs rounded-lg font-label-sm text-label-sm uppercase ${urgencyColors[complaint.urgency || 'LOW']}`}>
                  {complaint.urgency}
                </span>
                {complaint.category && (
                  <span className="bg-inverse-surface text-inverse-on-surface px-sm py-xs rounded-lg font-label-sm text-label-sm uppercase">
                    {complaint.category}
                  </span>
                )}
                <span className="font-label-sm text-label-sm text-on-surface-variant ml-auto">
                  {getTimeAgo(complaint.createdAt)}
                </span>
              </div>
              <h4 className="font-headline-sm text-body-lg mb-xs">{complaint.guestName || 'Guest'} – {getTitle(complaint)}</h4>
              <p className="font-body-md text-on-surface-variant text-sm line-clamp-2">&quot;{complaint.rawText}&quot;</p>
              <div className="border-t border-outline-variant/30 mt-md pt-sm">
                {!complaint.isResolved ? (
                  <button
                    onClick={() => markResolved(complaint.id)}
                    className="text-primary font-label-lg text-label-lg uppercase"
                  >
                    Mark Resolved
                  </button>
                ) : (
                  <span className="text-on-surface-variant font-label-lg text-label-lg flex items-center gap-xs">
                    <span className="material-symbols-outlined text-sm fill-icon">check_circle</span>
                    Resolved
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════ */}
      {/* DESKTOP VIEW                    */}
      {/* ═══════════════════════════════ */}
      <div className="hidden md:block space-y-lg">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h2 className="font-display-md text-display-md text-on-surface leading-tight uppercase">Guest Feedback</h2>
          <div className="flex items-center gap-md">
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input className="w-full bg-surface-container-high border-none rounded-full py-2 pl-12 pr-4 font-label-lg text-on-surface outline-none focus:ring-2 focus:ring-primary" placeholder="Search insights..." />
            </div>
            <button className="bg-primary text-on-primary px-md py-sm rounded-full font-label-lg flex items-center gap-xs hover:brightness-110 active:scale-95 transition-all shadow-md">
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-gutter">
          <div className="bg-surface-container p-md rounded-xl umami-shadow">
            <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest">Overall Sentiment</p>
            <div className="flex items-end gap-sm mt-sm">
              <span className="font-display-md text-primary leading-none">{overallSentiment}%</span>
              <span className="font-label-lg text-primary flex items-center gap-xs mb-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                +4%
              </span>
            </div>
          </div>
          <div className="bg-surface-container p-md rounded-xl umami-shadow">
            <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest">Critical Alerts</p>
            <div className="flex items-end gap-sm mt-sm">
              <span className="font-display-md leading-none">{criticalAlerts.toString().padStart(2, '0')}</span>
              <span className="material-symbols-outlined text-error text-xl mb-1">warning</span>
            </div>
          </div>
          <div className="bg-surface-container p-md rounded-xl umami-shadow">
            <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest">Avg. Response Time</p>
            <div className="flex items-end gap-sm mt-sm">
              <span className="font-display-md leading-none">{avgResponseTime}m</span>
              <span className="material-symbols-outlined text-on-surface-variant text-xl mb-1">schedule</span>
            </div>
          </div>
          <div className="bg-surface-container p-md rounded-xl umami-shadow">
            <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest">AI Summaries</p>
            <div className="flex items-end gap-sm mt-sm">
              <span className="font-display-md leading-none">{aiSummaries}</span>
              <span className="material-symbols-outlined text-primary text-xl mb-1">auto_awesome</span>
            </div>
          </div>
        </div>

        {/* Complaint Cards */}
        <div className="space-y-lg relative">
          {complaints.map((complaint) => (
            <div key={complaint.id} className={`bg-surface p-lg rounded-xl umami-shadow ${complaint.isResolved ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-md">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant text-2xl">person</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-sm">
                    <div>
                      <h4 className="font-headline-sm text-headline-sm">{complaint.guestName || 'Guest'} – {getTitle(complaint)}</h4>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        {complaint.orderNumber ? `Order ${complaint.orderNumber} • ` : ''}{getTimeAgo(complaint.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-sm">
                      <span className={`px-sm py-xs rounded-lg font-label-sm text-label-sm uppercase ${urgencyColors[complaint.urgency || 'LOW']}`}>
                        {complaint.urgency}
                      </span>
                      <span className="text-2xl">{sentimentEmojis[complaint.sentiment || 'Neutral'] || '😐'}</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{complaint.sentiment}</span>
                    </div>
                  </div>

                  {/* AI Summary */}
                  {complaint.summary && (
                    <div className="bg-surface-container-low rounded-xl p-md mb-md border-l-4 border-primary">
                      <div className="flex items-center gap-xs mb-sm">
                        <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                        <span className="font-label-lg text-label-lg text-primary uppercase">AI Summary (Gemini)</span>
                      </div>
                      <p className="font-body-md text-on-surface italic">&quot;{complaint.summary}&quot;</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-md">
                    {!complaint.isResolved && (
                      <button
                        onClick={() => markResolved(complaint.id)}
                        className="bg-inverse-surface text-inverse-on-surface px-md py-sm rounded-full font-label-lg hover:brightness-110 active:scale-95 transition-all"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {complaint.urgency === 'CRITICAL' && (
                      <button className="flex items-center gap-xs text-on-surface-variant font-label-lg hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">reply</span>
                        Contact Guest
                      </button>
                    )}
                    {complaint.category === 'FACILITY' && (
                      <button className="flex items-center gap-xs text-on-surface-variant font-label-lg hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">volume_down</span>
                        Adjust Audio
                      </button>
                    )}
                    {complaint.isResolved && (
                      <span className="text-on-surface-variant font-label-lg flex items-center gap-xs">
                        <span className="material-symbols-outlined text-sm fill-icon">check_circle</span>
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Generate Daily Insight FAB */}
          <button className="fixed bottom-8 right-8 bg-primary text-on-primary px-lg py-md rounded-full shadow-lg font-label-lg flex items-center gap-sm hover:brightness-110 active:scale-95 transition-all z-40">
            <span className="material-symbols-outlined">auto_awesome</span>
            Generate Daily Insight
          </button>
        </div>
      </div>
    </>
  );
}

function getTimeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours > 1 ? 's' : ''} ago`;
}

function getTitle(complaint: Complaint): string {
  const text = complaint.rawText || '';
  if (text.length > 40) return text.substring(0, 40) + '...';
  return text;
}
