/**
 * Integration Tests for Row Count Estimation
 *
 * Tests the estimateRowCount function with various constraint combinations
 * to verify correct calculation of spatial, temporal, and depth dimensions.
 *
 * Test Coverage:
 * - Test 1: Spatial only
 * - Test 2: Spatial + Temporal (Daily)
 * - Test 3: Spatial + Temporal + Depth (Darwin)
 * - Test 4: Spatial + Monthly Climatology
 * - Test 5: Spatial + Temporal + Depth (PISCES)
 */

import estimateRowCount from '../estimateRowCount';
import * as queryTables from '../queryEstimationTables';

// Mock the query functions
jest.mock('../queryEstimationTables');

describe('estimateRowCount - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Spatial Only
   *
   * Dataset: 1° × 1° resolution
   * Constraints: lat 0→10, lon 0→10
   * Calculation:
   *   - latCount = (10 - 0) / 1.0 = 10
   *   - lonCount = (10 - 0) / 1.0 = 10
   *   - dateCount = 1 (no temporal constraints)
   *   - depthCount = 1 (no depth constraints)
   *   - Total = 10 × 10 × 1 × 1 = 100
   */
  it('Test 1: should estimate row count for spatial-only constraints', async () => {
    // Arrange: Mock resolution mappings
    queryTables.querySpatialResolutionMapping.mockResolvedValue({
      value: 1.0,
      units: 'degrees',
    });

    // Mock temporal resolution even though not used (code queries it)
    queryTables.queryTemporalResolutionMapping.mockResolvedValue({
      value: null,
      units: null,
    });

    const datasetMetadata = {
      Table_Name: 'test_dataset_spatial',
      Spatial_Resolution: '1° X 1°',
      Temporal_Resolution: 'Irregular',
    };

    const constraints = {
      spatialBounds: { latMin: 0, latMax: 10, lonMin: 0, lonMax: 10 },
      temporalEnabled: false,
      temporalRange: { timeMin: null, timeMax: null },
      depthEnabled: false,
      depthRange: { depthMin: null, depthMax: null },
    };

    const mockDb = {}; // Not used, just passed through

    // Act
    const result = await estimateRowCount(datasetMetadata, constraints, mockDb);

    // Assert
    const expected = 100;
    expect(Math.round(result)).toBe(expected);

    // Verify mocks were called correctly
    expect(queryTables.querySpatialResolutionMapping).toHaveBeenCalledWith(
      mockDb,
      '1° X 1°'
    );
  });

  /**
   * Test 2: Spatial + Temporal (Daily)
   *
   * Dataset: 1° × 1° resolution, Daily temporal resolution
   * Constraints: lat 0→10, lon 0→10, Jan 1-10, 2020 (9 days)
   * Calculation:
   *   - latCount = (10 - 0) / 1.0 = 10
   *   - lonCount = (10 - 0) / 1.0 = 10
   *   - dayDiff = 9 days
   *   - dateCount = floor(9 / 1) × 1.4 = 9 × 1.4 = 12.6
   *   - depthCount = 1
   *   - Total = 10 × 10 × 12.6 × 1 = 1,260
   */
  it('Test 2: should estimate row count for spatial + temporal (daily)', async () => {
    // Arrange: Mock resolution mappings
    queryTables.querySpatialResolutionMapping.mockResolvedValue({
      value: 1.0,
      units: 'degrees',
    });

    queryTables.queryTemporalResolutionMapping.mockResolvedValue({
      value: 86400, // Daily in seconds
      units: 'seconds',
    });

    const datasetMetadata = {
      Table_Name: 'test_dataset_daily',
      Spatial_Resolution: '1° X 1°',
      Temporal_Resolution: 'Daily',
    };

    const constraints = {
      spatialBounds: { latMin: 0, latMax: 10, lonMin: 0, lonMax: 10 },
      temporalEnabled: true,
      temporalRange: {
        timeMin: '2020-01-01T00:00:00Z',
        timeMax: '2020-01-10T00:00:00Z',
      },
      depthEnabled: false,
      depthRange: { depthMin: null, depthMax: null },
    };

    const mockDb = {};

    // Act
    const result = await estimateRowCount(datasetMetadata, constraints, mockDb);

    // Assert
    const expected = 1260;
    expect(Math.round(result)).toBe(expected);

    // Verify mocks
    expect(queryTables.querySpatialResolutionMapping).toHaveBeenCalledWith(
      mockDb,
      '1° X 1°'
    );
    expect(queryTables.queryTemporalResolutionMapping).toHaveBeenCalledWith(
      mockDb,
      'Daily'
    );
  });

  /**
   * Test 3: Spatial + Temporal + Depth (Darwin)
   *
   * Dataset: 1/2° × 1/2° resolution, Weekly temporal, Darwin depth model
   * Constraints: lat 0→10, lon 0→20, 363 days (51.85 weeks), depth 5-105.31m
   * Calculation:
   *   - latCount = (10 - 0) / 0.5 = 20
   *   - lonCount = (20 - 0) / 0.5 = 40
   *   - dayDiff = 363 days (Jan 1 - Dec 29, 2020)
   *   - dateCount = floor(363 / 7) × 1.4 = 51 × 1.4 = 71.4
   *   - depthCount = 10 (Darwin depths in range 5-105.31)
   *   - Total = 20 × 40 × 71.4 × 10 = 571,200
   */
  it('Test 3: should estimate row count for spatial + temporal + depth (Darwin)', async () => {
    // Arrange: Mock all resolution mappings and depth queries
    queryTables.querySpatialResolutionMapping.mockResolvedValue({
      value: 0.5,
      units: 'degrees',
    });

    queryTables.queryTemporalResolutionMapping.mockResolvedValue({
      value: 604800, // Weekly in seconds
      units: 'seconds',
    });

    queryTables.queryDatasetDepthModel.mockResolvedValue('darwin');

    queryTables.queryDarwinDepthCount.mockResolvedValue(10);

    const datasetMetadata = {
      Table_Name: 'tblDarwin_Test',
      Spatial_Resolution: '1/2° X 1/2°',
      Temporal_Resolution: 'Weekly',
    };

    const constraints = {
      spatialBounds: { latMin: 0, latMax: 10, lonMin: 0, lonMax: 20 },
      temporalEnabled: true,
      temporalRange: {
        timeMin: '2020-01-01T00:00:00Z',
        timeMax: '2020-12-29T00:00:00Z', // 364 days (52 weeks)
      },
      depthEnabled: true,
      depthRange: { depthMin: 5, depthMax: 105.31 },
    };

    const mockDb = {};

    // Act
    const result = await estimateRowCount(datasetMetadata, constraints, mockDb);

    // Assert
    const expected = 571200;
    expect(Math.round(result)).toBe(expected);

    // Verify mocks
    expect(queryTables.querySpatialResolutionMapping).toHaveBeenCalledWith(
      mockDb,
      '1/2° X 1/2°'
    );
    expect(queryTables.queryTemporalResolutionMapping).toHaveBeenCalledWith(
      mockDb,
      'Weekly'
    );
    expect(queryTables.queryDatasetDepthModel).toHaveBeenCalledWith(
      mockDb,
      'tblDarwin_Test'
    );
    expect(queryTables.queryDarwinDepthCount).toHaveBeenCalledWith(
      mockDb,
      5,
      105.31
    );
  });

  /**
   * Test 4: Spatial + Monthly Climatology
   *
   * Dataset: 1/4° × 1/4° resolution, Monthly Climatology
   * Constraints: lat -5→5, lon -10→10, Jan 1 → Dec 31, 2020 (12 months)
   * Calculation:
   *   - latCount = (5 - (-5)) / 0.25 = 10 / 0.25 = 40
   *   - lonCount = (10 - (-10)) / 0.25 = 20 / 0.25 = 80
   *   - monthCount = 12 (full year → all 12 months)
   *   - dateCount = 12 × 1.4 = 16.8
   *   - depthCount = 1
   *   - Total = 40 × 80 × 16.8 × 1 = 53,760
   */
  it('Test 4: should estimate row count for spatial + monthly climatology', async () => {
    // Arrange: Mock resolution mappings
    queryTables.querySpatialResolutionMapping.mockResolvedValue({
      value: 0.25,
      units: 'degrees',
    });

    // Monthly Climatology returns null for temporal mapping
    queryTables.queryTemporalResolutionMapping.mockResolvedValue({
      value: null,
      units: null,
    });

    const datasetMetadata = {
      Table_Name: 'test_dataset_climatology',
      Spatial_Resolution: '1/4° X 1/4°',
      Temporal_Resolution: 'Monthly Climatology',
    };

    const constraints = {
      spatialBounds: { latMin: -5, latMax: 5, lonMin: -10, lonMax: 10 },
      temporalEnabled: true,
      temporalRange: {
        timeMin: '2020-01-01T00:00:00Z',
        timeMax: '2020-12-31T23:59:59Z',
      },
      depthEnabled: false,
      depthRange: { depthMin: null, depthMax: null },
    };

    const mockDb = {};

    // Act
    const result = await estimateRowCount(datasetMetadata, constraints, mockDb);

    // Assert
    const expected = 53760;
    expect(Math.round(result)).toBe(expected);

    // Verify mocks
    expect(queryTables.querySpatialResolutionMapping).toHaveBeenCalledWith(
      mockDb,
      '1/4° X 1/4°'
    );
    expect(queryTables.queryTemporalResolutionMapping).toHaveBeenCalledWith(
      mockDb,
      'Monthly Climatology'
    );
  });

  /**
   * Test 5: Spatial + Temporal + Depth (PISCES)
   *
   * Dataset: 1/12° × 1/12° resolution, Monthly temporal, PISCES depth model
   * Constraints: lat 30→35, lon -130→-120, 12 months, depth 0-100m
   * Calculation:
   *   - latCount = (35 - 30) / 0.083333 = 5 / 0.083333 ≈ 60.0002
   *   - lonCount = (-120 - (-130)) / 0.083333 = 10 / 0.083333 ≈ 120.0005
   *   - dayDiff = 365 days (Jan 1 - Dec 31, 2020)
   *   - dateCount = floor(365 / 30) × 1.4 = 12 × 1.4 = 16.8
   *   - depthCount = 22 (PISCES depths in range 0-100)
   *   - Total ≈ 60.0002 × 120.0005 × 16.8 × 22 = 2,661,141
   */
  it('Test 5: should estimate row count for spatial + temporal + depth (PISCES)', async () => {
    // Arrange: Mock all resolution mappings and depth queries
    queryTables.querySpatialResolutionMapping.mockResolvedValue({
      value: 0.083333,
      units: 'degrees',
    });

    queryTables.queryTemporalResolutionMapping.mockResolvedValue({
      value: 2592000, // Monthly in seconds
      units: 'seconds',
    });

    queryTables.queryDatasetDepthModel.mockResolvedValue('pisces');

    queryTables.queryPiscesDepthCount.mockResolvedValue(22);

    const datasetMetadata = {
      Table_Name: 'tblPisces_Test',
      Spatial_Resolution: '1/12° X 1/12°',
      Temporal_Resolution: 'Monthly',
    };

    const constraints = {
      spatialBounds: { latMin: 30, latMax: 35, lonMin: -130, lonMax: -120 },
      temporalEnabled: true,
      temporalRange: {
        timeMin: '2020-01-01T00:00:00Z',
        timeMax: '2020-12-31T23:59:59Z',
      },
      depthEnabled: true,
      depthRange: { depthMin: 0, depthMax: 100 },
    };

    const mockDb = {};

    // Act
    const result = await estimateRowCount(datasetMetadata, constraints, mockDb);

    // Assert
    const expected = 2661141;
    expect(Math.round(result)).toBe(expected);

    // Verify mocks
    expect(queryTables.querySpatialResolutionMapping).toHaveBeenCalledWith(
      mockDb,
      '1/12° X 1/12°'
    );
    expect(queryTables.queryTemporalResolutionMapping).toHaveBeenCalledWith(
      mockDb,
      'Monthly'
    );
    expect(queryTables.queryDatasetDepthModel).toHaveBeenCalledWith(
      mockDb,
      'tblPisces_Test'
    );
    expect(queryTables.queryPiscesDepthCount).toHaveBeenCalledWith(
      mockDb,
      0,
      100
    );
  });
});
