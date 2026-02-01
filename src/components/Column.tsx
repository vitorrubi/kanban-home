'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card as CardComponent } from './Card';
import { CardModal } from './CardModal';
import type { Column as ColumnType, Card } from '@/lib/types';
import { SortableContext } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

interface ColumnProps {
  column: ColumnType;
  cards: Card[];
}

export function Column({ column, cards }: ColumnProps) {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  
  // droppable id for dnd-kit
  const containerId = `column-${column.id}`;
  const { setNodeRef, isOver } = useDroppable({ id: containerId });

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
      ])
      .select()
      .single();

    if (newCard) {
      await supabase.from('card_history').insert([
        {
          card_id: newCard.id,
          user_id: user.id,
          user_email: user.email || '',
          action: 'created',
          to_column_id: column.id,
        },
      ]);

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
    ]);

    queryClient.invalidateQueries({ queryKey: ['cards'] });
  };

  return (
    <div
      ref={setNodeRef}
      data-column-id={column.id}
      id={containerId}
      className={`bg-white rounded-lg shadow-md p-4 transition-all ${
        isOver ? 'ring-2 ring-indigo-300 bg-indigo-50' : ''
      }`}
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{column.title}</h2>

      <SortableContext items={cards.map((c) => `card-${c.id}`)}>
        <div className="space-y-3 min-h-96" aria-labelledby={containerId}>
          {cards.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              onDelete={() => handleDeleteCard(card.id)}
            />
          ))}
        </div>
      </SortableContext>

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
