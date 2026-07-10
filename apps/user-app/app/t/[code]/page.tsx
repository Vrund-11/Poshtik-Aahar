'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';
import { useSessionStore } from '../../stores/sessionStore';

/**
 * Deep-link landing page for QR scans.
 * QR encodes: /t/<qrCode>
 * This page resolves the qrCode → initiates session → redirects to verify screen.
 */
export default function QRLandingPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const { initiateSession, activeSession } = useSessionStore();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(true);

  const qrCode = params.code as string;

  useEffect(() => {
    // Wait for auth to resolve
    if (authLoading) return;

    // If not logged in, redirect to login with return URL
    if (!user) {
      router.push(`/login?redirect=/t/${qrCode}`);
      return;
    }

    // If there's already an active session, go to its menu
    if (activeSession && activeSession.status === 'ACTIVE') {
      router.push(`/dine-in/${activeSession.id}/menu`);
      return;
    }

    // Initiate session with the qrCode
    const initiate = async () => {
      try {
        await initiateSession(qrCode);
        router.push('/scan/confirm');
      } catch (err: any) {
        setError(err.message || 'Failed to initiate table session');
        setProcessing(false);
      }
    };

    initiate();
  }, [authLoading, user, qrCode, activeSession]);

  if (authLoading || processing) {
    return (
      <div className="font-hanken text-black min-h-screen bg-gradient-to-br from-[#FFEDD5] to-[#D1FAE5] flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 bg-white rounded-full border-4 border-black flex items-center justify-center shadow-[6px_6px_0_0_#000] animate-pulse">
          <span className="material-symbols-outlined text-4xl text-black" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
        </div>
        <div className="text-center">
          <p className="font-sora text-lg font-black text-black">Setting up your table...</p>
          <p className="font-hanken text-sm text-black/50 font-bold mt-1">Verifying QR code</p>
        </div>
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-hanken text-black min-h-screen bg-gradient-to-br from-[#FFEDD5] to-[#D1FAE5] flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-20 h-20 bg-red-100 rounded-full border-4 border-black flex items-center justify-center shadow-[6px_6px_0_0_#000]">
          <span className="material-symbols-outlined text-4xl text-red-600">error</span>
        </div>
        <div className="text-center max-w-xs">
          <p className="font-sora text-lg font-black text-black">Scan Failed</p>
          <p className="font-hanken text-sm text-black/60 font-bold mt-2">{error}</p>
        </div>
        <button
          onClick={() => router.push('/scan')}
          className="px-8 py-3 bg-black text-white font-sora font-bold text-sm rounded-full border-2 border-black shadow-[4px_4px_0_0_#D1FAE5] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return null;
}
