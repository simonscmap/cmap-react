/**
 * Check if two longitude ranges overlap.
 * Handles ranges that cross the dateline (when lonMin > lonMax).
 *
 * @returns {boolean} True if ranges overlap
 */
export function longitudeRangesOverlap(lonMinA, lonMaxA, lonMinB, lonMaxB) {
  const aCrossesDateline = lonMinA > lonMaxA;
  const bCrossesDateline = lonMinB > lonMaxB;

  if (aCrossesDateline && bCrossesDateline) {
    return true;
  }

  if (aCrossesDateline) {
    return lonMaxB >= lonMinA || lonMinB <= lonMaxA;
  }

  if (bCrossesDateline) {
    return lonMaxA >= lonMinB || lonMinA <= lonMaxB;
  }

  return lonMinB <= lonMaxA && lonMaxB >= lonMinA;
}

export function calculateLongitudeWidth(lonMin, lonMax) {
  if (lonMin > lonMax) {
    return 360 - lonMin + lonMax;
  }
  return lonMax - lonMin;
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
  const bCrossesDateline = lonMinB > lonMaxB;

  if (aCrossesDateline && bCrossesDateline) {
    return {
      lonMin: Math.max(lonMinA, lonMinB),
      lonMax: Math.min(lonMaxA, lonMaxB),
    };
  }

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

  if (bCrossesDateline) {
    const aInEasternSegment = lonMaxA >= lonMinB;
    const aInWesternSegment = lonMinA <= lonMaxB;

    if (aInEasternSegment && aInWesternSegment) {
      return {
        lonMin: Math.max(lonMinA, lonMinB),
        lonMax: Math.min(lonMaxA, lonMaxB),
      };
    } else if (aInEasternSegment) {
      return {
        lonMin: Math.max(lonMinA, lonMinB),
        lonMax: lonMaxA,
      };
    } else {
      return {
        lonMin: lonMinA,
        lonMax: Math.min(lonMaxA, lonMaxB),
      };
    }
  }

  return {
    lonMin: Math.max(lonMinA, lonMinB),
    lonMax: Math.min(lonMaxA, lonMaxB),
  };
}

export function calculateLongitudeIntersectionWidth(lonMinA, lonMaxA, lonMinB, lonMaxB) {
  if (!longitudeRangesOverlap(lonMinA, lonMaxA, lonMinB, lonMaxB)) {
    return 0;
  }

  const aCrossesDateline = lonMinA > lonMaxA;
  const bCrossesDateline = lonMinB > lonMaxB;

  if (aCrossesDateline && bCrossesDateline) {
    const intersection = calculateLongitudeIntersection(lonMinA, lonMaxA, lonMinB, lonMaxB);
    return calculateLongitudeWidth(intersection.lonMin, intersection.lonMax);
  }

  if (aCrossesDateline) {
    const bInEasternSegment = lonMaxB >= lonMinA;
    const bInWesternSegment = lonMinB <= lonMaxA;

    if (bInEasternSegment && bInWesternSegment) {
      const easternWidth = Math.min(180, lonMaxB) - Math.max(lonMinA, lonMinB);
      const westernWidth = Math.min(lonMaxA, lonMaxB) - Math.max(-180, lonMinB);
      return Math.max(0, easternWidth) + Math.max(0, westernWidth);
    } else if (bInEasternSegment) {
      return Math.max(0, lonMaxB - Math.max(lonMinA, lonMinB));
    } else {
      return Math.max(0, Math.min(lonMaxA, lonMaxB) - lonMinB);
    }
  }

  if (bCrossesDateline) {
    const aInEasternSegment = lonMaxA >= lonMinB;
    const aInWesternSegment = lonMinA <= lonMaxB;

    if (aInEasternSegment && aInWesternSegment) {
      const easternWidth = Math.min(180, lonMaxA) - Math.max(lonMinA, lonMinB);
      const westernWidth = Math.min(lonMaxA, lonMaxB) - Math.max(-180, lonMinA);
      return Math.max(0, easternWidth) + Math.max(0, westernWidth);
    } else if (aInEasternSegment) {
      return Math.max(0, lonMaxA - Math.max(lonMinA, lonMinB));
    } else {
      return Math.max(0, Math.min(lonMaxA, lonMaxB) - lonMinA);
    }
  }

  const intersection = calculateLongitudeIntersection(lonMinA, lonMaxA, lonMinB, lonMaxB);
  return Math.max(0, intersection.lonMax - intersection.lonMin);
}
