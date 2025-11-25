/**
 * Format coverage percentage with edge case handling
 * @param {number} value - Decimal value (0-1) or percentage (0-100)
 * @returns {string} Formatted percentage or N/A
 */
export function formatCoveragePercent(value) {
  if (typeof value !== 'number') return 'N/A';

  const percent = value <= 1 ? value * 100 : value;
  const rounded = parseFloat(percent.toFixed(1));

  if (rounded === 0 && value > 0) {
    return '< 0.05%';
  }

  return `${rounded.toFixed(1)}%`;
}
