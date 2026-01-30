'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Card as CardType } from '@/lib/types';

interface CardProps {
  card: CardType;
  onDelete: () => void;
}

export function Card({ card, onDelete }: CardProps) {
  const dueDate = card.due_date
    ? new Date(card.due_date).toLocaleDateString()
    : null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 text-sm">{card.title}</h3>
          {card.description && (
            <p className="text-xs text-gray-600 mt-1">{card.description}</p>
          )}
          {dueDate && (
            <p className="text-xs text-gray-500 mt-2">Due: {dueDate}</p>
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
