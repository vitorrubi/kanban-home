import { describe, it, expect } from 'vitest';
import { computeReorder } from './reorder';

describe('computeReorder', () => {
  const makeCard = (id: string, column_id: string, pos: number) => ({
    id,
    column_id,
    title: id,
    description: null,
    due_date: null,
    position: pos,
    board_id: 'board1',
    created_at: '',
    updated_at: '',
  });

  it('moves card between columns and updates positions', () => {
    const cards = [
      makeCard('a', 'todo', 0),
      makeCard('b', 'todo', 1),
      makeCard('c', 'doing', 0),
      makeCard('d', 'doing', 1),
    ];

    const updates = computeReorder(cards, 'b', 'card-c');

    // b moves to before c in doing -> b position 0 in doing, d becomes 1, c becomes 2? but our logic inserts before c
    expect(updates['b']).toEqual({ column_id: 'doing', position: 0 });
  });
});
