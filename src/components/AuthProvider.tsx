'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        // 1. Check hash for implicit magic link flow immediately
        const hash = window.location.hash;
        if (hash && hash.includes('type=invite')) {
            router.push('/auth/set-password');
        }

        // 2. Global Auth Listener for redirecting logged out users if needed
        // In many NextJS apps, this is handled by middleware, but a client-side 
        // listener ensures SPA transitions are protected if a token expires.
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            // Handle global auth events if needed
            // e.g., if (event === 'SIGNED_OUT') router.push('/auth/login');
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [router]);

    return <>{children}</>;
}
