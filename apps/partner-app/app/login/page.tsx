'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginStaffSchema } from '@foodmart/shared';
import { useRouter } from 'next/navigation';

type LoginFormValues = typeof loginStaffSchema._input;

export default function PartnerLoginPage() {
  const { login, user } = useAuthStore();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginStaffSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleRouteRedirect = (role: string) => {
    if (role === 'ADMIN') {
      window.location.href = 'http://localhost:7070/admin';
    } else if (role === 'OWNER') {
      router.push('/owner');
    } else if (role === 'MANAGER') {
      router.push('/manager');
    } else if (role === 'CHEF') {
      router.push('/kitchen');
    }
  };

  useEffect(() => {
    document.body.classList.add('auth-page-active');
    
    // If user is already loaded, redirect to appropriate console
    if (user) {
      handleRouteRedirect(user.role);
    }

    return () => {
      document.body.classList.remove('auth-page-active');
    };
  }, [user]);

  const onSubmit = async (data: LoginFormValues) => {
    setError('');
    setLoading(true);

    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page w-full min-h-screen md:h-screen md:max-h-screen md:overflow-hidden bg-[#fff8f0] relative select-none">
      
      {/* MOBILE VIEW */}
      <div className="flex md:hidden min-h-screen w-full flex-col justify-center items-center p-6 bg-[#fff8f0] relative">
        {/* Main Content Canvas */}
        <main className="w-full max-w-[480px] flex flex-col justify-center z-10">
          {/* Header / Branding Area */}
          <header className="mb-10 text-center flex flex-col items-center">
            <div className="mb-6 p-2 bg-[#ff5722] text-[#541200] rounded-lg rotate-3 umami-shadow animate-bounce shadow-xl">
              <span className="material-symbols-outlined !text-4xl">restaurant</span>
            </div>
            <h1 className="font-[Anton] text-[48px] text-[#b02f00] uppercase tracking-tighter mb-1">
              foodmood OS
            </h1>
            <p className="font-semibold text-[14px] text-[#5b4039] uppercase tracking-widest">
              Partner Management
            </p>
          </header>

          {/* Login Form Card */}
          <section className="bg-[#f6eddb] rounded-2xl p-6 umami-shadow jagged-border relative mb-8">
            <div className="mb-6">
              <h2 className="font-[Anton] text-[32px] text-[#1f1b10] mb-1">
                Partner Login
              </h2>
              <p className="font-sans text-[16px] text-[#5b4039]">
                Enter your credentials to access the kitchen dashboard.
              </p>
            </div>

            {error && (
              <div className="bg-[#ffdad6] border-[2px] border-black text-[#93000a] font-bold text-xs p-3 rounded-2xl flex items-center gap-2 mb-4 w-full">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Email Input */}
              <div className="flex flex-col gap-1">
                <label className="font-[Anton] text-[12px] text-[#5b4039] px-2" htmlFor="email-mobile">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <input 
                    className="w-full h-14 px-6 bg-[#ffffff] border-2 border-[#343024] rounded-full focus:outline-none focus:ring-4 focus:ring-[#ff5722]/20 transition-all font-sans text-[#1f1b10] placeholder:text-[#e4beb4] outline-none" 
                    id="email-mobile" 
                    placeholder="chef@foodmood.io" 
                    type="email"
                    {...register('email')}
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#907067]">alternate_email</span>
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 font-bold ml-2 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-end px-2">
                  <label className="font-[Anton] text-[12px] text-[#5b4039]" htmlFor="password-mobile">
                    PASSWORD
                  </label>
                  <Link className="font-bold text-[12px] text-[#b02f00] hover:underline" href="/forgot-password">FORGOT?</Link>
                </div>
                <div className="relative">
                  <input 
                    className="w-full h-14 px-6 bg-[#ffffff] border-2 border-[#343024] rounded-full focus:outline-none focus:ring-4 focus:ring-[#ff5722]/20 transition-all font-sans text-[#1f1b10] placeholder:text-[#e4beb4] outline-none" 
                    id="password-mobile" 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                  />
                  <button 
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-[#907067] hover:text-[#b02f00] transition-colors flex items-center justify-center bg-transparent border-none" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 font-bold ml-2 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Primary Action */}
              <button 
                className="mt-2 w-full h-16 bg-[#ff5722] text-[#541200] font-[Anton] text-[20px] rounded-full flex items-center justify-center gap-3 umami-shadow btn-active-scale transition-transform duration-200" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'AUTHENTICATING...' : 'LOGIN TO KITCHEN'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>
          </section>

          {/* Secondary Information / Help */}
          <footer className="pt-6 flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-[#e4beb4]"></span>
              <span className="font-bold text-[12px] text-[#5b4039] uppercase">New Location?</span>
              <span className="h-px w-8 bg-[#e4beb4]"></span>
            </div>
            <button className="font-[Anton] text-[16px] text-[#343024] border-2 border-[#343024] rounded-full px-8 py-3 btn-active-scale transition-transform bg-transparent" type="button">
              Contact Onboarding
            </button>
            {/* Decorative Visual */}
            <div className="mt-8 w-full h-48 rounded-xl overflow-hidden grayscale contrast-125 opacity-40 relative border border-[#eae2d0]">
              <img className="w-full h-full object-cover" alt="Busy gourmet kitchen line" src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#fff8f0] to-transparent"></div>
            </div>
          </footer>
        </main>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:flex min-h-screen w-full items-center justify-center p-gutter bg-[#fff8f0] relative">
        {/* Background Atmospheric Effect */}
        <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
          <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-secondary-container rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-primary-fixed-dim rounded-full blur-[100px]"></div>
        </div>

        {/* Login Container */}
        <main className="relative w-full max-w-md z-10">
          {/* Brand Header */}
          <div className="text-center mb-lg">
            <h1 className="font-display-md text-display-md text-primary tracking-tight">foodmood</h1>
            <p className="font-label-lg text-label-lg text-secondary uppercase tracking-[0.2em] mt-xs">Restaurant Operating System</p>
          </div>

          {/* Login Card */}
          <div className="bg-surface-container shadow-sm umami-shadow rounded-xl p-md md:p-lg border border-surface-variant/20">
            <div className="mb-md">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Partner Login</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Access your restaurant dashboard</p>
            </div>

            {error && (
              <div className="bg-[#ffdad6] border-[2px] border-black text-[#93000a] font-bold text-xs p-3 rounded-2xl flex items-center gap-2 mb-4 w-full">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-md" onSubmit={handleSubmit(onSubmit)}>
              {/* Email Input */}
              <div className="space-y-xs">
                <label className="font-label-lg text-label-lg text-on-surface uppercase ml-sm" htmlFor="email-desktop">Email Address</label>
                <div className="relative flex items-center transition-all duration-200">
                  <span className="material-symbols-outlined absolute left-md text-on-surface-variant">mail</span>
                  <input 
                    className="w-full h-14 pl-12 pr-md bg-transparent border-2 border-on-surface rounded-full font-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:ring-0 focus:outline-none transition-all duration-200" 
                    id="email-desktop" 
                    placeholder="chef@foodmood.io" 
                    type="email"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 font-bold ml-4 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-xs">
                <div className="flex justify-between items-center px-sm">
                  <label className="font-label-lg text-label-lg text-on-surface uppercase" htmlFor="password-desktop">Password</label>
                </div>
                <div className="relative flex items-center transition-all duration-200">
                  <span className="material-symbols-outlined absolute left-md text-on-surface-variant">lock</span>
                  <input 
                    className="w-full h-14 pl-12 pr-12 bg-transparent border-2 border-on-surface rounded-full font-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:ring-0 focus:outline-none transition-all duration-200" 
                    id="password-desktop" 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                  />
                  <button 
                    className="absolute right-4 text-[#907067] hover:text-[#b02f00] transition-colors flex items-center justify-center bg-transparent border-none" 
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 font-bold ml-4 mt-1">{errors.password.message}</p>
                )}
                <div className="flex justify-end px-sm pt-xs">
                  <Link className="font-label-sm text-label-sm text-primary hover:underline transition-all" href="/forgot-password">Forgot Password?</Link>
                </div>
              </div>

              {/* Login Button */}
              <div className="pt-base">
                <button 
                  className="button-press w-full h-16 bg-primary-container text-on-primary-container font-display-md text-headline-sm rounded-full flex items-center justify-center gap-base transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95" 
                  type="submit"
                  disabled={loading}
                >
                  <span>{loading ? 'AUTHENTICATING...' : 'LOGIN'}</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </form>

            {/* Secondary Actions */}
            <div className="mt-lg pt-md border-t border-surface-variant/50 flex flex-col items-center gap-sm">
              <p className="font-body-md text-body-md text-on-surface-variant">Need an account?</p>
              <button className="font-label-lg text-label-lg text-on-surface border-2 border-on-surface px-md py-sm rounded-full hover:bg-on-surface hover:text-surface transition-all duration-200 bg-transparent">
                Apply to Join
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <footer className="mt-md text-center opacity-60">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              © 2026 foodmood Technologies Inc.
            </p>
          </footer>
        </main>
      </div>

    </div>
  );
}
