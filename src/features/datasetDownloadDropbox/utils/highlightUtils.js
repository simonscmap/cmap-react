/**
 * Utility functions for highlighting search matches in filenames
 */

/**
 * Generate highlight data from Fuse.js matches
 */
export function generateHighlightData(matches) {
  if (!matches || !matches.length) {
    return [];
  }

  return matches.map(match => ({
    item: match.item,
    highlights: extractHighlightRanges(match.matches),
    score: match.score
  }));
}

/**
 * Extract highlight ranges from Fuse.js match data
 */
export function extractHighlightRanges(fuseMatches) {
  if (!fuseMatches || !fuseMatches.length) {
    return [];
  }

  const highlights = [];
  
  fuseMatches.forEach(match => {
    if (match.key === 'name' && match.indices) {
      match.indices.forEach(([start, end]) => {
        highlights.push({ start, end });
      });
    }
  });

  // Sort and merge overlapping ranges
  return mergeHighlightRanges(highlights);
}

/**
 * Merge overlapping highlight ranges
 */
export function mergeHighlightRanges(ranges) {
  if (!ranges || ranges.length === 0) {
    return [];
  }

  // Sort ranges by start position
  const sorted = ranges.sort((a, b) => a.start - b.start);
  const merged = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    // If ranges overlap or are adjacent, merge them
    if (current.start <= last.end + 1) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push(current);
    }
  }

  return merged;
}

/**
 * Apply highlights to filename text for display
 */
export function applyHighlights(filename, highlights) {
  if (!highlights || highlights.length === 0) {
    return [{ text: filename, highlighted: false }];
  }

  const parts = [];
  let currentIndex = 0;

  highlights.forEach(({ start, end }) => {
    // Add non-highlighted text before this highlight
    if (start > currentIndex) {
      parts.push({
        text: filename.slice(currentIndex, start),
        highlighted: false
      });
    }

    // Add highlighted text
    parts.push({
      text: filename.slice(start, end + 1),
      highlighted: true
    });

    currentIndex = end + 1;
  });

  // Add remaining non-highlighted text
  if (currentIndex < filename.length) {
    parts.push({
      text: filename.slice(currentIndex),
      highlighted: false
    });
  }

  return parts;
}

/**
 * Create highlight data for a single filename
 */
export function createHighlightForFilename(filename, highlights) {
  return {
    filename,
    parts: applyHighlights(filename, highlights)
  };
}