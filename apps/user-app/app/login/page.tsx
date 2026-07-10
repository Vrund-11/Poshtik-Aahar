'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginCustomerSchema } from '@foodmart/shared';
import { useAuthStore } from '../stores/authStore';

type LoginFormValues = typeof loginCustomerSchema._input;

export default function LoginPage() {
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginCustomerSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError('');
    setSubmitting(true);
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      setSubmitting(false);
    }
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="font-hanken text-on-surface bg-background min-h-screen relative w-full flex flex-col justify-center items-center p-gutter">
      {/* MOBILE VIEW */}
      <div className="block md:hidden w-full max-w-[480px] flex flex-col items-center">
        {/* Brand Header */}
        <header className="mb-12 text-center">
          <h1 className="font-display-md text-display-md text-primary mb-2 tracking-tighter uppercase">foodmood</h1>
          <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest">Restaurant OS</p>
        </header>

        {/* Form Card */}
        <section className="w-full bg-surface-container-low p-margin rounded-xl shadow-[0_4px_20px_rgba(176,47,0,0.15)] border border-surface-variant/50">
          <div className="mb-lg">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2 uppercase">Welcome back</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Please enter your credentials to access your dashboard.</p>
          </div>

          {error && (
            <div className="bg-accent-red/10 border-2 border-accent-red text-accent-red font-bold text-xs p-4 rounded-xl flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-md" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Input */}
            <div className="flex flex-col gap-base">
              <label className="font-display-lg text-[12px] leading-none uppercase tracking-wider text-on-surface ml-4" htmlFor="email-mobile">Email Address</label>
              <div className="relative group">
                <input 
                  className={`w-full h-14 px-6 rounded-full border-2 ${errors.email ? 'border-accent-red' : 'border-secondary'} text-on-surface bg-surface-container-lowest focus:ring-4 focus:ring-primary-container/20 focus:border-primary transition-all outline-none font-body-md text-body-md`} 
                  id="email-mobile" 
                  placeholder="chef@foodmood.io" 
                  type="email"
                  {...register('email')}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant group-focus-within:text-primary">mail</span>
              </div>
              {errors.email && (
                <p className="text-xs text-accent-red ml-4 font-bold">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-base">
              <div className="flex justify-between items-end px-4">
                <label className="font-display-lg text-[12px] leading-none uppercase tracking-wider text-on-surface" htmlFor="password-mobile">Password</label>
                <a className="font-label-sm text-label-sm text-primary hover:underline transition-all" href="#">Forgot Password?</a>
              </div>
              <div className="relative group">
                <input 
                  className={`w-full h-14 px-6 pr-14 rounded-full border-2 ${errors.password ? 'border-accent-red' : 'border-secondary'} text-on-surface bg-surface-container-lowest focus:ring-4 focus:ring-primary-container/20 focus:border-primary transition-all outline-none font-body-md text-body-md`} 
                  id="password-mobile" 
                  placeholder="••••••••" 
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                />
                <button 
                  className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-all bg-transparent border-none" 
                  onClick={togglePassword} 
                  type="button"
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-accent-red ml-4 font-bold">{errors.password.message}</p>
              )}
            </div>

            {/* Login CTA */}
            <div className="pt-sm">
              <button 
                className="w-full h-16 bg-primary-container text-on-primary-container font-headline-sm text-headline-sm rounded-full active:scale-[0.98] hover:brightness-110 transition-all duration-200 flex items-center justify-center gap-2" 
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Logging in...' : 'Login'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </form>
        </section>

        {/* Footer Links */}
        <footer className="mt-lg text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Don't have an account? 
            <Link className="text-primary font-bold hover:underline transition-all decoration-2 underline-offset-4 ml-1" href="/register">Register</Link>
          </p>
        </footer>

        {/* Atmospheric Decor Elements */}
        <div className="absolute top-0 right-0 -z-10 opacity-40 mix-blend-multiply pointer-events-none">
          <div className="w-[300px] h-[300px] bg-[#FDBA74]/30 blur-3xl rounded-full"></div>
        </div>
        <div className="absolute bottom-0 left-0 -z-10 opacity-30 mix-blend-multiply pointer-events-none">
          <div className="w-[300px] h-[300px] bg-[#E9D5FF]/30 blur-3xl rounded-full"></div>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block w-full max-w-[480px] relative">
        {/* Top Left Brand Anchor */}
        <div className="fixed top-margin left-margin z-10">
          <h1 className="font-display-md text-display-md text-primary tracking-tighter uppercase">foodmood</h1>
        </div>

        {/* Background Decor Element (Subtle Abstract Blur) */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-container opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary-container opacity-20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Login Card */}
        <section className="bg-surface-container-lowest shadow-[0_20px_40px_-12px_rgba(62,31,26,0.08)] rounded-xl p-8 md:p-12 relative overflow-hidden">
          {/* Header Section */}
          <header className="mb-10">
            <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase mb-2">Welcome back</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Your culinary command center awaits.</p>
          </header>

          {error && (
            <div className="bg-accent-red/10 border-2 border-accent-red text-accent-red font-bold text-xs p-4 rounded-xl flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Input */}
            <div className="space-y-2">
              <label className="font-headline-sm text-label-sm text-on-surface-variant uppercase block px-4" htmlFor="email-desktop">
                Email Address
              </label>
              <div className={`relative flex items-center bg-surface-container-low border-2 ${errors.email ? 'border-accent-red' : 'border-secondary/10'} rounded-full px-6 py-4 transition-all focus-within:border-primary`}>
                <span className="material-symbols-outlined text-on-surface-variant mr-3">mail</span>
                <input 
                  className="bg-transparent border-none focus:ring-0 w-full font-body-md text-body-md text-on-surface placeholder:text-outline-variant outline-none" 
                  id="email-desktop" 
                  placeholder="chef@foodmood.io" 
                  type="email"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-accent-red ml-4 font-bold">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-4">
                <label className="font-headline-sm text-label-sm text-on-surface-variant uppercase block" htmlFor="password-desktop">
                  Password
                </label>
                <a className="font-label-sm text-label-sm text-primary hover:underline transition-all" href="#">Forgot?</a>
              </div>
              <div className={`relative flex items-center bg-surface-container-low border-2 ${errors.password ? 'border-accent-red' : 'border-secondary/10'} rounded-full px-6 py-4 transition-all focus-within:border-primary`}>
                <span className="material-symbols-outlined text-on-surface-variant mr-3">lock</span>
                <input 
                  className="bg-transparent border-none focus:ring-0 w-full font-body-md text-body-md text-on-surface placeholder:text-outline-variant outline-none" 
                  id="password-desktop" 
                  placeholder="••••••••" 
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                />
                <button 
                  className="text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none" 
                  onClick={togglePassword} 
                  type="button"
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-accent-red ml-4 font-bold">{errors.password.message}</p>
              )}
            </div>

            {/* CTA Section */}
            <div className="pt-4">
              <button 
                className="w-full bg-primary-container text-on-primary-container font-headline-lg text-headline-sm uppercase py-5 rounded-full shadow-lg shadow-primary-container/20 hover:brightness-110 active:scale-95 transition-all duration-300" 
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Authenticating...' : 'Login'}
              </button>
            </div>
          </form>

          {/* Redirect to Register */}
          <footer className="mt-10 pt-8 border-t border-outline-variant/30 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Don't have an account? 
              <Link className="text-primary font-bold hover:underline transition-all underline-offset-4 ml-1" href="/register">Register</Link>
            </p>
          </footer>

          {/* Ticket jagged edge at bottom */}
          <div 
            className="absolute bottom-0 left-0 w-full h-2 bg-surface-dim opacity-50" 
            style={{ 
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 95%, 98% 93%, 96% 95%, 94% 93%, 92% 95%, 90% 93%, 88% 95%, 86% 93%, 84% 95%, 82% 93%, 80% 95%, 78% 93%, 76% 95%, 74% 93%, 72% 95%, 70% 93%, 68% 95%, 66% 93%, 64% 95%, 62% 93%, 60% 95%, 58% 93%, 56% 95%, 54% 93%, 52% 95%, 50% 93%, 48% 95%, 46% 93%, 44% 95%, 42% 93%, 40% 95%, 38% 93%, 36% 95%, 34% 93%, 32% 95%, 30% 93%, 28% 95%, 26% 93%, 24% 95%, 22% 93%, 20% 95%, 18% 93%, 16% 95%, 14% 93%, 12% 95%, 10% 93%, 8% 95%, 6% 93%, 4% 95%, 2% 93%, 0% 95%)' 
            }}
          ></div>
        </section>

        {/* Side Graphics Card (Desktop only layout variation) */}
        <div className="hidden lg:block absolute -right-[400px] top-1/2 -translate-y-1/2 w-[340px]">
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary-container/10 rounded-xl blur-xl group-hover:bg-primary-container/20 transition-all duration-500"></div>
            <div className="aspect-[4/5] bg-surface-container-high rounded-xl overflow-hidden relative shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
              <img className="w-full h-full object-cover" alt="Plating a gourmet meal" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuNFMPzluxwtJFCAKWJzeXN63ayAfkcLqGVA5QXtm6Bwho36JvzFoyjvJb2LRLZiC-Km6SoBGqMZktIge0m_8029szZETN4kRl9W6W-gsjkuduxioWPD2CdWZvf8DfJf3jZkTFsfkazXOUehwMuzf8zaIBvZz2MVFAbedlPuyF7gboW2BdCuAsh4qNYKUvjUcS80iIykWEAtbDMnPwxNLRwPMGdN5oKtzx-NVwcIG4dtGxDQlfsi1ay_37gJCtxLETLxf93lUnb_s"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8">
                <span className="font-label-sm text-label-sm text-primary-fixed-dim uppercase tracking-widest mb-2">Service Standard</span>
                <p className="font-headline-sm text-headline-sm text-white leading-tight">Elevating every plate with precision.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="fixed bottom-margin w-full text-center left-0 px-gutter">
          <p className="font-label-sm text-label-sm text-outline uppercase tracking-widest opacity-60">
            Trusted by 2,000+ Michelin star kitchens worldwide
          </p>
        </div>
      </div>
    </div>
  );
}
