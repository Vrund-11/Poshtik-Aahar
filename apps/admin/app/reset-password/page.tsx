'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@foodmart/shared';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [passwordScore, setPasswordScore] = useState(0);

  useEffect(() => {
    // Calculate score
    let score = 0;
    if (password.length > 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setPasswordScore(score);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!token) {
      setError('Reset token is missing or invalid.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res: any = await api.post('/api/v1/auth/reset-password', {
        token,
        password,
      });

      if (res && res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(res.message || 'Failed to update password.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page w-full min-h-screen bg-[#fff8f0] relative text-on-surface select-none pb-24 md:pb-0">
      
      {/* MOBILE VIEW */}
      <div className="flex md:hidden min-h-screen w-full flex-col justify-center items-center p-6 bg-[#fff8f0] relative">
        <header className="fixed top-0 left-0 w-full bg-[#fff8f0] flex justify-between items-center px-6 py-3 z-50">
          <div className="flex items-center gap-3">
            <Link className="text-[#b02f00] hover:opacity-80 transition-opacity active:scale-95 flex items-center" href="/login">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
          </div>
          <div className="font-[Anton] text-[28px] text-[#b02f00] uppercase tracking-tighter">
            UMAMI OS
          </div>
          <div className="w-10 h-10"></div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center px-6 py-8 relative z-10 w-full max-w-[480px] mt-16">
          <div className="w-full bg-[#fcf3e1] rounded-xl soft-umami-shadow p-6 flex flex-col gap-6 relative">
            <div className="flex flex-col items-center gap-2 mb-2">
              <div className="w-16 h-16 bg-[#ffdbd1] rounded-full flex items-center justify-center text-[#541200]">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
              </div>
              <h2 className="font-[Anton] text-[32px] text-[#1f1b10] uppercase text-center">Reset Password</h2>
              <p className="text-[#5b4039] text-center max-w-[280px]">Secure your admin account with a new, strong password.</p>
            </div>

            {error && (
              <div className="bg-[#ffdad6] border-[2px] border-black text-[#93000a] font-bold text-xs p-3 rounded-2xl flex items-center gap-2 w-full text-left">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-[#D1FAE5] border-[2px] border-[#16A34A] text-black font-bold text-xs p-3 rounded-2xl flex items-center gap-2 w-full text-left">
                <span className="material-symbols-outlined text-[#16A34A] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span>PASSWORD UPDATED SUCCESSFULLY</span>
              </div>
            )}

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* New Password */}
              <div className="flex flex-col gap-1">
                <label className="font-[Anton] text-[14px] text-[#5b4039] px-2">NEW PASSWORD</label>
                <div className="relative">
                  <input 
                    className="w-full h-14 px-6 bg-[#ffffff] border-2 border-[#1f1b10] rounded-full focus:ring-2 focus:ring-[#b02f00] focus:border-[#b02f00] outline-none transition-all placeholder:text-[#eae2d0] font-sans text-[#1f1b10]" 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c544e] hover:text-[#b02f00] transition-colors bg-transparent border-none flex items-center" 
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1">
                <label className="font-[Anton] text-[14px] text-[#5b4039] px-2">CONFIRM PASSWORD</label>
                <div className="relative">
                  <input 
                    className="w-full h-14 px-6 bg-[#ffffff] border-2 border-[#1f1b10] rounded-full focus:ring-2 focus:ring-[#b02f00] focus:border-[#b02f00] outline-none transition-all placeholder:text-[#eae2d0] font-sans text-[#1f1b10]" 
                    placeholder="••••••••" 
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c544e] hover:text-[#b02f00] transition-colors bg-transparent border-none flex items-center" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    type="button"
                  >
                    <span className="material-symbols-outlined">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Strength Bars */}
              <div className="px-2 flex items-center gap-1">
                <div className={`h-1.5 flex-grow rounded-full transition-colors ${passwordScore > 0 ? 'bg-[#ff5722]' : 'bg-[#eae2d0]'}`}></div>
                <div className={`h-1.5 flex-grow rounded-full transition-colors ${passwordScore > 1 ? 'bg-[#ff5722]' : 'bg-[#eae2d0]'}`}></div>
                <div className={`h-1.5 flex-grow rounded-full transition-colors ${passwordScore > 2 ? 'bg-[#ff5722]' : 'bg-[#eae2d0]'}`}></div>
                <div className={`h-1.5 flex-grow rounded-full transition-colors ${passwordScore > 3 ? 'bg-[#ff5722]' : 'bg-[#eae2d0]'}`}></div>
              </div>

              {/* Action Button */}
              <button 
                className="w-full h-16 bg-[#ff5722] text-[#541200] font-[Anton] text-[20px] uppercase rounded-full shadow-lg active:scale-95 transition-transform mt-2 flex items-center justify-center gap-3" 
                type="submit"
                disabled={loading || success}
              >
                <span>{loading ? 'Updating...' : 'Update Password'}</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>
            <Link className="text-[#5b4039] hover:text-[#b02f00] font-[Anton] text-[14px] uppercase tracking-widest text-center mt-2 transition-colors" href="/login">
              Back to Login
            </Link>
            {/* Speciality "Ticket" Edge */}
            <div className="ticket-edge"></div>
          </div>
        </main>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:flex min-h-screen w-full items-center justify-center p-margin bg-[#fff8f0] relative">
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-secondary-container rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-primary-fixed-dim rounded-full blur-[100px]"></div>
        </div>

        <main className="relative w-full max-w-xl z-10">
          {/* Brand Identity Container */}
          <div className="flex flex-col items-center mb-lg text-center">
            <div className="mb-md">
              <span className="font-display-md text-display-md text-primary tracking-tighter">Umami</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">Set new password</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-base">
              Your security is our priority. Please choose a strong, unique password to protect your admin account.
            </p>
          </div>

          <div className="bg-surface-container p-md md:p-lg rounded-xl umami-shadow">
            {error && (
              <div className="bg-[#ffdad6] border-[2px] border-black text-[#93000a] font-bold text-xs p-3 rounded-2xl flex items-center gap-2 mb-4 w-full text-left">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-lg" onSubmit={handleSubmit}>
              {/* New Password Field */}
              <div className="space-y-xs">
                <label className="block font-display-md text-label-lg text-on-surface uppercase ml-sm">New Password</label>
                <div className="relative">
                  <input 
                    className="w-full h-16 px-md rounded-full border-2 border-on-secondary-fixed-variant bg-transparent focus:ring-0 focus:border-primary font-body-lg text-on-surface transition-all placeholder:text-on-surface-variant/40 outline-none" 
                    placeholder="••••••••••••" 
                    required 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none flex items-center" 
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                <div className="flex gap-xs mt-base px-sm">
                  <div className={`h-1.5 flex-1 rounded-full transition-colors ${passwordScore > 0 ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                  <div className={`h-1.5 flex-1 rounded-full transition-colors ${passwordScore > 1 ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                  <div className={`h-1.5 flex-1 rounded-full transition-colors ${passwordScore > 2 ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                  <div className={`h-1.5 flex-1 rounded-full transition-colors ${passwordScore > 3 ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-xs">
                <label className="block font-display-md text-label-lg text-on-surface uppercase ml-sm">Confirm New Password</label>
                <div className="relative">
                  <input 
                    className="w-full h-16 px-md rounded-full border-2 border-on-secondary-fixed-variant bg-transparent focus:ring-0 focus:border-primary font-body-lg text-on-surface transition-all placeholder:text-on-surface-variant/40 outline-none" 
                    placeholder="••••••••••••" 
                    required 
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button 
                    className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none flex items-center" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    type="button"
                  >
                    <span className="material-symbols-outlined">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button 
                className="w-full py-md px-lg bg-primary-container text-on-primary-container rounded-full font-display-md text-headline-sm uppercase tracking-wider umami-shadow inset-depth transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-base" 
                type="submit"
                disabled={loading || success}
              >
                <span>{loading ? 'Updating...' : 'Update Password'}</span>
                <span className="material-symbols-outlined">check_circle</span>
              </button>

              {/* Back Action */}
              <div className="text-center pt-md">
                <Link className="font-label-lg text-on-surface-variant hover:text-primary transition-colors underline decoration-2 underline-offset-4 decoration-primary/20" href="/login">
                  Back to Login
                </Link>
              </div>
            </form>
          </div>

          {/* Branding Graphic / Visual Anchor */}
          <div className="mt-xl grid grid-cols-2 gap-gutter opacity-40">
            <div className="h-32 rounded-lg bg-surface-container-high relative overflow-hidden">
              <img className="absolute inset-0 w-full h-full object-cover" alt="Red spices macro culinary photography" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdHmeYPZ3ga4z9SZz0LaJ_uuajreWZSdEVdZZbNqzfVSI_Jh2SfH0cCKhKY_IZaSSL45hIvb7aqgn9kHxebIgs2oFzWhSVPIJQ5f3TNTHY5tE7XLfQMazBy2jgv3IG9vvbGl9Tv6yARv2XH1CI1IE5RJhYHR9Xq1OyWX8fl0QCt4CR2mahBSPIJOLzcLZ6ayKyNjlwZVGQHhjHgvdJW2FnpBKScVWf9wQRPaOjl1kIIPWJtks1lV_D8_fQb0enDo7hZf6lKwuKXUU"/>
            </div>
            <div className="h-32 rounded-lg bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-[64px] text-on-surface-variant/20">restaurant_menu</span>
            </div>
          </div>
        </main>

        {/* Success Modal */}
        {success && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-surface p-lg rounded-xl max-w-sm w-full mx-margin text-center umami-shadow border-2 border-primary/10 animate-fade-in">
              <div className="w-20 h-20 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-md">
                <span className="material-symbols-outlined text-[48px]">done_all</span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-base uppercase">Success</h3>
              <p className="font-body-md text-on-surface-variant mb-lg">Your password has been successfully reset. You can now use your new credentials to log into Umami OS.</p>
              <Link className="block w-full py-md bg-on-background text-surface rounded-full font-display-md text-label-lg uppercase tracking-widest text-center" href="/login">
                Go to Login
              </Link>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-3xl border-2 border-black p-10 flex flex-col items-center justify-center gap-4 w-full max-w-md mx-auto mt-24">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="font-sans font-bold text-sm">Loading security keys...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
