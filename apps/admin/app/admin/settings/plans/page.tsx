'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function DefaultPlansConfig() {
  // Plan Defaults state
  const [trialDays, setTrialDays] = useState(30);
  const [defaultTier, setDefaultTier] = useState('TRIAL');
  
  // Financial Defaults
  const [commissionRate, setCommissionRate] = useState(12.5);
  const [deliveryRadius, setDeliveryRadius] = useState(15);

  // Operational Defaults
  const [autoLoyalty, setAutoLoyalty] = useState(true);
  const [manualVerification, setManualVerification] = useState(false);

  // Feedback states
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'GROWTH' | 'ENTERPRISE'>('GROWTH');
  const [expiry, setExpiry] = useState('2027-07-07');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('Default subscription configurations updated successfully!');
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleIncrement = () => setTrialDays(prev => prev + 5);
  const handleDecrement = () => setTrialDays(prev => Math.max(1, prev - 5));

  return (
    <>
      {/* MOBILE VIEW */}
      <div className="flex md:hidden min-h-screen w-full flex-col bg-[#fff8f0] pb-32 text-[#1f1b10] font-sans antialiased">
        {/* Top App Bar */}
        <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 h-20 bg-[#fff8f0] shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/admin/settings" className="hover:opacity-80 transition-opacity flex items-center">
              <span className="material-symbols-outlined text-[#b02f00]">arrow_back</span>
            </Link>
            <h1 className="font-[Anton] text-[24px] text-[#b02f00] uppercase tracking-tighter">UMAMI OS</h1>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#b02f00]">
            <img className="w-full h-full object-cover" alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXEVlkXIV4P2TEmuvXP27EmDjNgVGMN4kGwUF9wuA2Zo2r-zw5QpQ5Np8mD61je1OvSGwRLHR5IwfjiLHLFNsipahU1z9130biIm76nIIgYVWS_6Pcsy-o_gD0CXmumHLMwefeX681ZjnsgkocfDwfWX1rRbcoIFmH8Sm-VM7Ii8STCR6WHLwA01Lxwmh765-ki9RNbI1vIFVnmswx1ix14Tb4Uo-MojbNZSnOO9lGQU0HZ0rhbcc2nrDumwlc0MSqKW-S_YWO708"/>
          </div>
        </header>

        <main className="px-6 pt-4 space-y-6">
          {/* Header */}
          <div>
            <p className="text-[11px] font-bold text-[#7c544e] uppercase mb-1">Upgrade Plan</p>
            <h2 className="font-[Anton] text-[32px] text-[#1f1b10] uppercase leading-none">PARTNER PROFILE</h2>
          </div>

          {success && (
            <div className="bg-[#D1FAE5] border border-[#16A34A] text-[#065F46] font-bold text-xs p-3 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* Subscription Plans */}
            <div className="space-y-3">
              <label className="text-[12px] font-bold text-[#5b4039] uppercase">Subscription Plan</label>
              
              {/* Plan 1 */}
              <div 
                onClick={() => setSelectedPlan('STARTER')}
                className={`p-4 rounded-xl border-2 flex justify-between items-center bg-white cursor-pointer active:scale-[0.98] transition-all ${selectedPlan === 'STARTER' ? 'bg-[#ff5722] border-[#ff5722] text-[#541200]' : 'border-[#5b4039] text-[#1f1b10]'}`}
              >
                <div>
                  <h4 className="font-bold text-[15px] uppercase">Starter Plan</h4>
                  <p className="text-[11px] opacity-75 mt-0.5">Best for single venues & testing</p>
                </div>
                <span className="font-[Anton] text-[18px]">$49/mo</span>
              </div>

              {/* Plan 2 */}
              <div 
                onClick={() => setSelectedPlan('GROWTH')}
                className={`p-4 rounded-xl border-2 flex justify-between items-center bg-white cursor-pointer active:scale-[0.98] transition-all ${selectedPlan === 'GROWTH' ? 'bg-[#ff5722] border-[#ff5722] text-[#541200]' : 'border-[#5b4039] text-[#1f1b10]'}`}
              >
                <div>
                  <h4 className="font-bold text-[15px] uppercase">Growth Plan</h4>
                  <p className="text-[11px] opacity-75 mt-0.5">Multiple locations & custom delivery</p>
                </div>
                <span className="font-[Anton] text-[18px]">$149/mo</span>
              </div>

              {/* Plan 3 */}
              <div 
                onClick={() => setSelectedPlan('ENTERPRISE')}
                className={`p-4 rounded-xl border-2 flex justify-between items-center bg-white cursor-pointer active:scale-[0.98] transition-all ${selectedPlan === 'ENTERPRISE' ? 'bg-[#ff5722] border-[#ff5722] text-[#541200]' : 'border-[#5b4039] text-[#1f1b10]'}`}
              >
                <div>
                  <h4 className="font-bold text-[15px] uppercase">Enterprise Plan</h4>
                  <p className="text-[11px] opacity-75 mt-0.5">High volume networks & APIs</p>
                </div>
                <span className="font-[Anton] text-[18px]">$399/mo</span>
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-[#5b4039] uppercase">Expiration Date</label>
              <input 
                className="w-full h-12 px-4 rounded-full border-2 border-[#5b4039] text-xs focus:ring-0 focus:border-[#b02f00]" 
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </div>

            {/* Kitchen Internal Notes */}
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-[#5b4039] uppercase">Kitchen Internal Notes</label>
              <textarea 
                rows={3}
                placeholder="E.g. Partner requested standard radius adjustments. Verify on next monthly call."
                className="w-full p-4 rounded-xl border-2 border-[#5b4039] text-xs focus:ring-0 focus:border-[#b02f00] placeholder:text-[#5b4039]/40" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <button 
                type="submit"
                className="w-full h-14 bg-[#b02f00] text-white rounded-full font-[Anton] text-[18px] uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                Confirm Plan Update
              </button>
              <Link 
                href="/admin/settings"
                className="w-full h-12 border-2 border-[#5b4039] rounded-full font-bold text-[12px] uppercase text-[#1f1b10] flex items-center justify-center hover:bg-[#f6eddb] transition-all active:scale-95"
              >
                Discard Changes
              </Link>
            </div>
          </form>
        </main>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block space-y-10 pb-24 font-hanken">
      {/* Return Navigation */}
      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black bg-white rounded-full font-sora text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 active-chunky transition-all"
        >
          <span className="material-symbols-outlined text-xs font-bold">arrow_back</span>
          <span>Back to Settings</span>
        </Link>
      </div>

      {/* Page Header */}
      <div>
        <h2 className="font-sora text-3xl font-black text-primary tracking-tight">Default Subscription Settings</h2>
        <p className="font-hanken text-sm text-secondary/60 font-bold mt-1">Adjust parameters governing default plan packages and financial rules for new partner accounts.</p>
      </div>

      {success && (
        <div className="bg-pastel-mint border-2 border-black text-primary font-bold text-xs p-4 rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined font-black">check_circle</span>
          <span>{success}</span>
        </div>
      )}

      {/* Global Impact Warning Banner */}
      <div className="bg-accent-red/10 border-4 border-black p-5 rounded-3xl flex items-start gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="w-10 h-10 rounded-xl bg-accent-red border-2 border-black flex items-center justify-center text-white font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
          <span className="material-symbols-outlined text-xl">warning</span>
        </div>
        <div className="space-y-1">
          <h4 className="font-sora text-xs font-black uppercase tracking-widest text-accent-red">GLOBAL IMPACT WARNING</h4>
          <p className="font-hanken text-xs font-bold text-primary">
            Settings configured here will affect onboarding scripts, automated trial expirations, and delivery radius calculations for all future registered restaurant accounts.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Trial & Subscription Defaults */}
        <div className="space-y-8">
          {/* Trial & Subscription Package */}
          <section className="bg-white border-4 border-black rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 space-y-6">
            <h3 className="font-sora text-base font-black text-primary uppercase">Trial & Subscription Package</h3>
            
            <div className="space-y-4">
              {/* Stepper Duration */}
              <div className="space-y-2">
                <label className="font-hanken font-extrabold text-[10px] text-primary">DEFAULT TRIAL DURATION</label>
                <div className="flex items-center max-w-xs">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="px-4 py-3.5 bg-white border-2 border-black border-r-0 rounded-l-xl font-black text-xs hover:bg-pastel-peach active:bg-pastel-peach/80 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    readOnly
                    value={`${trialDays} Days`}
                    className="w-full text-center py-3.5 border-2 border-black bg-[#fbfbfb] font-black text-xs text-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="px-4 py-3.5 bg-white border-2 border-black border-l-0 rounded-r-xl font-black text-xs hover:bg-pastel-mint active:bg-pastel-mint/80 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Onboard Package Tier selection */}
              <div className="space-y-2 max-w-xs">
                <label className="font-hanken font-extrabold text-[10px] text-primary">DEFAULT ONBOARDING PLAN TIER</label>
                <div className="relative">
                  <select
                    value={defaultTier}
                    onChange={(e) => setDefaultTier(e.target.value)}
                    className="appearance-none w-full bg-[#fbfbfb] border-2 border-black rounded-xl py-3 px-4 font-hanken text-xs font-bold focus:outline-none focus:ring-4 focus:ring-pastel-mint"
                  >
                    <option value="TRIAL">Trial Tier (Starter)</option>
                    <option value="BASIC">Basic Package (Growth)</option>
                    <option value="GROWTH">Growth Package (Elite)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black font-bold">expand_more</span>
                </div>
              </div>
            </div>
          </section>

          {/* Operational Protocols */}
          <section className="bg-white border-4 border-black rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 space-y-6">
            <h3 className="font-sora text-base font-black text-primary uppercase">Operational Protocols</h3>
            
            <div className="space-y-5">
              {/* Toggle switch 1 */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-primary text-xs">Auto-enable Loyalty Program</h4>
                  <p className="text-[10px] font-bold text-secondary/40 font-hanken mt-0.5">Automatically activate point-based loyalty configs for new nodes.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoLoyalty(!autoLoyalty)}
                  className={`w-14 h-8 border-2 border-black rounded-full p-1 transition-colors ${autoLoyalty ? 'bg-pastel-mint' : 'bg-gray-200'}`}
                >
                  <div className={`w-5.5 h-5.5 bg-white border-2 border-black rounded-full transition-transform ${autoLoyalty ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              {/* Toggle switch 2 */}
              <div className="flex items-center justify-between pt-4 border-t border-black/10">
                <div>
                  <h4 className="font-black text-primary text-xs">Manual Document Verification</h4>
                  <p className="text-[10px] font-bold text-secondary/40 font-hanken mt-0.5">Hold new restaurants in pending state until owner documents are audited.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setManualVerification(!manualVerification)}
                  className={`w-14 h-8 border-2 border-black rounded-full p-1 transition-colors ${manualVerification ? 'bg-pastel-mint' : 'bg-gray-200'}`}
                >
                  <div className={`w-5.5 h-5.5 bg-white border-2 border-black rounded-full transition-transform ${manualVerification ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Financial Defaults */}
        <div className="space-y-8">
          <section className="bg-white border-4 border-black rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 space-y-6">
            <h3 className="font-sora text-base font-black text-primary uppercase">Financial Defaults</h3>
            
            <div className="space-y-6">
              {/* Commission input */}
              <div className="space-y-2">
                <label className="font-hanken font-extrabold text-[10px] text-primary">COMMISSION RATE PERCENTAGE (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step={0.1}
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                    className="w-full px-4 py-3.5 border-2 border-black rounded-xl text-xs font-black text-primary focus:outline-none focus:ring-4 focus:ring-pastel-mint"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs text-secondary/45">%</span>
                </div>
              </div>

              {/* Delivery radius input */}
              <div className="space-y-2">
                <label className="font-hanken font-extrabold text-[10px] text-primary">MAXIMUM DELIVERY RADIUS CAP (KM)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={deliveryRadius}
                    onChange={(e) => setDeliveryRadius(parseInt(e.target.value))}
                    className="w-full px-4 py-3.5 border-2 border-black rounded-xl text-xs font-black text-primary focus:outline-none focus:ring-4 focus:ring-pastel-mint"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs text-secondary/45">KM</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky Action Footer */}
        <div className="fixed bottom-0 left-0 md:left-72 right-0 bg-white border-t-4 border-black p-4 z-20 flex justify-end gap-4 shadow-[0px_-4px_10px_0px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={() => {
              setTrialDays(30);
              setDefaultTier('TRIAL');
              setCommissionRate(12.5);
              setDeliveryRadius(15);
              setAutoLoyalty(true);
              setManualVerification(false);
            }}
            className="px-6 py-3 border-2 border-black bg-white hover:bg-pastel-peach rounded-full font-sora text-xs font-black uppercase tracking-wider transition-all active:scale-95"
          >
            Discard
          </button>
          
          <button
            type="submit"
            className="px-8 py-3 bg-black hover:bg-gray-800 text-white border-2 border-black rounded-full font-sora text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-all text-center"
          >
            Save Default Settings
          </button>
        </div>

      </form>
      </div>
    </>
  );
}
