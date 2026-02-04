'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Users, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  organization_members?: Array<{
    user_id: string;
    role: string;
  }>;
  boards?: Array<{
    id: string;
    title: string;
    created_at: string;
  }>;
}

export function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgSlug, setNewOrgSlug] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user);
    });
  }, []);

  const { data: organizations = [], refetch, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await fetch('/api/organizations');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOrgName,
          slug: newOrgSlug,
        }),
      });

      if (response.ok) {
        setNewOrgName('');
        setNewOrgSlug('');
        setIsOpen(false);
        refetch();
      }
    } catch (error) {
      console.error('Error creating organization:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel de Controle
          </h1>
          <p className="text-gray-600">
            Bem-vindo, {user?.email}
          </p>
        </div>

        {/* Create Organization Button */}
        <div className="mb-8">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Criar Organização
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Organização</DialogTitle>
                <DialogDescription>
                  Adicione uma nova organização para gerenciar seus quadros.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateOrganization} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Organização</Label>
                  <Input
                    id="name"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Minha Empresa"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL Amigável</Label>
                  <Input
                    id="slug"
                    value={newOrgSlug}
                    onChange={(e) => setNewOrgSlug(e.target.value)}
                    placeholder="minha-empresa"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Criar Organização
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org: Organization) => (
            <Card key={org.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{org.name}</CardTitle>
                    <CardDescription className="mt-1">
                      @{org.slug}
                    </CardDescription>
                  </div>
                  {org.owner_id === user?.id && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                      Proprietário
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">
                      {org.organization_members?.length || 0}
                    </span>{' '}
                    membros
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">
                      {org.boards?.length || 0}
                    </span>{' '}
                    quadros
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/organizations/${org.id}`}
                    className="flex-1"
                  >
                    <Button
                      variant="default"
                      className="w-full gap-2"
                      size="sm"
                    >
                      <Users className="w-4 h-4" />
                      Gerenciar
                    </Button>
                  </Link>
                  {org.owner_id === user?.id && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <Settings className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {organizations.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="pt-8 text-center">
              <p className="text-gray-600 mb-4">
                Nenhuma organização criada ainda.
              </p>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button>Criar Sua Primeira Organização</Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
