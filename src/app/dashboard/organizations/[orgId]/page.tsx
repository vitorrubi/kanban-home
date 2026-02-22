'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, UserPlus, Trash2, ArrowLeft } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';

interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  organization_members: Array<{
    id: string;
    user_id: string;
    role: string;
  }>;
  boards: Array<{
    id: string;
    title: string;
    created_at: string;
  }>;
}

export default function OrganizationPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  const [user, setUser] = useState<any>(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const [newBoardName, setNewBoardName] = useState('');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddBoardOpen, setIsAddBoardOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user);
    });
  }, []);

  const { data: organization, refetch, isLoading } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      const response = await fetch(`/api/organizations/${orgId}`);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json() as Promise<Organization>;
    },
  });

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/organizations/${orgId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newMemberEmail,
          role: newMemberRole,
        }),
      });

      if (response.ok) {
        setNewMemberEmail('');
        setNewMemberRole('member');
        setIsAddMemberOpen(false);
        refetch();
      } else {
        console.error('Failed to add member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/organizations/${orgId}/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newBoardName,
        }),
      });

      if (response.ok) {
        const board = await response.json();
        setNewBoardName('');
        setIsAddBoardOpen(false);
        refetch();
        // Optionally navigate to the new board
        router.push(`/dashboard/organizations/${orgId}/boards/${board.id}`);
      } else {
        console.error('Failed to create board');
      }
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(
        `/api/organizations/${orgId}/members?memberId=${memberId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Organização não encontrada</p>
      </div>
    );
  }

  const isOwner = organization.owner_id === user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {organization.name}
            </h1>
            <p className="text-gray-600">@{organization.slug}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Membros</CardTitle>
                  <CardDescription>
                    Gerencie os membros da sua organização
                  </CardDescription>
                </div>
                {isOwner && (
                  <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        Adicionar Membro
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Membro</DialogTitle>
                        <DialogDescription>
                          Convide um novo membro para sua organização.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddMember} className="space-y-4">
                        <div>
                          <Label htmlFor="email">Email do Membro</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                            placeholder="usuario@example.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Função</Label>
                          <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Membro</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full">
                          Adicionar Membro
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {organization.organization_members?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organization.organization_members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <span className="inline-block px-2 py-1 rounded text-sm bg-gray-100">
                            {member.role === 'owner'
                              ? 'Proprietário'
                              : member.role === 'admin'
                              ? 'Admin'
                              : 'Membro'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {isOwner && member.role !== 'owner' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-600">Nenhum membro na organização</p>
              )}
            </CardContent>
          </Card>

          {/* Boards Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quadros</CardTitle>
              <CardDescription>
                {organization.boards?.length || 0} quadros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {organization.boards?.map((board) => (
                  <Link
                    key={board.id}
                    href={`/dashboard/organizations/${orgId}/boards/${board.id}`}
                  >
                    <div className="p-3 hover:bg-gray-100 rounded cursor-pointer transition">
                      <p className="font-medium text-sm">{board.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(board.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </Link>
                ))}
                <Dialog open={isAddBoardOpen} onOpenChange={setIsAddBoardOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full gap-2 mt-4"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4" />
                      Novo Quadro
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Quadro</DialogTitle>
                      <DialogDescription>
                        Crie um novo quadro para organizar suas tarefas.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateBoard} className="space-y-4">
                      <div>
                        <Label htmlFor="board-name">Nome do Quadro</Label>
                        <Input
                          id="board-name"
                          value={newBoardName}
                          onChange={(e) => setNewBoardName(e.target.value)}
                          placeholder="Meu Quadro"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Criar Quadro
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
