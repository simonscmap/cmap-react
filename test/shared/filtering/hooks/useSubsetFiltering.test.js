import { renderHook, act } from '@testing-library/react-hooks';
import useSubsetFiltering from '../../../../src/shared/filtering/hooks/useSubsetFiltering';
import * as dateHelpers from '../../../../src/shared/filtering/utils/dateHelpers';

// Mock the date helpers to ensure consistent test behavior
jest.mock('../../../../src/shared/filtering/utils/dateHelpers');

describe('useSubsetFiltering', () => {
  // Test implementation array - ready for future Zustand implementation
  const testCases = [
    { name: 'React Hook', useHook: useSubsetFiltering },
    // Future: { name: 'Zustand Hook', useHook: useSubsetFilteringZustand },
  ];

  // Mock dataset fixtures
  const mockDatasets = {
    normal: {
      Lat_Min: -45.5,
      Lat_Max: 67.8,
      Lon_Min: -180,
      Lon_Max: 180,
      Depth_Min: 0,
      Depth_Max: 5000,
      Time_Min: '2020-01-01T00:00:00.000Z',
      Time_Max: '2023-12-31T23:59:59.000Z',
      Temporal_Resolution: 'monthly',
    },

    monthlyClimatology: {
      Lat_Min: -90,
      Lat_Max: 90,
      Lon_Min: -180,
      Lon_Max: 180,
      Depth_Min: 0,
      Depth_Max: 1000,
      Time_Min: '2020-01-01T00:00:00.000Z',
      Time_Max: '2020-12-31T23:59:59.000Z',
      Temporal_Resolution: 'monthly climatology',
    },

    missingOptionalFields: {
      Lat_Min: 10,
      Lat_Max: 20,
      Lon_Min: -10,
      Lon_Max: 10,
      Depth_Min: 0,
      Depth_Max: 100,
      // Missing Time_Min, Time_Max, Temporal_Resolution
    },

    edgeValues: {
      Lat_Min: -90,
      Lat_Max: 90,
      Lon_Min: -180,
      Lon_Max: 180,
      Depth_Min: 0,
      Depth_Max: 11000, // Challenger Deep
      Time_Min: '1900-01-01T00:00:00.000Z',
      Time_Max: '2100-12-31T23:59:59.000Z',
      Temporal_Resolution: 'daily',
    },
  };

  // Mock return values for date helpers
  const mockInitialRangeValues = {
    maxDays: 1461, // ~4 years
    lat: { start: -45.5, end: 67.8 },
    lon: { start: -180, end: 180 },
    time: { start: 0, end: 1461 },
    depth: { start: 0, end: 5000 },
  };

  beforeEach(() => {
    // Setup default mocks
    dateHelpers.getInitialRangeValues.mockReturnValue(mockInitialRangeValues);
    dateHelpers.getIsMonthlyClimatology.mockReturnValue(false);
    dateHelpers.dateToDateString.mockImplementation((date) => {
      if (typeof date === 'string') {
        return date.split('T')[0];
      }
      return new Date(date).toISOString().split('T')[0];
    });
    dateHelpers.dateToDay.mockImplementation((min, date) => {
      const minTime = new Date(min).getTime();
      const dateTime = new Date(date).getTime();
      return Math.ceil((dateTime - minTime) / (24 * 60 * 60 * 1000));
    });
    dateHelpers.extractDateFromString.mockImplementation((dateStr) => {
      const [year, month, day] = dateStr.split('-');
      return new Date(year, parseInt(month) - 1, day);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Run interface tests for each implementation
  testCases.forEach(({ name, useHook }) => {
    describe(`${name} Implementation`, () => {
      describe('Hook Interface Structure', () => {
        test('returns correct interface structure with all expected properties', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          expect(result.current).toHaveProperty('filterValues');
          expect(result.current).toHaveProperty('filterSetters');
          expect(result.current).toHaveProperty('datasetFilterBounds');
          expect(result.current).toHaveProperty('dateHandling');
          expect(result.current).toHaveProperty('isFiltered');
          expect(result.current).toHaveProperty('isInvalid');
          expect(result.current).toHaveProperty('setInvalidFlag');
        });

        test('filterValues contains all expected properties', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          const { filterValues } = result.current;
          expect(filterValues).toHaveProperty('isFiltered');
          expect(filterValues).toHaveProperty('temporalResolution');
          expect(filterValues).toHaveProperty('lonStart');
          expect(filterValues).toHaveProperty('lonEnd');
          expect(filterValues).toHaveProperty('latStart');
          expect(filterValues).toHaveProperty('latEnd');
          expect(filterValues).toHaveProperty('timeStart');
          expect(filterValues).toHaveProperty('timeEnd');
          expect(filterValues).toHaveProperty('depthStart');
          expect(filterValues).toHaveProperty('depthEnd');
          expect(filterValues).toHaveProperty('Time_Min');
        });

        test('filterSetters contains all expected functions', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          const { filterSetters } = result.current;
          expect(filterSetters).toHaveProperty('setTimeStart');
          expect(filterSetters).toHaveProperty('setTimeEnd');
          expect(filterSetters).toHaveProperty('setLatStart');
          expect(filterSetters).toHaveProperty('setLatEnd');
          expect(filterSetters).toHaveProperty('setLonStart');
          expect(filterSetters).toHaveProperty('setLonEnd');
          expect(filterSetters).toHaveProperty('setDepthStart');
          expect(filterSetters).toHaveProperty('setDepthEnd');

          // Verify all are functions
          Object.values(filterSetters).forEach((setter) => {
            expect(typeof setter).toBe('function');
          });
        });

        test('datasetFilterBounds contains all expected bounds', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          const { datasetFilterBounds } = result.current;
          expect(datasetFilterBounds).toHaveProperty('latMin');
          expect(datasetFilterBounds).toHaveProperty('latMax');
          expect(datasetFilterBounds).toHaveProperty('lonMin');
          expect(datasetFilterBounds).toHaveProperty('lonMax');
          expect(datasetFilterBounds).toHaveProperty('depthMin');
          expect(datasetFilterBounds).toHaveProperty('depthMax');
          expect(datasetFilterBounds).toHaveProperty('timeMin');
          expect(datasetFilterBounds).toHaveProperty('timeMax');
          expect(datasetFilterBounds).toHaveProperty('maxDays');
        });

        test('dateHandling contains all expected properties and functions', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          const { dateHandling } = result.current;
          expect(dateHandling).toHaveProperty('isMonthlyClimatology');
          expect(dateHandling).toHaveProperty('handleSetStartDate');
          expect(dateHandling).toHaveProperty('handleSetEndDate');
          expect(dateHandling).toHaveProperty('validTimeMin');
          expect(dateHandling).toHaveProperty('validTimeMax');

          expect(typeof dateHandling.handleSetStartDate).toBe('function');
          expect(typeof dateHandling.handleSetEndDate).toBe('function');
        });
      });

      describe('Initial State and Bounds', () => {
        test('initializes filter values from dataset bounds', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          const { filterValues } = result.current;
          expect(filterValues.latStart).toBe(mockInitialRangeValues.lat.start);
          expect(filterValues.latEnd).toBe(mockInitialRangeValues.lat.end);
          expect(filterValues.lonStart).toBe(mockInitialRangeValues.lon.start);
          expect(filterValues.lonEnd).toBe(mockInitialRangeValues.lon.end);
          expect(filterValues.timeStart).toBe(
            mockInitialRangeValues.time.start,
          );
          expect(filterValues.timeEnd).toBe(mockInitialRangeValues.time.end);
          expect(filterValues.depthStart).toBe(
            mockInitialRangeValues.depth.start,
          );
          expect(filterValues.depthEnd).toBe(mockInitialRangeValues.depth.end);
        });

        test('calls getInitialRangeValues with dataset', () => {
          renderHook(() => useHook(mockDatasets.normal));

          expect(dateHelpers.getInitialRangeValues).toHaveBeenCalledWith(
            mockDatasets.normal,
          );
        });

        test('datasetFilterBounds reflects dataset properties', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          const { datasetFilterBounds } = result.current;
          expect(datasetFilterBounds.latMin).toBe(mockDatasets.normal.Lat_Min);
          expect(datasetFilterBounds.latMax).toBe(mockDatasets.normal.Lat_Max);
          expect(datasetFilterBounds.lonMin).toBe(mockDatasets.normal.Lon_Min);
          expect(datasetFilterBounds.lonMax).toBe(mockDatasets.normal.Lon_Max);
          expect(datasetFilterBounds.depthMin).toBe(
            mockDatasets.normal.Depth_Min,
          );
          expect(datasetFilterBounds.depthMax).toBe(
            mockDatasets.normal.Depth_Max,
          );
          expect(datasetFilterBounds.timeMin).toBe(
            mockDatasets.normal.Time_Min,
          );
          expect(datasetFilterBounds.timeMax).toBe(
            mockDatasets.normal.Time_Max,
          );
          expect(datasetFilterBounds.maxDays).toBe(
            mockInitialRangeValues.maxDays,
          );
        });

        test('handles undefined/null dataset gracefully', () => {
          const mockEmptyInitialValues = {
            maxDays: 0,
            lat: { start: 0, end: 0 },
            lon: { start: 0, end: 0 },
            time: { start: 0, end: 0 },
            depth: { start: 0, end: 0 },
          };

          dateHelpers.getInitialRangeValues.mockReturnValue(
            mockEmptyInitialValues,
          );

          const { result } = renderHook(() => useHook(null));

          expect(result.current.filterValues).toBeDefined();
          expect(result.current.datasetFilterBounds).toBeDefined();
          expect(result.current.dateHandling).toBeDefined();
        });
      });

      describe('Monthly Climatology Detection', () => {
        test('detects monthly climatology datasets', () => {
          dateHelpers.getIsMonthlyClimatology.mockReturnValue(true);

          const { result } = renderHook(() =>
            useHook(mockDatasets.monthlyClimatology),
          );

          expect(result.current.dateHandling.isMonthlyClimatology).toBe(true);
          expect(dateHelpers.getIsMonthlyClimatology).toHaveBeenCalledWith(
            'monthly climatology',
          );
        });

        test('returns false for regular datasets', () => {
          dateHelpers.getIsMonthlyClimatology.mockReturnValue(false);

          const { result } = renderHook(() => useHook(mockDatasets.normal));

          expect(result.current.dateHandling.isMonthlyClimatology).toBe(false);
          expect(dateHelpers.getIsMonthlyClimatology).toHaveBeenCalledWith(
            'monthly',
          );
        });

        test('returns false when Temporal_Resolution is missing', () => {
          dateHelpers.getIsMonthlyClimatology.mockReturnValue(false);

          const { result } = renderHook(() =>
            useHook(mockDatasets.missingOptionalFields),
          );

          expect(result.current.dateHandling.isMonthlyClimatology).toBe(false);
        });
      });

      describe('isFiltered Logic and State Change Detection', () => {
        test('returns false when all values match initial defaults', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          // Initially, all values should match defaults so isFiltered should be false
          expect(result.current.isFiltered).toBe(false);
          expect(result.current.filterValues.isFiltered).toBe(false);
        });

        test('returns false when values are explicitly set to initial bounds', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          // Explicitly set values to their initial bounds
          act(() => {
            result.current.filterSetters.setLatStart(
              mockInitialRangeValues.lat.start,
            );
            result.current.filterSetters.setLatEnd(
              mockInitialRangeValues.lat.end,
            );
            result.current.filterSetters.setLonStart(
              mockInitialRangeValues.lon.start,
            );
            result.current.filterSetters.setLonEnd(
              mockInitialRangeValues.lon.end,
            );
            result.current.filterSetters.setTimeStart(
              mockInitialRangeValues.time.start,
            );
            result.current.filterSetters.setTimeEnd(
              mockInitialRangeValues.time.end,
            );
            result.current.filterSetters.setDepthStart(
              mockInitialRangeValues.depth.start,
            );
            result.current.filterSetters.setDepthEnd(
              mockInitialRangeValues.depth.end,
            );
          });

          expect(result.current.isFiltered).toBe(false);
          expect(result.current.filterValues.isFiltered).toBe(false);
        });

        test('returns true when latitude start changes', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          act(() => {
            result.current.filterSetters.setLatStart(-30); // Different from initial -45.5
          });

          expect(result.current.isFiltered).toBe(true);
          expect(result.current.filterValues.isFiltered).toBe(true);
        });

        test('returns true when latitude end changes', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          act(() => {
            result.current.filterSetters.setLatEnd(50); // Different from initial 67.8
          });

          expect(result.current.isFiltered).toBe(true);
          expect(result.current.filterValues.isFiltered).toBe(true);
        });

        test('returns true when longitude start changes', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          act(() => {
            result.current.filterSetters.setLonStart(-90); // Different from initial -180
          });

          expect(result.current.isFiltered).toBe(true);
          expect(result.current.filterValues.isFiltered).toBe(true);
        });

        test('returns true when longitude end changes', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          act(() => {
            result.current.filterSetters.setLonEnd(90); // Different from initial 180
          });

          expect(result.current.isFiltered).toBe(true);
          expect(result.current.filterValues.isFiltered).toBe(true);
        });

        test('returns true when time start changes', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          act(() => {
            result.current.filterSetters.setTimeStart(100); // Different from initial 0
          });

          expect(result.current.isFiltered).toBe(true);
          expect(result.current.filterValues.isFiltered).toBe(true);
        });

        test('returns true when time end changes', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          act(() => {
            result.current.filterSetters.setTimeEnd(1000); // Different from initial 1461
          });

          expect(result.current.isFiltered).toBe(true);
          expect(result.current.filterValues.isFiltered).toBe(true);
        });

        test('returns true when depth start changes', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          act(() => {
            result.current.filterSetters.setDepthStart(10); // Different from initial 0
          });

          expect(result.current.isFiltered).toBe(true);
          expect(result.current.filterValues.isFiltered).toBe(true);
        });

        test('returns true when depth end changes', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          act(() => {
            result.current.filterSetters.setDepthEnd(1000); // Different from initial 5000
          });

          expect(result.current.isFiltered).toBe(true);
          expect(result.current.filterValues.isFiltered).toBe(true);
        });

        test('returns true when multiple filters are changed simultaneously', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          act(() => {
            result.current.filterSetters.setLatStart(-30);
            result.current.filterSetters.setLonEnd(90);
            result.current.filterSetters.setDepthStart(10);
            result.current.filterSetters.setTimeEnd(1000);
          });

          expect(result.current.isFiltered).toBe(true);
          expect(result.current.filterValues.isFiltered).toBe(true);
        });

        test('returns false when filters are changed then reset to original values', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          // First change some values
          act(() => {
            result.current.filterSetters.setLatStart(-30);
            result.current.filterSetters.setLonEnd(90);
            result.current.filterSetters.setDepthStart(10);
          });

          expect(result.current.isFiltered).toBe(true);

          // Then reset back to original values
          act(() => {
            result.current.filterSetters.setLatStart(
              mockInitialRangeValues.lat.start,
            );
            result.current.filterSetters.setLonEnd(
              mockInitialRangeValues.lon.end,
            );
            result.current.filterSetters.setDepthStart(
              mockInitialRangeValues.depth.start,
            );
          });

          expect(result.current.isFiltered).toBe(false);
          expect(result.current.filterValues.isFiltered).toBe(false);
        });

        test('correctly reflects state changes in filterValues object', () => {
          const { result } = renderHook(() => useHook(mockDatasets.normal));

          // Initially not filtered
          expect(result.current.filterValues.isFiltered).toBe(false);

          // Change a value
          act(() => {
            result.current.filterSetters.setLatStart(-30);
          });

          // Should now be filtered
          expect(result.current.filterValues.isFiltered).toBe(true);
          expect(result.current.filterValues.latStart).toBe(-30);
        });
      });
    });
  });
});
