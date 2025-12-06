import { apiUrl, postOptions } from '../../../api/config';

const rowCountsApi = {};

/**
 * Calculate row counts for datasets based on search constraints
 * @param {string[]} shortNames - Array of dataset short names
 * @param {Object} constraints - Search constraints object
 * @param {Object} constraints.spatial - Spatial bounds (latMin, latMax, lonMin, lonMax)
 * @param {Object} [constraints.temporal] - Optional temporal range (min, max as ISO date strings)
 * @param {Object} [constraints.depth] - Optional depth range (min, max)
 * @returns {Promise<Response>} Response with calculated row counts, skipped datasets, and failed datasets
 * @throws {Error} 400: Validation errors, 500: Server error
 * @description Calculates actual row counts for datasets based on search constraints.
 * Automatically excludes cluster-only datasets (only available on cluster server, too large for constrained queries).
 *
 * Returns:
 * - results: Object mapping shortName to row count for successfully calculated datasets
 * - skipped: Array of dataset shortNames that were skipped (cluster-only datasets)
 * - failed: Array of dataset shortNames that failed calculation
 * - metadata: Summary statistics (totalCalculated, totalSkipped, totalFailed)
 *
 * NOTE: This endpoint does NOT require authentication.
 *
 * @example
 * const result = await collectionsAPI.calculateRowCounts(
 *   ['dataset1', 'dataset2', 'cluster_dataset'],
 *   {
 *     spatial: { latMin: 30, latMax: 40, lonMin: -120, lonMax: -110 },
 *     temporal: { min: '2020-01-01', max: '2020-12-31' },
 *     depth: { min: 0, max: 100 }
 *   }
 * );
 *
 * // Response:
 * // {
 * //   results: { dataset1: 12345, dataset2: 67890 },
 * //   skipped: ['cluster_dataset'],
 * //   failed: ['problem_dataset'],
 * //   metadata: { totalCalculated: 2, totalSkipped: 1, totalFailed: 1 }
 * // }
 */
rowCountsApi.calculateRowCounts = async function (
  shortNames,
  constraints,
  signal,
) {
  var endpoint = apiUrl + '/api/collections/calculate-row-counts';

  return await fetch(endpoint, {
    ...postOptions,
    body: JSON.stringify({
      shortNames: shortNames,
      constraints: constraints,
    }),
    signal: signal,
  });
};

export default rowCountsApi;
