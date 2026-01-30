'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card as CardComponent } from './Card';
import { CardModal } from './CardModal';
import type { Column as ColumnType, Card } from '@/lib/types';

interface ColumnProps {
  column: ColumnType;
  cards: Card[];
}

export function Column({ column, cards }: ColumnProps) {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const handleAddCard = async (title: string, description: string, dueDate: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: newCard } = await supabase
      .from('cards')
      .insert([
        {
          column_id: column.id,
          board_id: column.board_id,
          title,
          description,
          due_date: dueDate || null,
          position: cards.length,
        },
      ] as any)
      .select()
      .single();

    if (newCard) {
      await supabase.from('card_history').insert([
        {
          card_id: (newCard as any).id,
          user_id: user.id,
          user_email: user.email || '',
          action: 'created',
          to_column_id: column.id,
        },
      ] as any);

      queryClient.invalidateQueries({ queryKey: ['cards'] });
    }

    setShowModal(false);
  };

  const handleDeleteCard = async (cardId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    await supabase.from('cards').delete().eq('id', cardId);

    await supabase.from('card_history').insert([
      {
        card_id: cardId,
        user_id: user.id,
        user_email: user.email || '',
        action: 'deleted',
        from_column_id: column.id,
        changes: { title: card.title, description: card.description },
      },
    ] as any);

    queryClient.invalidateQueries({ queryKey: ['cards'] });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{column.title}</h2>

      <div className="space-y-3 min-h-96">
        {cards.map((card) => (
          <CardComponent
            key={card.id}
            card={card}
            onDelete={() => handleDeleteCard(card.id)}
          />
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <Button
          onClick={() => setShowModal(true)}
          className="w-full"
          variant="outline"
        >
          + Add Card
        </Button>
      </div>

      <CardModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleAddCard}
      />
    </div>
  );
}
