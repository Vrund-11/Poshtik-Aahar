'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@foodmart/shared';

export default function SetupRestaurant() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [plan, setPlan] = useState<'BASIC' | 'GROWTH'>('GROWTH');
  const [expiryDate, setExpiryDate] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Set default expiry date to 1 year from now
  useEffect(() => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    setExpiryDate(futureDate.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Calculate duration in days
    const diffTime = new Date(expiryDate).getTime() - Date.now();
    const planDurationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    try {
      const res: any = await api.post('/api/v1/admin/restaurants', {
        name,
        ownerName,
        ownerEmail,
        ownerPhone,
        plan,
        planDurationDays,
      });

      if (res.success) {
        setSuccessMsg(`Onboarded successfully! Generated Owner Password: ${res.data.owner.temporaryPassword}`);
        setName('');
        setOwnerName('');
        setOwnerEmail('');
        setOwnerPhone('');
        setTimeout(() => {
          router.push('/admin/restaurants');
        }, 4000);
      } else {
        setErrorMsg(res.message || 'Failed to create restaurant.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f0] pb-24 text-[#1f1b10] font-sans antialiased">
      {/* Mobile Top Navbar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 h-20 bg-[#fff8f0] shadow-sm">
        <Link href="/admin/restaurants" className="flex items-center gap-2 text-[#b02f00] p-2 -ml-2 active:scale-95 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-bold text-[14px] uppercase">Back to Fleet</span>
        </Link>
        <span className="font-[Anton] text-[24px] text-[#b02f00] uppercase tracking-tighter">UMAMI OS</span>
      </header>

      <main className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Title Section */}
        <div className="space-y-1">
          <h1 className="font-[Anton] text-[32px] text-[#b02f00] uppercase leading-none">New Restaurant</h1>
          <p className="text-[#5b4039] text-[15px]">Onboard a fresh flavor to the Umami ecosystem.</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2">
          <div className="h-1 flex-1 bg-[#b02f00] rounded-full"></div>
          <div className="h-1 flex-1 bg-[#eae2d0] rounded-full"></div>
          <div className="h-1 flex-grow bg-[#eae2d0] rounded-full"></div>
        </div>

        {errorMsg && (
          <div className="bg-[#ffdad6] border-2 border-black text-[#ba1a1a] font-bold text-xs p-4 rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-[#D1FAE5] border-2 border-[#16A34A] text-black font-bold text-xs p-4 rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#16A34A] font-black">check_circle</span>
              <span className="font-bold">CREATION SUCCESSFUL!</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#065F46] font-medium">{successMsg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity Group */}
          <div className="relative bg-[#fcf3e1] p-4 rounded-xl space-y-4 soft-umami-shadow border border-[#e4beb4]">
            <div className="space-y-1">
              <label className="block text-[12px] font-bold text-[#5b4039] uppercase" htmlFor="restaurant_name">Restaurant Name</label>
              <input 
                className="w-full h-12 px-4 bg-white border-2 border-[#5b4039] rounded-full focus:ring-2 focus:ring-[#b02f00] focus:border-[#b02f00] outline-none text-sm transition-all" 
                id="restaurant_name" 
                placeholder="e.g. The Sizzling Skillet" 
                required 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[12px] font-bold text-[#5b4039] uppercase" htmlFor="owner_name">Legal Owner</label>
              <input 
                className="w-full h-12 px-4 bg-white border-2 border-[#5b4039] rounded-full focus:ring-2 focus:ring-[#b02f00] focus:border-[#b02f00] outline-none text-sm transition-all" 
                id="owner_name" 
                placeholder="Full name of primary stakeholder" 
                required 
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[12px] font-bold text-[#5b4039] uppercase" htmlFor="contact_email">Contact Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#7c544e]">mail</span>
                <input 
                  className="w-full h-12 pl-12 pr-4 bg-white border-2 border-[#5b4039] rounded-full focus:ring-2 focus:ring-[#b02f00] focus:border-[#b02f00] outline-none text-sm transition-all" 
                  id="contact_email" 
                  placeholder="owner@restaurant.com" 
                  required 
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[12px] font-bold text-[#5b4039] uppercase" htmlFor="owner_phone">Owner Phone</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#7c544e]">phone</span>
                <input 
                  className="w-full h-12 pl-12 pr-4 bg-white border-2 border-[#5b4039] rounded-full focus:ring-2 focus:ring-[#b02f00] focus:border-[#b02f00] outline-none text-sm transition-all" 
                  id="owner_phone" 
                  placeholder="+1 (555) 019-2834" 
                  required 
                  type="tel"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[12px] font-bold text-[#5b4039] uppercase">Subscription Plan</label>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  onClick={() => setPlan('GROWTH')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl bg-white cursor-pointer active:scale-95 transition-all ${plan === 'GROWTH' ? 'bg-[#ff5722] border-[#ff5722] text-[#541200]' : 'border-[#5b4039] text-[#1f1b10]'}`}
                >
                  <span className="material-symbols-outlined mb-1">auto_awesome</span>
                  <span className="text-[12px] font-bold">Premium</span>
                </div>
                <div 
                  onClick={() => setPlan('BASIC')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl bg-white cursor-pointer active:scale-95 transition-all ${plan === 'BASIC' ? 'bg-[#ff5722] border-[#ff5722] text-[#541200]' : 'border-[#5b4039] text-[#1f1b10]'}`}
                >
                  <span className="material-symbols-outlined mb-1">restaurant_menu</span>
                  <span className="text-[12px] font-bold">Standard</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[12px] font-bold text-[#5b4039] uppercase" htmlFor="expiry_date">Plan Expiry</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#7c544e]">calendar_today</span>
                <input 
                  className="w-full h-12 pl-12 pr-4 bg-white border-2 border-[#5b4039] rounded-full focus:ring-2 focus:ring-[#b02f00] focus:border-[#b02f00] outline-none text-sm transition-all" 
                  id="expiry_date" 
                  required 
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <button 
              className="w-full h-14 bg-[#ff5722] text-[#541200] rounded-full font-[Anton] text-[18px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#b02f00] hover:text-white transition-all active:scale-95 shadow-md" 
              type="submit"
              disabled={submitting}
            >
              <span>{submitting ? 'ONBOARDING...' : 'Create Restaurant'}</span>
              <span className="material-symbols-outlined">rocket_launch</span>
            </button>
            <Link 
              href="/admin/restaurants" 
              className="w-full h-12 border-2 border-[#5b4039] rounded-full font-bold text-[12px] uppercase text-[#1f1b10] flex items-center justify-center hover:bg-[#f6eddb] transition-all active:scale-95"
            >
              Cancel Registration
            </Link>
          </div>
        </form>
      </main>

      {/* Decorative Bottom Asset */}
      <div className="fixed bottom-0 left-0 w-full h-2 overflow-hidden flex pointer-events-none z-50">
        <div className="w-1/3 bg-[#b02f00]"></div>
        <div className="w-1/3 bg-[#ff5722]"></div>
        <div className="w-1/3 bg-[#7c544e]"></div>
      </div>
    </div>
  );
}
