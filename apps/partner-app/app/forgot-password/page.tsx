'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@foodmart/shared';
import Link from 'next/link';

export default function PartnerForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.add('auth-page-active');
    return () => {
      document.body.classList.remove('auth-page-active');
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      const res: any = await api.post('/api/v1/auth/forgot-password', { email });
      if (res && res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Failed to request reset link.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page w-full min-h-screen md:h-screen md:max-h-screen md:overflow-hidden bg-[#fff8f0] relative select-none">
      
      {/* MOBILE VIEW */}
      <div className="flex md:hidden min-h-screen w-full flex-col justify-center items-center p-6 bg-[#fff8f0] relative">
        {/* Header / Brand Anchor */}
        <header className="fixed top-0 left-0 w-full bg-[#fff8f0] flex justify-between items-center px-6 py-3 z-50">
          <div className="flex items-center gap-3">
            <Link className="text-[#b02f00] hover:opacity-80 transition-opacity active:scale-95 flex items-center" href="/login">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
          </div>
          <div className="font-[Anton] text-[28px] text-[#b02f00] uppercase tracking-tighter">
            UMAMI OS
          </div>
          <div className="w-10 h-10"></div> {/* Spacer for balance */}
        </header>

        <main className="flex-grow flex flex-col items-center justify-center px-6 py-8 relative z-10 w-full max-w-[480px] mt-16">
          {/* Central Container */}
          <div className="w-full bg-[#fcf3e1] rounded-2xl p-6 soft-umami-shadow border border-[#e4beb4] relative overflow-hidden z-10">
            {/* Contextual Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#fdc8bf] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#b02f00] text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
              </div>
            </div>
            {/* Typography & Messaging */}
            <div className="text-center mb-8">
              <h1 className="font-[Anton] text-[32px] text-[#1f1b10] mb-1 uppercase">Forgot Password?</h1>
              <p className="text-[#5b4039] font-sans text-[16px]">Enter your registered email below to receive a magic reset link.</p>
            </div>

            {error && (
              <div className="bg-[#ffdad6] border-[2px] border-black text-[#93000a] font-bold text-xs p-3 rounded-2xl flex items-center gap-2 mb-4 w-full text-left">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-[#D1FAE5] border-[2px] border-[#16A34A] text-black font-bold text-xs p-3 rounded-2xl flex items-center gap-2 mb-4 w-full text-left">
                <span className="material-symbols-outlined text-[#16A34A] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span>Check your email. The link expires in 5 minutes.</span>
              </div>
            )}

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="font-[Anton] text-[14px] text-[#1f1b10] uppercase tracking-wider ml-3" htmlFor="email-mobile">
                  Restaurant Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[#907067]">alternate_email</span>
                  </div>
                  <input 
                    className="w-full pl-14 pr-6 py-4 bg-[#ffffff] border-2 border-[#5b4039] rounded-full font-sans text-[#1f1b10] placeholder:text-[#907067]/50 focus:border-[#b02f00] focus:ring-0 outline-none transition-all duration-200" 
                    id="email-mobile" 
                    name="email" 
                    placeholder="chef@umami.com" 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              {/* Call to Action */}
              <button 
                className="w-full py-4 bg-[#b02f00] text-white font-[Anton] text-[20px] rounded-full shadow-lg hover:bg-[#862200] transition-all duration-200 btn-active-scale uppercase mt-2 flex items-center justify-center gap-2" 
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'SENDING...' : 'Send Reset Link'}</span>
              </button>
            </form>
            {/* Secondary Action */}
            <div className="mt-8 text-center">
              <Link className="text-[#b02f00] font-semibold text-[14px] hover:underline decoration-2 underline-offset-4 transition-all" href="/login">
                Return to Login
              </Link>
            </div>
          </div>
          {/* Support Text */}
          <p className="mt-8 text-center text-[#5b4039] text-[12px] uppercase tracking-widest max-w-xs mx-auto">
            Need emergency kitchen assistance? <br/> Contact <span className="text-[#b02f00] font-bold">UMAMI Support</span>
          </p>
          {/* Decorative Visual: Abstract hospitality/kitchen image */}
          <div className="mt-8 w-full max-w-sm h-32 rounded-lg overflow-hidden relative grayscale opacity-30 mix-blend-multiply pointer-events-none">
            <img className="w-full h-full object-cover" alt="Chef preparing sauce" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnykduCNB39YuJM755joiMnC7cIDTNHMAjVDSaGc-Ig0LKAt2hjFyV3PCfkCb3S7p5oarYK0L2Ezq60A0PgdTHG78LRx5wKJFQRQDandKKc9Gb6PDHkV5G0EkwiEP7w7oKluCGk-LGOM1xz6bnvJgywz3AO1qgD42P3AypOBFkpMvFB51t4N2DAItaU02cJUFlEqTvMDA_dwxTWTWBRSacg5FfoeNekJ7PYMwUs16eILBn7j28hLR83i9hAnlD0qEBMli5kk6_G0A"/>
          </div>
        </main>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:flex min-h-screen w-full items-center justify-center p-gutter bg-[#fff8f0] relative">
        {/* Background Atmospheric Effect */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary-container/20 blur-[120px]"></div>
          <div className="absolute -bottom-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-primary-container/10 blur-[100px]"></div>
        </div>

        <main className="relative w-full max-w-md z-10">
          {/* Logo / Brand Anchor */}
          <div className="flex justify-center mb-lg">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
              <span className="font-display-md text-display-md text-primary tracking-tight">Umami</span>
            </div>
          </div>

          {/* Reset Card */}
          <section className="bg-surface-container rounded-xl p-lg umami-shadow border-0 relative overflow-hidden">
            {/* Subtle Decorative Grain/Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')" }}></div>
            <div className="relative z-10">
              <header className="mb-lg">
                <h1 className="font-display-md text-display-md text-on-surface mb-xs">Reset your password</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">Enter your email and we'll send a reset link</p>
              </header>

              {error && (
                <div className="bg-[#ffdad6] border-[2px] border-black text-[#93000a] font-bold text-xs p-3 rounded-2xl flex items-center gap-2 mb-4 w-full text-left">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-[#D1FAE5] border-[2px] border-black text-black font-bold text-xs p-3 rounded-2xl flex items-center gap-2 mb-4 w-full text-left">
                  <span className="material-symbols-outlined text-[#16A34A] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span>Reset instructions sent. Please check your inbox.</span>
                </div>
              )}

              <form className="space-y-md" onSubmit={handleSubmit}>
                {/* Input Group */}
                <div className="space-y-xs">
                  <label className="font-label-lg text-label-lg text-on-surface-variant uppercase ml-xs" htmlFor="email-desktop">
                    Email Address
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full h-16 px-md bg-surface border-2 border-inverse-surface rounded-full font-body-md text-body-md focus:ring-4 focus:ring-primary-container/20 focus:border-primary outline-none transition-all placeholder:text-outline-variant" 
                      id="email-desktop" 
                      placeholder="chef@umami-kitchen.com" 
                      required 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant">
                      alternate_email
                    </span>
                  </div>
                </div>
                {/* CTA Button */}
                <button 
                  className="w-full bg-primary-container text-on-primary-container font-display-md text-[24px] h-16 rounded-full btn-press shadow-lg shadow-primary-container/20 flex items-center justify-center gap-sm hover:bg-primary transition-colors group"
                  type="submit"
                  disabled={loading}
                >
                  <span>{loading ? 'SENDING...' : 'Send Reset Link'}</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </form>

              {/* Footer Navigation */}
              <footer className="mt-lg pt-md border-t border-outline-variant/30 flex flex-col items-center gap-md">
                <Link className="flex items-center gap-xs font-label-lg text-label-lg text-primary hover:underline group" href="/login">
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back to Login
                </Link>
              </footer>
            </div>
            {/* "Ticket" Decoration at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-surface-container-high opacity-50 ticket-edge"></div>
          </section>

          {/* Decorative Info Card (Bento Style) */}
          <div className="mt-md grid grid-cols-2 gap-md">
            <div className="bg-surface-container-low p-md rounded-lg flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">security</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface">Secure SSL</span>
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">Encrypted</span>
              </div>
            </div>
            <div className="bg-surface-container-low p-md rounded-lg flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary text-[20px]">support_agent</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface">Need Help?</span>
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">24/7 Support</span>
              </div>
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}
