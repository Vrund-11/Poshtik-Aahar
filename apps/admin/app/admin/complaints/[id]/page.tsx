'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@foodmart/shared';

interface ComplaintDetailsProps {
  params: {
    id: string;
  };
}

export default function ComplaintDetails({ params }: ComplaintDetailsProps) {
  const { id } = params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolving, setResolving] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchDetails = async () => {
    try {
      const res: any = await api.get(`/api/v1/admin/complaints/${id}`);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to fetch complaint details.');
      }
    } catch (e: any) {
      setError(e.message || 'Error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleResolve = async () => {
    setResolving(true);
    setError('');
    setSuccess('');
    try {
      const res: any = await api.patch(`/api/v1/admin/complaints/${id}/resolve`);
      if (res.success) {
        setSuccess('Complaint resolved successfully!');
        fetchDetails();
      } else {
        setError(res.message || 'Failed to resolve complaint.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="font-hanken font-bold text-xs text-primary/50 uppercase tracking-widest">Running AI Diagnostics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto space-y-6">
        <div className="bg-pastel-peach border-4 border-black p-6 rounded-3xl space-y-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-sora text-lg font-black text-primary">Error Accessing Feedback</h3>
          <p className="font-hanken text-xs font-bold text-primary">{error || 'Complaint details could not be found.'}</p>
        </div>
        <Link href="/admin/complaints" className="inline-flex items-center gap-2 font-sora text-xs font-black uppercase text-primary hover:underline">
          <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
          <span>Back to overview</span>
        </Link>
      </div>
    );
  }

  const isCritical = data.urgency === 'CRITICAL' || data.urgency === 'HIGH';
  const customerName = data.customer?.name || 'Anonymous';
  const customerInitials = customerName.slice(0, 2).toUpperCase();
  const restInitials = data.restaurant.name.slice(0, 2).toUpperCase();

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-accent-red text-white border-black';
      case 'HIGH':
        return 'bg-pastel-peach text-primary border-black';
      case 'MEDIUM':
        return 'bg-pastel-yellow text-primary border-black';
      default:
        return 'bg-[#e5e5e5] text-primary border-black';
    }
  };

  const handleToggleMobileResolve = () => {
    handleResolve();
  };

  return (
    <>
      {/* MOBILE VIEW */}
      <div className="flex md:hidden min-h-screen w-full flex-col bg-[#fff8f0] pb-32 text-[#1f1b10] font-sans antialiased">
        {/* Top App Bar */}
        <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 h-20 bg-[#fff8f0] shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/admin/complaints" className="hover:opacity-80 transition-opacity flex items-center">
              <span className="material-symbols-outlined text-[#b02f00]">arrow_back</span>
            </Link>
            <h1 className="font-[Anton] text-[24px] text-[#b02f00] uppercase tracking-tighter">UMAMI OS</h1>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#b02f00]">
            <img className="w-full h-full object-cover" alt="User avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXEVlkXIV4P2TEmuvXP27EmDjNgVGMN4kGwUF9wuA2Zo2r-zw5QpQ5Np8mD61je1OvSGwRLHR5IwfjiLHLFNsipahU1z9130biIm76nIIgYVWS_6Pcsy-o_gD0CXmumHLMwefeX681ZjnsgkocfDwfWX1rRbcoIFmH8Sm-VM7Ii8STCR6WHLwA01Lxwmh765-ki9RNbI1vIFVnmswx1ix14Tb4Uo-MojbNZSnOO9lGQU0HZ0rhbcc2nrDumwlc0MSqKW-S_YWO708"/>
          </div>
        </header>

        <main className="px-6 pt-4 space-y-6">
          {/* Ticket Info Card */}
          <section className="relative soft-umami-shadow rounded-t-xl overflow-hidden">
            <div className="bg-[#fcf3e1] p-5 border border-[#e4beb4] border-b-0 rounded-t-xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-[#b02f00] uppercase tracking-wider">TICKET ID: #{id.slice(0, 5).toUpperCase()}</p>
                  <h2 className="font-[Anton] text-[24px] text-[#1f1b10] mt-1 leading-none uppercase">{data.category || 'Dispute Details'}</h2>
                </div>
                <span className="bg-[#1f1b10] text-[#ff5722] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase">{data.urgency || 'HIGH'}</span>
              </div>

              <div className="border-t-2 border-[#e4beb4] pt-3">
                <p className="text-[10px] font-bold text-[#7c544e] uppercase">Customer Description</p>
                <p className="text-[13px] text-[#1f1b10] font-medium leading-relaxed mt-1">{data.rawText}</p>
              </div>

              {/* Churn Risk */}
              <div className="bg-[#ffd9d3] text-[#ba1a1a] rounded-lg p-3 flex justify-between items-center border border-[#ba1a1a]/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  <span className="font-bold text-[12px] uppercase">Churn Risk Warning</span>
                </div>
                <span className="font-[Anton] text-[20px]">84%</span>
              </div>
            </div>
            <div className="ticket-bottom"></div>
          </section>

          {/* Details Bento */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-[#f6eddb] p-4 rounded-xl flex flex-col justify-between h-28 border border-[#e4beb4] soft-umami-shadow">
              <span className="text-[10px] font-bold text-[#5b4039] uppercase">Order Link</span>
              <div>
                <span className="font-[Anton] text-[18px] text-[#b02f00]">#ORD-{data.orderId?.slice(0, 6).toUpperCase() || '8842'}</span>
                <p className="text-[9px] font-bold text-[#7c544e] uppercase mt-1">Click to view details</p>
              </div>
            </div>
            <div className="bg-[#f6eddb] p-4 rounded-xl flex flex-col justify-between h-28 border border-[#e4beb4] soft-umami-shadow">
              <span className="text-[10px] font-bold text-[#5b4039] uppercase">Sentiment Analysis</span>
              <div>
                <span className="font-[Anton] text-[16px] text-[#ba1a1a] uppercase">😡 NEGATIVE</span>
                <p className="text-[9px] font-bold text-[#7c544e] uppercase mt-1">High threat level</p>
              </div>
            </div>
          </section>

          {/* Resolutions Area */}
          <section className="bg-white border-2 border-[#1f1b10] rounded-2xl p-5 space-y-4 soft-umami-shadow">
            <h3 className="font-[Anton] text-[18px] text-[#1f1b10] uppercase tracking-wide">Resolution Actions</h3>
            {success && (
              <div className="bg-[#D1FAE5] border border-[#16A34A] text-[#065F46] font-bold text-xs p-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{success}</span>
              </div>
            )}
            <div className="space-y-3">
              <button 
                onClick={handleResolve}
                disabled={resolving || data.isResolved}
                className={`w-full py-3.5 rounded-full font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  data.isResolved ? 'bg-[#eae2d0] text-[#7c544e]/50 cursor-not-allowed' : 'bg-[#4CAF50] text-white hover:opacity-90'
                }`}
              >
                <span className="material-symbols-outlined text-base">check_circle</span>
                {data.isResolved ? 'Resolved' : 'Mark Resolved'}
              </button>
              <button 
                onClick={handleResolve}
                className="w-full py-3.5 bg-[#ff5722] text-[#541200] rounded-full font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 hover:opacity-90"
              >
                <span className="material-symbols-outlined text-base">payments</span>
                Refund Customer
              </button>
              <button 
                className="w-full py-3.5 border-2 border-[#5b4039] text-[#1f1b10] rounded-full font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 hover:bg-[#fff8f0]"
              >
                <span className="material-symbols-outlined text-base">close</span>
                Dismiss Dispute
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block space-y-10 pb-16 font-body-md text-on-surface">
        {/* Top App Bar */}
        <header className="sticky top-0 z-50 flex justify-between items-center w-full px-margin h-20 bg-surface shadow-sm mb-6">
          <div className="flex items-center gap-md">
            <Link href="/admin/complaints" className="p-xs rounded-full bg-surface-container hover:bg-surface-container-high transition-all flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant font-bold">arrow_back</span>
            </Link>
            <div className="h-8 w-[2px] bg-outline-variant"></div>
            <span className="font-label-lg text-on-surface-variant">COMPLAINT ID: #{id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-lg">
            <div className="hidden lg:flex items-center gap-md text-primary">
              <span className="material-symbols-outlined cursor-pointer">notifications</span>
              <span className="material-symbols-outlined cursor-pointer">help</span>
              <span className="material-symbols-outlined cursor-pointer">apps</span>
            </div>
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary-container">
              <img className="w-full h-full object-cover" alt="Admin avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7VCkmw3iBeSU84SkFvmRKgwnS6FoEmoKj9R1xCIXMXr3viU6XZjEUEYEzUkt-8_AKhssUtP7OUvG7qgoiT1eHxaZsdfC-rEhSdFD1TAvkvncfI6NCqfjKq8qY9OFc9t8fpKNJKu6C02uZTWfZVn2VPh-krYsEjpEKX5Pl1rS1tOUDnsr_YN4lqBY-yzKpHm9geNWLJ_CgXU3DdXnjfWl3XKGNxl2EqCzpKediCBWPAuWg-3z6p4Xjf_Q14ynbBzmFWTjfTypsZQ4"/>
            </div>
          </div>
        </header>

        {/* Critical Alert Bar */}
        {isCritical && (
          <div className="mx-margin bg-error-container text-on-error-container p-4 rounded-xl flex items-center justify-between border border-error/20">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-error font-black text-xl animate-bounce">warning</span>
              <p className="font-sora text-xs font-black uppercase tracking-widest leading-none">
                CRITICAL DISPUTE: IMMEDIATE ACTION PROTOCOL ACTIVE
              </p>
            </div>
            <span className="px-3 py-1 bg-white border border-outline-variant rounded-lg text-primary text-[9px] font-black uppercase tracking-wider">
              {data.urgency || 'HIGH'}
            </span>
          </div>
        )}

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-margin">
          
          {/* Left Column (2/3 width): Complaint text & attachments */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header / User Info */}
            <div className="bg-surface-container p-lg rounded-xl flex justify-between items-start border border-outline-variant/10">
              <div className="flex gap-md">
                <div className="w-16 h-16 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container border border-outline-variant/10">
                  <span className="material-symbols-outlined text-4xl">person</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-on-surface text-lg font-bold">{customerName}</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Tier: Gold Member • 12 Orders</p>
                  <div className="flex gap-xs mt-2 flex-wrap">
                    <span className="bg-error text-white px-3 py-1 rounded-full text-[10px] uppercase font-bold">{data.urgency || 'MEDIUM'}</span>
                    <span className="bg-secondary text-white px-3 py-1 rounded-full text-[10px] uppercase font-bold">{data.category || 'FEEDBACK'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-on-surface-variant">Submitted via Mobile App</p>
                <p className="font-bold text-sm text-on-surface mt-1">{new Date(data.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Customer Quote Block */}
            <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-lg space-y-4 relative overflow-hidden">
              <label className="font-label-lg text-primary uppercase text-xs font-black tracking-wider block">Customer Message</label>
              <blockquote className="font-body-lg text-on-surface leading-relaxed italic text-base">
                "{data.rawText}"
              </blockquote>
              {/* Ticket Visual Edge */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-surface ticket-edge" style={{ maskImage: "radial-gradient(circle at 10px 100%, transparent 10px, white 10px)", maskSize: "20px 100%" }}></div>
            </section>

            {/* Evidence / Attachments */}
            <section className="space-y-4">
              <label className="font-label-lg text-on-surface-variant uppercase text-xs font-black tracking-wider block">Evidence Provided</label>
              <div className="grid grid-cols-3 gap-sm">
                <div className="aspect-square bg-surface-container rounded-lg overflow-hidden relative group cursor-zoom-in border border-outline-variant/10">
                  <img className="w-full h-full object-cover" alt="Burnt sliders" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAwFZ6bGlImXvdqWc-AgRsyKLVS9mmqnEXRMG_cKasdbykZYowmkq0n0t4nrCswHnqjrhNp9ReQlE-u8iAfChylEQ5ov1hH24CV36s42rAMtEAP1V05Yjk29KaKwV6GMZwJq27S4wTRre5iYQCmMK_VnypPYUJmLOWoHgmpZwi_sxko2f10-4onOttHQHzWGHvAbtCJt7m2cUAUgjmGBpCF-44KHlfjdB_s3JwJlIDWaL1vlNnNAxvMMYe0Te98u-dZnXsIWE9wKY"/>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">zoom_in</span>
                  </div>
                </div>
                <div className="aspect-square bg-surface-container rounded-lg overflow-hidden relative group cursor-zoom-in border border-outline-variant/10">
                  <img className="w-full h-full object-cover" alt="Risotto temperature" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzw49fSprkj8YS3ZOV-_GwRlXzTR-HKccd4fFklbJRySaDU-_0krR7FB_xpwukr2a_a1lcrOQrlvuf67ZiPbj27CQoi0SgQkfw3_tWdmDrXPJD-c0mbfe2vNebLHW2RRuYhLDtoj2Bj0gAnbkp2GslEyRZKKUznkbzf1rdjMBJy_89e41UbTFWGbjKxAz67r5lH7vgvmsgIz9aSm0je-dCx5JOH-R2BMrroLTNGJZfsbmKEYkAfjropy0LeYduIBnN930dnALwRSM"/>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">zoom_in</span>
                  </div>
                </div>
                <div className="aspect-square bg-surface-container rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-on-surface-variant gap-xs">
                  <span className="material-symbols-outlined text-3xl">receipt</span>
                  <span className="font-label-sm text-xs font-bold">Receipt.pdf</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column (1/3 width): AI Diagnostics & Actions */}
          <div className="space-y-8">
            {/* AI Insights Section */}
            <div className="bg-surface-container rounded-xl p-md border border-outline-variant/10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-sm opacity-5">
                <span className="material-symbols-outlined text-6xl">psychology</span>
              </div>
              <div className="flex items-center gap-sm mb-md text-primary font-bold">
                <span className="material-symbols-outlined font-variation-settings-fill">auto_awesome</span>
                <span className="font-label-lg uppercase text-xs tracking-wider">Gemini AI Diagnostics</span>
              </div>
              <div className="space-y-md text-xs">
                <p className="leading-relaxed">
                  <strong className="text-primary text-[10px] uppercase block tracking-wider mb-0.5">Identified Issue:</strong> {data.summary || data.rawText}
                </p>
                <p className="leading-relaxed">
                  <strong className="text-primary text-[10px] uppercase block tracking-wider mb-0.5">Sentiment Profile:</strong> <span className="text-error font-bold">Negative / Frustrated</span>
                </p>
                <div className="bg-primary-fixed p-sm rounded-lg mt-3">
                  <p className="font-label-sm text-on-primary-fixed-variant text-[10px] font-black uppercase">RECOMMENDED ACTION:</p>
                  <p className="font-body-md text-on-primary-fixed mt-1 italic font-medium leading-relaxed">"Issue full refund + $20 loyalty credit to offset anniversary disappointment."</p>
                </div>
              </div>
            </div>

            {/* Resolution Controls */}
            <div className="bg-surface-container rounded-xl p-md border border-outline-variant/10 shadow-sm space-y-md flex flex-col">
              <label className="font-label-lg text-on-surface-variant uppercase text-xs font-black tracking-wider block">Resolution Controls</label>
              
              {success && (
                <div className="bg-[#E6F4EA] border border-[#137333] text-[#137333] font-bold text-xs p-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>{success}</span>
                </div>
              )}

              <div className="space-y-sm">
                <button 
                  onClick={handleResolve}
                  disabled={resolving || data.isResolved}
                  className={`w-full py-4 rounded-full font-display-md text-sm flex items-center justify-center gap-sm transition-transform active:scale-95 shadow-sm font-bold uppercase ${
                    data.isResolved ? 'bg-[#eae2d0] text-[#7c544e]/50 cursor-not-allowed' : 'bg-primary text-white hover:brightness-110'
                  }`}
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  {data.isResolved ? 'RESOLVED' : 'MARK AS RESOLVED'}
                </button>
                <button 
                  onClick={handleResolve}
                  disabled={data.isResolved}
                  className="w-full border-2 border-on-surface-variant text-on-surface-variant font-label-lg py-4 rounded-full hover:bg-surface-container-high transition-colors text-xs font-bold uppercase tracking-widest active:scale-95"
                >
                  Refund Customer
                </button>
                <button className="w-full border-2 border-on-surface-variant text-on-surface-variant font-label-lg py-4 rounded-full hover:bg-surface-container-high transition-colors text-xs font-bold uppercase tracking-widest active:scale-95">
                  Transfer to Manager
                </button>
              </div>
            </div>

            {/* Associated Profiles */}
            <section className="bg-surface-container rounded-xl p-md border border-outline-variant/10 shadow-sm space-y-6">
              <h3 className="font-sora text-sm font-black text-primary uppercase tracking-wider text-xs">Associated Profiles</h3>
              
              {/* Restaurant Profile */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">Restaurant Outlet</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pastel-mint border-2 border-black rounded-xl flex items-center justify-center font-bold text-sm">
                    {restInitials}
                  </div>
                  <div>
                    <Link href={`/admin/restaurants/${data.restaurantId}`} className="font-black text-xs text-primary hover:underline">{data.restaurant.name}</Link>
                    <p className="text-[9px] font-bold text-secondary/50 uppercase tracking-wider">Active Partner</p>
                  </div>
                </div>
              </div>

              {/* Customer Profile */}
              <div className="space-y-3 pt-4 border-t border-outline-variant/30">
                <h4 className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">Customer Profile</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pastel-yellow border-2 border-black rounded-full flex items-center justify-center font-bold text-sm">
                    {customerInitials}
                  </div>
                  <div>
                    <p className="font-black text-xs text-primary">{customerName}</p>
                    <p className="text-[9px] font-bold text-secondary/50">{data.customer?.email || 'No email'}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>
    </>
  );
}
