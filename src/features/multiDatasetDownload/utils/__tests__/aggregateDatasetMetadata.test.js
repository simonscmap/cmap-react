import { aggregateDatasetMetadata } from '../aggregateDatasetMetadata';

let makeDataset = (overrides) => {
  return Object.assign({
    latMin: -90,
    latMax: 90,
    lonMin: -180,
    lonMax: 180,
    depthMin: 0,
    depthMax: 500,
    timeMin: '2020-01-01T00:00:00.000Z',
    timeMax: '2020-12-31T00:00:00.000Z',
    temporalResolution: 'Daily',
  }, overrides);
};

let makeClimatologyDataset = (overrides) => {
  return makeDataset(Object.assign({
    temporalResolution: 'Monthly Climatology',
    timeMin: null,
    timeMax: null,
  }, overrides));
};

describe('aggregateDatasetMetadata', () => {
  describe('null/empty input', () => {
    it('returns null for null input', () => {
      expect(aggregateDatasetMetadata(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(aggregateDatasetMetadata(undefined)).toBeNull();
    });

    it('returns null for empty array', () => {
      expect(aggregateDatasetMetadata([])).toBeNull();
    });

    it('returns null when no datasets have valid spatial bounds', () => {
      let datasets = [{ temporalResolution: 'Daily', timeMin: '2020-01-01' }];
      expect(aggregateDatasetMetadata(datasets)).toBeNull();
    });
  });

  describe('spatial bounds aggregation', () => {
    it('computes min/max across multiple datasets', () => {
      let datasets = [
        makeDataset({ latMin: -10, latMax: 10, lonMin: -20, lonMax: 20 }),
        makeDataset({ latMin: -30, latMax: 30, lonMin: -40, lonMax: 40 }),
      ];
      let result = aggregateDatasetMetadata(datasets);
      expect(result.Lat_Min).toBe(-30);
      expect(result.Lat_Max).toBe(30);
      expect(result.Lon_Min).toBe(-40);
      expect(result.Lon_Max).toBe(40);
    });
  });

  describe('temporal bounds aggregation', () => {
    it('uses earliest timeMin and latest timeMax', () => {
      let datasets = [
        makeDataset({ timeMin: '2019-06-01T00:00:00.000Z', timeMax: '2020-06-01T00:00:00.000Z' }),
        makeDataset({ timeMin: '2018-01-01T00:00:00.000Z', timeMax: '2021-12-31T00:00:00.000Z' }),
      ];
      let result = aggregateDatasetMetadata(datasets);
      expect(result.Time_Min).toBe('2018-01-01T00:00:00.000Z');
      expect(result.Time_Max).toBe('2021-12-31T00:00:00.000Z');
    });
  });

  describe('depth bounds aggregation', () => {
    it('computes min/max with 0 default for missing values', () => {
      let datasets = [
        makeDataset({ depthMin: 10, depthMax: 200 }),
        makeDataset({ depthMin: null, depthMax: 500 }),
      ];
      let result = aggregateDatasetMetadata(datasets);
      expect(result.Depth_Min).toBe(0);
      expect(result.Depth_Max).toBe(500);
    });
  });

  describe('climatology detection — hasMixedClimatology', () => {
    it('returns hasMixedClimatology=false for all-climatology collection', () => {
      let datasets = [
        makeClimatologyDataset({ latMin: -10, latMax: 10, lonMin: -20, lonMax: 20 }),
        makeClimatologyDataset({ latMin: -30, latMax: 30, lonMin: -40, lonMax: 40 }),
      ];
      let result = aggregateDatasetMetadata(datasets);
      expect(result.hasMixedClimatology).toBe(false);
    });

    it('returns hasMixedClimatology=true for mixed collection', () => {
      let datasets = [
        makeClimatologyDataset({ latMin: -10, latMax: 10, lonMin: -20, lonMax: 20 }),
        makeDataset({ latMin: -30, latMax: 30, lonMin: -40, lonMax: 40 }),
      ];
      let result = aggregateDatasetMetadata(datasets);
      expect(result.hasMixedClimatology).toBe(true);
    });

    it('returns hasMixedClimatology=false for no-climatology collection', () => {
      let datasets = [
        makeDataset(),
        makeDataset({ temporalResolution: 'Weekly' }),
      ];
      let result = aggregateDatasetMetadata(datasets);
      expect(result.hasMixedClimatology).toBe(false);
    });

    it('returns hasMixedClimatology=false for single climatology dataset', () => {
      let datasets = [makeClimatologyDataset()];
      let result = aggregateDatasetMetadata(datasets);
      expect(result.hasMixedClimatology).toBe(false);
    });

    it('returns hasMixedClimatology=false for single non-clim dataset', () => {
      let datasets = [makeDataset()];
      let result = aggregateDatasetMetadata(datasets);
      expect(result.hasMixedClimatology).toBe(false);
    });
  });

  describe('climatology detection — Temporal_Resolution', () => {
    it('sets Temporal_Resolution to Monthly Climatology when all datasets are clim', () => {
      let datasets = [
        makeClimatologyDataset(),
        makeClimatologyDataset(),
      ];
      let result = aggregateDatasetMetadata(datasets);
      expect(result.Temporal_Resolution).toBe('Monthly Climatology');
    });

    it('sets Temporal_Resolution to daily for mixed collection', () => {
      let datasets = [
        makeClimatologyDataset(),
        makeDataset(),
      ];
      let result = aggregateDatasetMetadata(datasets);
      expect(result.Temporal_Resolution).toBe('daily');
    });

    it('sets Temporal_Resolution to daily even when first dataset is climatology (regression)', () => {
      let datasets = [
        makeClimatologyDataset(),
        makeDataset({ temporalResolution: 'Weekly' }),
      ];
      let result = aggregateDatasetMetadata(datasets);
      expect(result.Temporal_Resolution).toBe('daily');
    });

    it('uses first dataset resolution for no-clim collection', () => {
      let datasets = [
        makeDataset({ temporalResolution: 'Weekly' }),
        makeDataset({ temporalResolution: 'Daily' }),
      ];
      let result = aggregateDatasetMetadata(datasets);
      expect(result.Temporal_Resolution).toBe('Weekly');
    });

    it('defaults to daily when first dataset has no temporalResolution', () => {
      let datasets = [
        makeDataset({ temporalResolution: null }),
      ];
      let result = aggregateDatasetMetadata(datasets);
      expect(result.Temporal_Resolution).toBe('daily');
    });
  });

  describe('all-climatology synthetic dates', () => {
    it('uses synthetic dates when all datasets have null times', () => {
      let datasets = [
        makeClimatologyDataset(),
        makeClimatologyDataset(),
      ];
      let result = aggregateDatasetMetadata(datasets);
      expect(result.Time_Min).toBe('2025-01-01T00:00:00.000Z');
      expect(result.Time_Max).toBe('2025-12-31T00:00:00.000Z');
    });
  });
});
