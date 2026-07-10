'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { useSessionStore } from './stores/sessionStore';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Prevent QueryClient from sharing state between different requests on SSR
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateSession = useSessionStore((s) => s.hydrate);

  useEffect(() => {
    // Hydrate store data from cookies/localStorage on initial client-side mount
    hydrateAuth();
    hydrateSession();
  }, [hydrateAuth, hydrateSession]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
