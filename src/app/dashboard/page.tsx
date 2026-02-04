'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndOrganization = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/organizations');
      const organizations = await response.json();

      if (organizations.length > 0) {
        router.push(`/dashboard/organizations/${organizations[0].id}`);
      } else {
        router.push('/dashboard/setup');
      }
    };

    checkAuthAndOrganization();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-gray-600">Carregando...</p>
    </div>
  );
}
