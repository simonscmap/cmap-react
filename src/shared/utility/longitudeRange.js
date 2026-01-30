/**
 * Check if two longitude ranges overlap.
 * Handles ranges that cross the dateline (when lonMin > lonMax).
 *
 * @returns {boolean} True if ranges overlap
 */
export function longitudeRangesOverlap(lonMinA, lonMaxA, lonMinB, lonMaxB) {
  const aCrossesDateline = lonMinA > lonMaxA;

  if (aCrossesDateline) {
    const bInEasternSegment = lonMaxB >= lonMinA;
    const bInWesternSegment = lonMinB <= lonMaxA;
    return bInEasternSegment || bInWesternSegment;
  }

  return lonMinB <= lonMaxA && lonMaxB >= lonMinA;
}

/**
 * Calculate the intersection of two longitude ranges.
 * Handles ranges that cross the dateline (when lonMin > lonMax).
 * Assumes ranges overlap - call longitudeRangesOverlap first to verify.
 *
 * @returns {{ lonMin: number, lonMax: number }} Intersection bounds
 */
export function calculateLongitudeIntersection(lonMinA, lonMaxA, lonMinB, lonMaxB) {
  const aCrossesDateline = lonMinA > lonMaxA;

  if (aCrossesDateline) {
    const bInEasternSegment = lonMaxB >= lonMinA;
    const bInWesternSegment = lonMinB <= lonMaxA;

    if (bInEasternSegment && bInWesternSegment) {
      return {
        lonMin: Math.max(lonMinA, lonMinB),
        lonMax: Math.min(lonMaxA, lonMaxB),
      };
    } else if (bInEasternSegment) {
      return {
        lonMin: Math.max(lonMinA, lonMinB),
        lonMax: lonMaxB,
      };
    } else {
      return {
        lonMin: lonMinB,
        lonMax: Math.min(lonMaxA, lonMaxB),
      };
    }
  }

  return {
    lonMin: Math.max(lonMinA, lonMinB),
    lonMax: Math.min(lonMaxA, lonMaxB),
  };
}
