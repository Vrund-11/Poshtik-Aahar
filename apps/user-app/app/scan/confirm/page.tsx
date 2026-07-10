'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '../../stores/sessionStore';

export default function ConfirmTableNumberPage() {
  const { activeSession, verifySession } = useSessionStore();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedCode, setSelectedCode] = useState<number | null>(null);
  const [codes, setCodes] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(165); // 2:45 countdown
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  // Sync session codes to local state
  useEffect(() => {
    if (activeSession && activeSession.verificationCodes) {
      setCodes(activeSession.verificationCodes);
    }
  }, [activeSession]);

  // Redirect if no active session is being initiated
  useEffect(() => {
    if (!activeSession) {
      router.push('/scan');
    }
  }, [activeSession, router]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  if (!activeSession) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeSelection = async (code: number) => {
    setSelectedCode(code);
    setSubmitting(true);
    setError('');

    try {
      await verifySession(activeSession.id, code);
      setShowSuccessOverlay(true);
      setTimeout(() => {
        router.push(`/dine-in/${activeSession.id}/menu`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Wrong code — ask staff which number matches your table.');
      
      // Regenerate verification codes locally so they can retry immediately without scanning
      const newMockCodes = [
        Math.floor(10 + Math.random() * 90),
        Math.floor(10 + Math.random() * 90),
        Math.floor(10 + Math.random() * 90)
      ];
      setCodes(newMockCodes);
      setSelectedCode(null);
      setSubmitting(false);
    }
  };

  const handleCallServer = () => {
    alert('Staff service has been requested for Table ' + activeSession.tableNumber);
  };

  return (
    <div className="w-full min-h-screen bg-background relative text-on-surface select-none font-body-md overflow-x-hidden">
      
      {/* SUCCESS OVERLAY */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 z-[100] bg-primary flex flex-col justify-center items-center text-white text-center p-md">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-md animate-bounce">
            <span className="material-symbols-outlined text-primary text-6xl">check_circle</span>
          </div>
          <h2 className="font-display-md text-display-md uppercase tracking-tight">Verified!</h2>
          <p className="font-body-lg text-white/90">Entering table session now...</p>
        </div>
      )}

      {/* MOBILE VIEW */}
      <div className="block md:hidden min-h-screen bg-background flex flex-col relative pb-12">
        <header className="fixed top-0 left-0 w-full z-50 bg-surface px-6 py-4 flex justify-between items-center max-w-md mx-auto left-1/2 -translate-x-1/2 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary font-black">restaurant</span>
            <h1 className="font-display-md text-base font-black text-primary uppercase">foodmood</h1>
          </div>
          <div className="w-10 h-10 rounded-full border border-primary overflow-hidden bg-slate-100 shrink-0">
            <img className="w-full h-full object-cover" alt="Profile" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" />
          </div>
        </header>

        <main className="mt-20 px-6 pb-20 w-full space-y-6">
          <div className="text-center pt-2">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary leading-tight">Verification Check</p>
            <h2 className="font-headline-sm text-lg font-black text-primary uppercase leading-tight mt-1">
              {activeSession.restaurantName} — Table {activeSession.tableNumber}
            </h2>
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-headline-sm text-base font-black uppercase text-primary">Choose your code</h3>
            <p className="font-body-md text-xs text-on-surface-variant font-bold">Ask staff which number matches your table</p>
            <div className="inline-block bg-primary-container/10 px-4 py-1.5 rounded-full mt-sm">
              <span className="text-xs text-primary font-bold">Expires in {formatTime(timeLeft)}</span>
            </div>
          </div>

          {error && (
            <div className="bg-error border border-error text-white text-xs p-4 rounded-xl font-bold text-center">
              {error}
            </div>
          )}

          {/* Verification Code Buttons */}
          <div className="grid grid-cols-1 gap-4">
            {codes.map((code) => {
              const isSelected = selectedCode === code;
              return (
                <button
                  key={code}
                  onClick={() => handleCodeSelection(code)}
                  disabled={submitting}
                  className={`w-full py-6 rounded-2xl font-headline-sm text-4xl uppercase border-2 border-outline transition-all active:scale-95 ${
                    isSelected ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low text-primary hover:bg-surface-container'
                  }`}
                >
                  {code}
                </button>
              );
            })}
          </div>

          {/* Call Server Button */}
          <div className="pt-6 border-t border-outline-variant/30 space-y-4">
            <button 
              onClick={handleCallServer}
              className="w-full flex items-center justify-center gap-2 py-4 bg-surface border-2 border-primary text-primary font-headline-sm text-xs uppercase rounded-full active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">notifications</span>
              Call Server
            </button>
            <p className="text-center text-[10px] text-on-surface-variant">
              Verification prevents accidental ordering
            </p>
          </div>
        </main>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block min-h-screen bg-surface relative pb-20">
        <header className="bg-surface fixed top-0 w-full z-50 bg-surface-container-low shadow-sm h-20 flex justify-between items-center px-margin">
          <div className="flex items-center gap-2">
            <span className="font-display-md text-display-md text-primary uppercase">foodmood</span>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container border-2 border-primary">
            <img className="w-full h-full object-cover" alt="Profile" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" />
          </div>
        </header>

        <main className="pt-28 max-w-md mx-auto px-margin text-center space-y-lg">
          <div className="bg-surface-container-high p-lg rounded-xl shadow-md space-y-md border border-outline-variant/30">
            <div>
              <span className="bg-primary/10 text-primary font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">Verification Required</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase mt-md">
                {activeSession.restaurantName}
              </h2>
              <p className="font-body-lg text-on-surface-variant font-bold">Table {activeSession.tableNumber}</p>
            </div>

            <div className="space-y-sm">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Please match the verification code showing on your table's display or card:
              </p>
              <div className="text-primary font-bold text-sm bg-primary/5 py-1.5 rounded-full inline-block px-4">
                Code expires in {formatTime(timeLeft)}
              </div>
            </div>

            {error && (
              <div className="bg-error text-white text-xs p-4 rounded-xl font-bold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-md">
              {codes.map((code) => {
                const isSelected = selectedCode === code;
                return (
                  <button
                    key={code}
                    onClick={() => handleCodeSelection(code)}
                    disabled={submitting}
                    className={`py-5 rounded-xl font-headline-sm text-3xl transition-all active:scale-95 border-2 border-outline-variant ${
                      isSelected ? 'bg-primary text-on-primary border-primary' : 'bg-surface-bright text-primary hover:bg-surface-container'
                    }`}
                  >
                    {code}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={handleCallServer}
              className="w-full flex items-center justify-center gap-2 py-3 bg-surface border-2 border-primary text-primary font-label-lg uppercase rounded-full active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">notifications</span>
              Call Server
            </button>
          </div>
        </main>
      </div>

    </div>
  );
}
