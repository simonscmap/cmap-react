/**
 * Estimate Row Count For Dataset
 *
 * Public facade that orchestrates eligibility check, data preparation,
 * and row count calculation. Returns a discriminated union result.
 */

import logInit from '../../../Services/log-service';
import isEligibleForEstimation from './isEligibleForEstimation';
import prepareRowCountInputsFromDatabase from './prepareRowCountInputsFromDatabase';
import performRowCountMath from './performRowCountMath';
import performRowCountMathV2 from './performRowCountMathV2';
import performRowCountMathV3 from './performRowCountMathV3';

const log = logInit('rowCount/estimation/estimateRowCountForDataset');

/**
 * Estimates row count for a dataset by orchestrating eligibility check,
 * data preparation, and calculation.
 *
 * Returns a discriminated union:
 * - { eligible: false, reason: string } if dataset cannot be estimated
 * - { eligible: true, rowCount: number } if estimation succeeded
 *
 * @param {Object} datasetMetadata - Dataset metadata
 * @param {string} datasetMetadata.shortName - Dataset short name (for depth model lookup)
 * @param {string} datasetMetadata.spatialResolution - Spatial resolution (e.g., "1/2° X 1/2°")
 * @param {string} datasetMetadata.temporalResolution - Temporal resolution (e.g., "Weekly")
 * @param {number} datasetMetadata.latMin - Dataset minimum latitude
 * @param {number} datasetMetadata.latMax - Dataset maximum latitude
 * @param {number} datasetMetadata.lonMin - Dataset minimum longitude
 * @param {number} datasetMetadata.lonMax - Dataset maximum longitude
 * @param {string} datasetMetadata.timeMin - Dataset minimum time
 * @param {string} datasetMetadata.timeMax - Dataset maximum time
 * @param {number} datasetMetadata.depthMin - Dataset minimum depth
 * @param {number} datasetMetadata.depthMax - Dataset maximum depth
 * @param {boolean} datasetMetadata.hasDepth - Whether dataset has depth data
 * @param {number} datasetMetadata.tableCount - Number of tables (default 1)
 * @param {Object} constraints - Store constraints object
 * @param {Object} constraints.spatialBounds - Spatial bounds { latMin, latMax, lonMin, lonMax }
 * @param {boolean} constraints.temporalEnabled - Whether temporal constraints are enabled
 * @param {Object} constraints.temporalRange - Temporal range { timeMin, timeMax }
 * @param {boolean} constraints.depthEnabled - Whether depth constraints are enabled
 * @param {Object} constraints.depthRange - Depth range { depthMin, depthMax }
 * @param {Object} catalogDb - SQLite catalog database (SearchDatabaseApi instance)
 * @returns {Promise<{eligible: false, reason: string} | {eligible: true, rowCount: number}>}
 */
async function estimateRowCountForDataset(
  datasetMetadata,
  constraints,
  catalogDb,
) {
  let result = null;
  let error = null;

  try {
    // Step 1: Check eligibility
    const eligible = isEligibleForEstimation({
      spatialResolution: datasetMetadata.spatialResolution,
      temporalResolution: datasetMetadata.temporalResolution,
    });

    if (!eligible) {
      // Determine specific reason
      if (datasetMetadata.spatialResolution === 'Irregular') {
        return { eligible: false, reason: 'irregular_spatial' };
      }
      if (datasetMetadata.temporalResolution === 'Irregular') {
        return { eligible: false, reason: 'irregular_temporal' };
      }
      return { eligible: false, reason: 'ineligible' };
    }

    // Step 2: Prepare inputs from database (includes depth count computation)
    const resolvedInputs = await prepareRowCountInputsFromDatabase(
      datasetMetadata,
      constraints,
      catalogDb,
    );

    // Step 3: Perform pure calculation
    const rowCount = performRowCountMath(resolvedInputs, constraints);

    // Step 3b: V2 comparison (temporary for testing)
    const rowCountV2 = performRowCountMathV2(resolvedInputs, constraints);
    log.info('row count v2 comparison', {
      dataset: datasetMetadata.shortName,
      original: rowCount,
      v2: rowCountV2,
      match: rowCount === rowCountV2,
    });

    // Step 3c: V3 comparison (temporary for testing)
    const rowCountV3 = performRowCountMathV3(resolvedInputs, constraints);
    log.info('row count v3 comparison', {
      dataset: datasetMetadata.shortName,
      original: rowCount,
      v3: rowCountV3,
      match: rowCount === rowCountV3,
    });

    result = rowCount;
    return { eligible: true, rowCount };
  } catch (err) {
    error = err.message;
    throw err;
  } finally {
    if (result !== null || error !== null) {
      (error ? log.error : log.debug)('row count estimation', {
        datasetName: datasetMetadata.shortName,
        datasetTable: datasetMetadata.tableName,
        status: error ? 'error' : 'success',
        spatialRes: datasetMetadata.spatialResolution,
        temporalRes: datasetMetadata.temporalResolution,
        hasDepth: datasetMetadata.hasDepth,
        constraints,
        estimatedRows: result,
        ...(error && { error }),
      });
    }
  }
}

export default estimateRowCountForDataset;
