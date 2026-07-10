'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '../stores/sessionStore';

export default function ScanQRPage() {
  const { initiateSession } = useSessionStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flashOn, setFlashOn] = useState(false);

  // OTP inputs for desktop view
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Manual code paste for mobile view
  const [manualCode, setManualCode] = useState('');

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    const val = element.value;
    const nextOtp = [...otp];
    nextOtp[index] = val.substring(val.length - 1);
    setOtp(nextOtp);

    // Auto-focus next input
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9a-zA-Z-]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmitOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join('').trim();
    if (code.length < 3) {
      setError('Please enter a valid table code');
      return;
    }
    await handleScan(code);
  };

  const handleScan = async (qrContent: string) => {
    setLoading(true);
    setError('');
    try {
      await initiateSession(qrContent);
      router.push('/scan/confirm');
    } catch (err: any) {
      setError(err.message || 'Failed to scan table QR. Make sure the QR code is valid.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background relative text-on-surface select-none font-body-md overflow-x-hidden">
      
      {/* MOBILE VIEW */}
      <div className="block md:hidden min-h-screen bg-neutral-900 flex flex-col relative text-white">
        {/* Simulated Camera Viewfinder */}
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full opacity-60 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop')" }}
          ></div>
          {/* crop overlays around scanning frame */}
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-grow bg-black/60"></div>
            <div className="flex h-[260px] shrink-0">
              <div className="flex-grow bg-black/60"></div>
              <div className="w-[260px] relative border-2 border-white/20">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-md animate-pulse"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-md animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-md animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-md animate-pulse"></div>
                
                {/* Animated scanline */}
                <div className="absolute left-0 right-0 h-1 bg-primary/80 shadow-[0_0_10px_#ff5722] top-0 animate-[scan_2.5s_linear_infinite]"></div>
              </div>
              <div className="flex-grow bg-black/60"></div>
            </div>
            <div className="flex-grow bg-black/60"></div>
          </div>
        </div>

        {/* Header */}
        <header className="relative z-10 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
          <button onClick={() => router.push('/')} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border-none text-white active:scale-95 transition-transform">
            <span className="material-symbols-outlined">close</span>
          </button>
          <button onClick={() => setFlashOn(!flashOn)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border-none text-white active:scale-95 transition-transform">
            <span className="material-symbols-outlined">{flashOn ? 'flash_off' : 'flash_on'}</span>
          </button>
        </header>

        {/* Main interactive panel */}
        <main className="relative z-10 flex-grow flex flex-col justify-between items-center py-10 px-6">
          <div className="text-center space-y-1 mt-4">
            <h1 className="font-headline-lg text-headline-lg uppercase text-white/95 tracking-wide">Scan Table QR</h1>
            <p className="font-body-md text-xs text-white/60 font-bold">Point camera at the QR code on your table corner</p>
          </div>

          <div className="w-full max-w-sm space-y-4">
            {error && (
              <div className="bg-error/90 border border-error text-white text-xs p-3.5 rounded-xl font-bold text-center">
                {error}
              </div>
            )}

            {/* Manual entry / Paste fields */}
            <div className="bg-surface text-on-surface p-5 rounded-2xl border-none shadow-md space-y-4">
              <h3 className="font-headline-sm text-xs font-black uppercase text-primary tracking-wider">Paste Table Code</h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. table-1 or table-cuid"
                  className="flex-1 bg-surface-container border border-outline rounded-xl p-3 text-xs outline-none font-bold text-on-surface"
                />
                <button 
                  onClick={() => handleScan(manualCode)}
                  disabled={loading || !manualCode}
                  className="bg-primary text-on-primary px-4 rounded-xl font-label-lg text-xs uppercase"
                >
                  {loading ? '...' : 'Go'}
                </button>
              </div>
              <p className="text-[10px] text-on-surface-variant">If camera scan is unavailable, type the table ID.</p>
            </div>
          </div>
        </main>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block min-h-screen relative overflow-hidden bg-surface">
        {/* Hero Background Area */}
        <div className="fixed inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center opacity-40 blur-sm" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop')" }}
          ></div>
        </div>

        {/* Header */}
        <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin h-20">
          <div onClick={() => router.push('/')} className="font-display-md text-display-md text-primary cursor-pointer">foodmood</div>
          <button onClick={() => router.push('/')} className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-variant transition-colors text-on-surface border-none active:scale-95">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Main Content Area */}
        <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-gutter">
          <div className="w-full max-w-2xl bg-surface/90 backdrop-blur-md rounded-xl p-lg md:p-xl shadow-[0_32px_64px_-12px_rgba(62,31,26,0.12)] border border-outline-variant/35">
            <div className="flex flex-col items-center text-center space-y-md">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-secondary-container text-on-secondary-container mb-2">
                <span className="material-symbols-outlined !text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
              </div>
              <h1 className="font-display-md text-display-md text-on-background leading-tight">Enter Table Code</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
                To start ordering, please enter the code found on your table's placard (e.g. table-1).
              </p>

              {error && (
                <div className="bg-error text-white text-xs p-3.5 rounded-xl font-bold w-full">
                  {error}
                </div>
              )}

              {/* Input Group */}
              <form onSubmit={handleSubmitOtp} className="w-full pt-md">
                <label className="block text-left font-label-lg text-label-lg text-on-surface-variant mb-sm tracking-widest uppercase">TABLE ACCESS CODE</label>
                <div className="flex justify-center gap-sm mb-lg">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      className="w-12 h-16 sm:w-20 sm:h-24 rounded-lg bg-surface-container-lowest border-2 border-outline-variant text-center font-display-md text-display-md focus:border-primary focus:ring-0 transition-all uppercase text-on-surface"
                      max={1}
                      maxLength={1}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      onKeyPress={handleOtpKeyPress}
                    />
                  ))}
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-on-primary font-headline-sm text-headline-sm py-md rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-sm border-none"
                >
                  {loading ? 'Verifying...' : 'Verify & Order'}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </form>

              <div className="mt-md flex justify-center items-center gap-base">
                <span className="material-symbols-outlined text-on-surface-variant !text-[20px]">info</span>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Your table code is valid for this session only.</p>
              </div>
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}
