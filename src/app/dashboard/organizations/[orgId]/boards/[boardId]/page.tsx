'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Board } from '@/components/Board';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

export default function BoardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;
  const boardId = params.boardId as string;

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Check if user is member of organization
      const { data: member } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single();

      if (!member) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      setUser(user);
      setHasAccess(true);
      setLoading(false);
    };

    checkAccess();
  }, [orgId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-gray-600">Sem permissão para acessar este quadro</p>
        <Link href="/dashboard">
          <Button>Voltar ao Painel</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-8">
        <Link href={`/dashboard/organizations/${orgId}`}>
          <Button variant="outline" className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </Link>
        <Board />
      </div>
    </main>
  );
}
