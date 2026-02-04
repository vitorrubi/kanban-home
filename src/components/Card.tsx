'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Card as CardType } from '@/lib/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CardProps {
  card: CardType;
  onDelete: () => void;
}

export function Card({ card, onDelete }: CardProps) {
  const dueDate = card.due_date
    ? new Date(card.due_date).toLocaleDateString()
    : null;

  const id = `card-${card.id}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-gray-50 border border-gray-200 rounded-md p-3 transition-shadow ${
        isDragging ? 'shadow-2xl scale-105 z-50' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 text-sm">{card.title}</h3>
          {card.description && (
            <p className="text-xs text-gray-600 mt-1">{card.description}</p>
          )}
          {dueDate && (
            <p className="text-xs text-gray-500 mt-2">Prazo: {dueDate}</p>
          )}
        </div>
        <Button
          onClick={onDelete}
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
