/**
 * Creates a comparator that pins a specific item to the top of a sorted list,
 * then applies the base comparator to all other items.
 *
 * @param {Function} baseComparator - The original comparator function to use for non-priority items
 * @param {*} priorityId - The ID of the item to pin to the top (null/undefined disables priority)
 * @returns {Function} A comparator function that pins the priority item first
 *
 * @example
 * const baseComparator = (a, b) => a.name.localeCompare(b.name);
 * const priorityComparator = createPriorityComparator(baseComparator, 'item-123');
 * const sorted = [...items].sort(priorityComparator);
 * // item-123 will appear first, followed by all other items sorted by name
 */
export const createPriorityComparator = (baseComparator, priorityId) => {
  // If no priority ID is set, just use the base comparator
  if (priorityId == null) {
    return baseComparator;
  }

  return (a, b) => {
    // If 'a' is the priority item, it should come first (return negative)
    if (a.id === priorityId) {
      return -1;
    }
    // If 'b' is the priority item, it should come first (return positive)
    if (b.id === priorityId) {
      return 1;
    }
    // Neither is the priority item, use base comparator
    return baseComparator(a, b);
  };
};
