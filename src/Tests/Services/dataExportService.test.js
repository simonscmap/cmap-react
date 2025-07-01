import DataExportService from '../../Services/dataDownload/dataExportService';
import DownloadService from '../../Services/dataDownload/downloadService';
import apiService from '../../api/api';

// Mock dependencies
jest.mock('../../services/downloadService');
jest.mock('../../api/api');

describe('DataExportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock static methods
    DownloadService.formatDateForFilename = jest.fn().mockReturnValue('2023-12-25');
    DownloadService.jsonToCSV = jest.fn().mockReturnValue('csv,content');
    DownloadService.createMetadataSheets = jest.fn().mockReturnValue([
      { name: 'Metadata', data: [] }
    ]);
    DownloadService.createExcelWorkbook = jest.fn().mockReturnValue({});
    DownloadService.workbookToBuffer = jest.fn().mockReturnValue(new ArrayBuffer(8));
  });

  describe('exportVisualizationData', () => {
    const mockData = [
      { time: '2023-01-01', lat: 10, lon: 20, value: 100 }
    ];
    const mockMetadata = {
      dataset: { name: 'Test Dataset' },
      variables: [{ name: 'value' }]
    };

    it('should export visualization data as CSV when format is csv', async () => {
      const params = {
        data: mockData,
        metadata: mockMetadata,
        datasetName: 'TestDataset',
        variableName: 'TestVar',
        format: 'csv'
      };

      await DataExportService.exportVisualizationData(params);

      expect(DownloadService.downloadCSV).toHaveBeenCalledWith(
        'csv,content',
        'TestDataset_TestVar_2023-12-25'
      );
    });

    it('should export visualization data as Excel by default', async () => {
      const params = {
        data: mockData,
        metadata: mockMetadata,
        datasetName: 'TestDataset',
        variableName: 'TestVar'
      };

      await DataExportService.exportVisualizationData(params);

      expect(DownloadService.downloadExcel).toHaveBeenCalled();
      const [sheets, filename] = DownloadService.downloadExcel.mock.calls[0];
      expect(sheets).toHaveLength(2); // Data sheet + metadata sheets
      expect(sheets[0].name).toBe('Data');
      expect(filename).toBe('TestDataset_TestVar_2023-12-25');
    });
  });

  describe('exportDataset', () => {
    const mockQuery = {
      tableName: 'test_table',
      fields: 'field1,field2'
    };
    const mockDataResponse = {
      data: [{ field1: 'value1', field2: 'value2' }]
    };
    const mockMetadata = {
      dataset: { name: 'Test Dataset' },
      variables: [],
      variableStats: []
    };

    beforeEach(() => {
      const mockResponse = {
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8))
      };
      const mockMetadataResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          dataset: mockMetadata.dataset,
          variables: mockMetadata.variables
        })
      };
      
      apiService.data = {
        customQuery: jest.fn().mockResolvedValue(mockResponse)
      };
      apiService.catalog = {
        datasetMetadata: jest.fn().mockResolvedValue(mockMetadataResponse)
      };
      
      // Mock the import for datasetMetadataToDownloadFormat
      jest.mock('../../Utility/Catalog/datasetMetadataToDownloadFormat', () => ({
        default: jest.fn().mockReturnValue({
          datasetRows: mockMetadata.dataset,
          variableRows: mockMetadata.variables,
          summaryStatisticsRows: mockMetadata.variableStats
        })
      }));
    });

    it('should fetch data and metadata then create ZIP', async () => {
      await DataExportService.exportDataset({ query: mockQuery });

      expect(apiService.data.customQuery).toHaveBeenCalled();
      expect(apiService.catalog.datasetMetadata).toHaveBeenCalledWith('test_table');
      
      expect(DownloadService.downloadZip).toHaveBeenCalled();
      const [files, filename] = DownloadService.downloadZip.mock.calls[0];
      expect(files).toHaveLength(2);
      expect(files[0].filename).toBe('data.csv');
      expect(files[1].filename).toBe('metadata.xlsx');
      expect(filename).toBe('test_table_2023-12-25');
    });

    it('should use provided metadata if available', async () => {
      const providedMetadata = {
        dataset: { name: 'Provided Dataset' },
        variables: [{ name: 'var1' }]
      };

      await DataExportService.exportDataset({ 
        query: mockQuery, 
        metadata: providedMetadata 
      });

      // Should not fetch metadata
      expect(apiService.catalog.datasetMetadata).not.toHaveBeenCalled();
      
      // Should still fetch data
      expect(apiService.data.customQuery).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      apiService.data.customQuery.mockRejectedValue(new Error('API Error'));

      await expect(DataExportService.exportDataset({ query: mockQuery }))
        .rejects.toThrow('API Error');
    });
  });

  describe('exportMetadataOnly', () => {
    it('should export metadata as Excel file', () => {
      const params = {
        datasetName: 'TestDataset',
        metadata: {
          dataset: { name: 'Test' },
          variables: []
        }
      };

      DataExportService.exportMetadataOnly(params);

      expect(DownloadService.createMetadataSheets).toHaveBeenCalledWith(params.metadata);
      expect(DownloadService.downloadExcel).toHaveBeenCalledWith(
        [{ name: 'Metadata', data: [] }],
        'TestDataset_metadata_2023-12-25'
      );
    });
  });

  describe('fetchDatasetMetadata', () => {
    it('should fetch metadata and transform it', async () => {
      const mockMetadataJSON = {
        dataset: { name: 'Test' },
        variables: [{ name: 'var1' }]
      };
      const mockFormattedData = {
        datasetRows: [{ name: 'Test' }],
        variableRows: [{ name: 'var1' }],
        summaryStatisticsRows: [{ min: 0, max: 100 }]
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockMetadataJSON)
      };
      
      apiService.catalog = {
        datasetMetadata: jest.fn().mockResolvedValue(mockResponse)
      };

      // Mock the dynamic import
      jest.doMock('../../Utility/Catalog/datasetMetadataToDownloadFormat', () => ({
        default: jest.fn().mockReturnValue(mockFormattedData)
      }));

      const query = { tableName: 'test', fields: 'field1' };
      const result = await DataExportService.fetchDatasetMetadata(query);

      expect(result).toEqual({
        dataset: mockFormattedData.datasetRows,
        variables: mockFormattedData.variableRows,
        variableStats: mockFormattedData.summaryStatisticsRows
      });
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500
      };
      
      apiService.catalog = {
        datasetMetadata: jest.fn().mockResolvedValue(mockResponse)
      };

      await expect(DataExportService.fetchDatasetMetadata({ tableName: 'test' }))
        .rejects.toThrow('Failed to fetch metadata');
    });
  });

  describe('convertVisualizationDataToCSV', () => {
    it('should convert visualization data to CSV', () => {
      const data = [
        { time: '2023-01-01', value: 100 }
      ];
      
      jest.spyOn(DataExportService, 'normalizeVisualizationData').mockReturnValue(data);
      jest.spyOn(DataExportService, 'determineVisualizationColumns').mockReturnValue(['time', 'value']);
      
      DataExportService.convertVisualizationDataToCSV(data);
      
      expect(DownloadService.jsonToCSV).toHaveBeenCalledWith(data, ['time', 'value']);
    });

    it('should handle empty data', () => {
      expect(DataExportService.convertVisualizationDataToCSV([])).toBe('');
      expect(DataExportService.convertVisualizationDataToCSV(null)).toBe('');
    });
  });

  describe('convertDatasetToCSV', () => {
    it('should convert dataset data to CSV', () => {
      const data = [{ col1: 'val1', col2: 'val2' }];
      
      DataExportService.convertDatasetToCSV(data);
      
      expect(DownloadService.jsonToCSV).toHaveBeenCalledWith(data);
    });

    it('should handle empty data', () => {
      expect(DataExportService.convertDatasetToCSV([])).toBe('');
      expect(DataExportService.convertDatasetToCSV(null)).toBe('');
    });
  });

  describe('normalizeVisualizationData', () => {
    it('should normalize data with proper formatting', () => {
      const data = [
        { 
          time: '2023-01-01T00:00:00Z', 
          value: 123.456789,
          count: 10
        }
      ];
      
      const normalized = DataExportService.normalizeVisualizationData(data);
      
      expect(normalized[0].time).toBe('2023-01-01T00:00:00.000Z');
      expect(normalized[0].value).toBe(123.456789);
      expect(normalized[0].count).toBe(10);
    });

    it('should format float values', () => {
      const data = [{ value: 123.123456789 }];
      
      const normalized = DataExportService.normalizeVisualizationData(data);
      
      expect(normalized[0].value).toBe(123.123457);
    });
  });

  describe('determineVisualizationColumns', () => {
    it('should order columns with preferred columns first', () => {
      const data = [
        { value: 100, depth: 10, lat: 20, time: '2023-01-01', lon: 30 }
      ];
      
      const columns = DataExportService.determineVisualizationColumns(data);
      
      expect(columns).toEqual(['time', 'lat', 'lon', 'depth', 'value']);
    });

    it('should handle missing preferred columns', () => {
      const data = [{ value: 100, customField: 'test' }];
      
      const columns = DataExportService.determineVisualizationColumns(data);
      
      expect(columns).toEqual(['value', 'customField']);
    });

    it('should handle empty data', () => {
      expect(DataExportService.determineVisualizationColumns([])).toEqual([]);
      expect(DataExportService.determineVisualizationColumns(null)).toEqual([]);
    });
  });

  describe('formatDate', () => {
    it('should format valid dates to ISO string', () => {
      expect(DataExportService.formatDate('2023-01-01')).toBe('2023-01-01T00:00:00.000Z');
      expect(DataExportService.formatDate(new Date('2023-01-01'))).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should handle invalid dates', () => {
      expect(DataExportService.formatDate('invalid')).toBe('invalid');
      expect(DataExportService.formatDate(null)).toBe('');
      expect(DataExportService.formatDate(undefined)).toBe('');
    });
  });

  describe('formatFloat', () => {
    it('should format float with default precision', () => {
      expect(DataExportService.formatFloat(123.123456789)).toBe(123.123457);
    });

    it('should format float with custom precision', () => {
      expect(DataExportService.formatFloat(123.123456789, 2)).toBe(123.12);
      expect(DataExportService.formatFloat(123.123456789, 8)).toBe(123.12345679);
    });
  });

  describe('validateExportParams', () => {
    it('should not throw for valid params', () => {
      const params = { field1: 'value1', field2: 'value2' };
      const required = ['field1', 'field2'];
      
      expect(() => DataExportService.validateExportParams(params, required)).not.toThrow();
    });

    it('should throw for missing required params', () => {
      const params = { field1: 'value1' };
      const required = ['field1', 'field2'];
      
      expect(() => DataExportService.validateExportParams(params, required))
        .toThrow('Missing required parameter: field2');
    });

    it('should throw for null/undefined required params', () => {
      const params = { field1: null, field2: undefined };
      const required = ['field1', 'field2'];
      
      expect(() => DataExportService.validateExportParams(params, required))
        .toThrow('Missing required parameter: field1');
    });
  });
});