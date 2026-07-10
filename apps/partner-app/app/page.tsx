'use client';

import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/navigation';

export default function PartnerHomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role === 'OWNER') {
      router.push('/owner');
    } else if (user.role === 'MANAGER') {
      router.push('/manager');
    } else if (user.role === 'CHEF') {
      router.push('/kitchen');
    } else if (user.role === 'ADMIN') {
      window.location.href = 'http://localhost:7070/admin';
    }
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-[#fbfbfb] flex items-center justify-center font-sora">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-extrabold text-sm text-primary">Redirecting to your workspace...</p>
      </div>
    </div>
  );
}
