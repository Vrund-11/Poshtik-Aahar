'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';

export default function AdminRootRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
    } else {
      router.push('/admin');
    }
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-[#fbfbfb] flex items-center justify-center font-sora">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-extrabold text-sm text-primary">Accessing admin dashboard...</p>
      </div>
    </div>
  );
}
