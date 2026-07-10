'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerCustomerSchema } from '@foodmart/shared';
import { useAuthStore } from '../stores/authStore';

type RegisterFormValues = typeof registerCustomerSchema._input;

export default function RegisterPage() {
  const { register: registerAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerCustomerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError('');
    setSubmitting(true);
    try {
      await registerAuth(data.name, data.email, data.phone, data.password);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setSubmitting(false);
    }
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="font-hanken text-on-surface bg-background min-h-screen relative w-full flex flex-col justify-center">
      {/* MOBILE VIEW */}
      <div className="block md:hidden min-h-screen w-full flex flex-col justify-center px-gutter py-lg relative overflow-hidden">
        {/* Atmospheric Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-surface-container rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-secondary-container rounded-full blur-3xl opacity-30 pointer-events-none"></div>

        <div className="w-full max-w-lg mx-auto z-10">
          {/* Brand Identity */}
          <div className="text-center mb-lg">
            <h1 className="font-display-md text-display-md text-primary uppercase tracking-tight mb-xs">foodmood</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Elevating the digital dining table.</p>
          </div>

          {/* Registration Card */}
          <div className="bg-surface-container-low rounded-xl p-margin shadow-[0_12px_40px_0_rgba(62,31,26,0.08)] border-none">
            <header className="mb-gutter">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs uppercase">Create your account</h2>
              <p className="font-label-lg text-label-lg text-secondary uppercase tracking-widest">Join the hospitality revolution</p>
            </header>

            {error && (
              <div className="bg-accent-red/10 border-2 border-accent-red text-accent-red font-bold text-xs p-4 rounded-xl flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined">error</span>
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-gutter" onSubmit={handleSubmit(onSubmit)}>
              {/* Full Name */}
              <div className="flex flex-col">
                <label className="font-label-lg text-label-lg text-on-surface-variant mb-xs ml-base">FULL NAME</label>
                <div className="relative group">
                  <input 
                    className={`w-full bg-surface-bright border-2 ${errors.name ? 'border-accent-red' : 'border-on-surface'} px-md py-base rounded-full font-body-md text-on-surface transition-all group-hover:border-primary focus:outline-none`} 
                    placeholder="Gautam Singh" 
                    type="text"
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-accent-red ml-4 font-bold mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="flex flex-col">
                <label className="font-label-lg text-label-lg text-on-surface-variant mb-xs ml-base">PHONE NUMBER</label>
                <div className="relative flex items-center group">
                  <input 
                    className={`w-full bg-surface-bright border-2 ${errors.phone ? 'border-accent-red' : 'border-on-surface'} px-md py-base rounded-full font-body-md text-on-surface transition-all group-hover:border-primary focus:outline-none`} 
                    placeholder="9876543210" 
                    type="tel"
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-accent-red ml-4 font-bold mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="flex flex-col">
                <label className="font-label-lg text-label-lg text-on-surface-variant mb-xs ml-base">EMAIL ADDRESS</label>
                <div className="relative group">
                  <input 
                    className={`w-full bg-surface-bright border-2 ${errors.email ? 'border-accent-red' : 'border-on-surface'} px-md py-base rounded-full font-body-md text-on-surface transition-all group-hover:border-primary focus:outline-none`} 
                    placeholder="gautam@foodmood.io" 
                    type="email"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-accent-red ml-4 font-bold mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col">
                <label className="font-label-lg text-label-lg text-on-surface-variant mb-xs ml-base">PASSWORD</label>
                <div className="relative group">
                  <input 
                    className={`w-full bg-surface-bright border-2 ${errors.password ? 'border-accent-red' : 'border-on-surface'} px-md py-base pr-14 rounded-full font-body-md text-on-surface transition-all group-hover:border-primary focus:outline-none`} 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                  />
                  <button 
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary active:scale-95 transition-all bg-transparent border-none" 
                    onClick={togglePassword} 
                    type="button"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-accent-red ml-4 font-bold mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Register CTA */}
              <div className="pt-sm">
                <button 
                  className="w-full h-16 bg-primary text-on-primary font-headline-sm text-headline-sm rounded-full active:scale-95 transition-all flex items-center justify-center gap-2" 
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'CREATING ACCOUNT...' : 'REGISTER'}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>

          {/* Footer Navigation */}
          <footer className="mt-lg text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Already have an account? 
              <Link className="text-primary font-bold hover:underline ml-1" href="/login">Login</Link>
            </p>
          </footer>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:flex min-h-screen w-full justify-center items-center px-margin bg-background relative overflow-hidden">
        {/* Abstract Deco shapes */}
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-surface-container rounded-full blur-[120px] opacity-40 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary-container rounded-full blur-[100px] opacity-30 pointer-events-none"></div>

        {/* Brand Anchor */}
        <div className="fixed top-margin left-margin z-10">
          <Link href="/" className="font-display-md text-display-md text-primary tracking-tighter uppercase">foodmood</Link>
        </div>

        {/* Content Wrapper */}
        <div className="w-full max-w-[960px] grid grid-cols-1 md:grid-cols-2 gap-12 items-center z-10">
          {/* Brand Presentation Panel */}
          <div className="hidden md:flex flex-col justify-center space-y-md">
            <span className="font-label-lg text-label-lg text-primary uppercase tracking-widest leading-none">Foodmood Restaurant Experience OS</span>
            <h2 className="font-headline-lg text-display-sm text-on-surface uppercase tracking-tight leading-tight">Welcome to the future of tableside service.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Fast, frictionless ordering. Automatic verification. Points with every bite.</p>
          </div>

          {/* Registration Card Panel */}
          <div className="bg-surface-container-low rounded-xl p-lg shadow-[0_20px_40px_-12px_rgba(62,31,26,0.08)] border-none">
            <header className="mb-lg">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs uppercase">Create an Account</h2>
              <p className="font-label-lg text-label-lg text-secondary uppercase tracking-widest">Your tableside journey starts here</p>
            </header>

            {error && (
              <div className="bg-accent-red/10 border-2 border-accent-red text-accent-red font-bold text-xs p-4 rounded-xl flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined">error</span>
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-base" onSubmit={handleSubmit(onSubmit)}>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="font-headline-sm text-label-sm text-on-surface-variant uppercase block px-4">Full Name</label>
                <div className="relative group">
                  <input 
                    className={`w-full bg-surface-bright border-2 ${errors.name ? 'border-accent-red' : 'border-on-surface'} px-6 py-4 rounded-full font-body-md text-on-surface transition-all focus:outline-none`} 
                    placeholder="Gautam Singh" 
                    type="text"
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-accent-red ml-4 font-bold mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="font-headline-sm text-label-sm text-on-surface-variant uppercase block px-4">Phone Number</label>
                <div className="relative group">
                  <input 
                    className={`w-full bg-surface-bright border-2 ${errors.phone ? 'border-accent-red' : 'border-on-surface'} px-6 py-4 rounded-full font-body-md text-on-surface transition-all focus:outline-none`} 
                    placeholder="9876543210" 
                    type="tel"
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-accent-red ml-4 font-bold mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="font-headline-sm text-label-sm text-on-surface-variant uppercase block px-4">Email Address</label>
                <div className="relative group">
                  <input 
                    className={`w-full bg-surface-bright border-2 ${errors.email ? 'border-accent-red' : 'border-on-surface'} px-6 py-4 rounded-full font-body-md text-on-surface transition-all focus:outline-none`} 
                    placeholder="gautam@foodmood.io" 
                    type="email"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-accent-red ml-4 font-bold mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="font-headline-sm text-label-sm text-on-surface-variant uppercase block px-4">Password</label>
                <div className="relative group">
                  <input 
                    className={`w-full bg-surface-bright border-2 ${errors.password ? 'border-accent-red' : 'border-on-surface'} px-6 py-4 pr-14 rounded-full font-body-md text-on-surface transition-all focus:outline-none`} 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                  />
                  <button 
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary active:scale-95 transition-all bg-transparent border-none" 
                    onClick={togglePassword} 
                    type="button"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-accent-red ml-4 font-bold mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* CTA button */}
              <div className="pt-md">
                <button 
                  className="w-full bg-primary text-on-primary font-headline-lg text-headline-sm uppercase py-5 rounded-full shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all" 
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>

            {/* Link to login */}
            <footer className="mt-md pt-md border-t border-outline-variant/30 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Already have an account? 
                <Link className="text-primary font-bold hover:underline transition-all underline-offset-4 ml-1" href="/login">Login</Link>
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
