'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';

export function Navbar({ user }: { user: User | null }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-600">Board Domestico</h1>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Sair
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
