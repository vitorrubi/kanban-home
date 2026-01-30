import type { Card } from './types';

// Reorders cards when dragging between or within columns.
// Returns map of cardId -> { column_id, position }
export function computeReorder(
  cards: Card[],
  activeCardId: string,
  overId: string
): Record<string, { column_id: string; position: number }> {
  const active = cards.find((c) => c.id === activeCardId);
  if (!active) return {};

  const targetIsCard = overId.startsWith('card-');
  const targetCardId = targetIsCard ? overId.replace('card-', '') : null;
  const targetColumnId = targetIsCard
    ? cards.find((c) => c.id === targetCardId)?.column_id || null
    : overId.startsWith('column-')
    ? overId.replace('column-', '')
    : null;

  if (!targetColumnId) return {};

  // build arrays per column
  const columns: Record<string, Card[]> = {};
  for (const c of cards) {
    if (!columns[c.column_id]) columns[c.column_id] = [];
    columns[c.column_id].push(c);
  }

  // ensure destination column array exists (handle empty columns)
  if (!columns[targetColumnId]) columns[targetColumnId] = [];

  // remove active from its source array
  const srcArr = columns[active.column_id] || [];
  const srcIndex = srcArr.findIndex((c) => c.id === activeCardId);
  if (srcIndex >= 0) srcArr.splice(srcIndex, 1);

  // destination array reference (now guaranteed to exist on columns)
  const destArr = columns[targetColumnId];

  // determine insert index
  let insertIndex = destArr.length; // default to end
  if (targetIsCard && targetCardId) {
    const idx = destArr.findIndex((c) => c.id === targetCardId);
    insertIndex = idx >= 0 ? idx : destArr.length;
  }

  // insert active into destArr at insertIndex
  const movedCard = { ...active, column_id: targetColumnId } as Card;
  destArr.splice(insertIndex, 0, movedCard);

  // compute new positions for affected columns
  const updates: Record<string, { column_id: string; position: number }> = {};

  if (columns[active.column_id]) {
    columns[active.column_id].forEach((c, i) => {
      if (c.position !== i) updates[c.id] = { column_id: c.column_id, position: i };
    });
  }

  if (columns[targetColumnId]) {
    columns[targetColumnId].forEach((c, i) => {
      if (c.id === activeCardId) {
        updates[c.id] = { column_id: c.column_id, position: i };
      } else if (c.position !== i) {
        updates[c.id] = { column_id: c.column_id, position: i };
      }
    });
  }

  return updates;
}

export default computeReorder;
