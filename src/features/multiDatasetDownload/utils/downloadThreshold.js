import { DOWNLOAD_LIMITS } from '../../../shared/constants/downloadConstants';

const MAX_ROW_THRESHOLD = DOWNLOAD_LIMITS.MAX_ROW_THRESHOLD;

export function calculateTotalRows(
  selectedDatasets,
  calculatedRowCounts,
  originalRowCounts,
) {
  let total = 0;
  selectedDatasets.forEach((shortName) => {
    const count =
      calculatedRowCounts[shortName] ?? originalRowCounts[shortName] ?? 0;
    total += count;
  });
  return total;
}

export function getThresholdStatus(
  selectedDatasets,
  calculatedRowCounts,
  originalRowCounts,
  isLoading,
) {
  const totalRows = calculateTotalRows(
    selectedDatasets,
    calculatedRowCounts,
    originalRowCounts,
  );
  return {
    totalRows,
    maxRows: MAX_ROW_THRESHOLD,
    isLoading,
  };
}
