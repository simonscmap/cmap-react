import DownloadService from './downloadService';
import apiService from '../../api/api';
import datasetMetadataToDownloadFormat from './datasetMetadataToDownloadFormat';
/**
 * Unified data export service for handling all export operations
 */
class DataExportService {
  /**
   * Export visualization data with metadata
   * @param {Object} params - Export parameters
   * @param {Array} params.data - The visualization data
   * @param {Object} params.metadata - Dataset and variable metadata
   * @param {string} params.datasetName - Name of the dataset
   * @param {string} params.variableName - Name of the variable
   * @param {string} params.format - Export format ('csv' | 'excel')
   * @returns {Promise<void>}
   */
  static async exportVisualizationData({
    data,
    metadata,
    datasetName,
    variableName,
    format = 'excel',
  }) {
    const filename = `${datasetName}_${variableName}_${DownloadService.formatDateForFilename()}`;

    if (format === 'csv') {
      // For CSV, just export the data
      const csvContent = this.convertVisualizationDataToCSV(data);
      DownloadService.downloadCSV(csvContent, filename);
    } else {
      // For Excel, include data and metadata sheets
      const sheets = [
        {
          name: 'Data',
          data: DataExportService.normalizeVisualizationData(data),
        },
        ...DownloadService.createMetadataSheets(metadata),
      ];
      DownloadService.downloadExcel(sheets, filename);
    }
  }

  /**
   * Export dataset with metadata as ZIP
   * @param {Object} params - Export parameters
   * @param {Object} params.query - API query parameters
   * @param {Object} params.metadata - Pre-fetched metadata (optional)
   * @returns {Promise<void>}
   */
  static async exportDataset({ query, metadata = null }) {
    try {
      // Build the query string for the API
      const queryString =
        typeof query === 'string' ? query : query.query || query;

      // Fetch data and metadata in parallel if metadata not provided
      const promises = [apiService.data.customQuery(queryString)];

      if (!metadata) {
        promises.push(
          DataExportService.fetchDatasetMetadata(query.datasetShortName),
        );
      }

      const [dataResponse, fetchedMetadata] = await Promise.all(promises);

      if (!dataResponse.ok) {
        if (dataResponse.status === 401) {
          throw new Error('UNAUTHORIZED');
        } else if (dataResponse.status === 400) {
          const responseText = await dataResponse.text();
          const errorMessage =
            responseText === 'query exceeds maximum size allowed'
              ? '400 TOO LARGE'
              : 'BAD REQUEST';
          throw new Error(errorMessage);
        } else {
          throw new Error('Failed to fetch data');
        }
      }

      const finalMetadata = metadata || fetchedMetadata;

      // Get data as array buffer
      const dataArrayBuffer = await dataResponse.arrayBuffer();
      const dataText = new TextDecoder().decode(dataArrayBuffer);

      // Create metadata workbook
      const metadataWorkbook = DownloadService.createExcelWorkbook(
        DownloadService.createMetadataSheets(finalMetadata),
      );
      const metadataBuffer = DownloadService.workbookToBuffer(metadataWorkbook);

      // Create ZIP with data and metadata
      const files = [
        {
          filename: 'data.csv',
          content: dataText,
        },
        {
          filename: 'metadata.xlsx',
          content: metadataBuffer,
        },
      ];

      const zipFilename = `${
        query.tableName
      }_${DownloadService.formatDateForFilename()}`;
      await DownloadService.downloadZip(files, zipFilename);
    } catch (error) {
      console.error('Error exporting dataset:', error);
      throw error;
    }
  }

  /**
   * Export metadata only as Excel
   * @param {Object} params - Export parameters
   * @param {string} params.datasetName - Name of the dataset
   * @param {Object} params.metadata - Metadata object
   * @returns {void}
   */
  static exportMetadataOnly({ datasetName, metadata }) {
    const sheets = DownloadService.createMetadataSheets(metadata);
    const filename = `${datasetName}_metadata_${DownloadService.formatDateForFilename()}`;
    DownloadService.downloadExcel(sheets, filename);
  }

  /**
   * Fetch dataset metadata from API
   * @param {string} datasetShortName - Short name of the dataset
   * @returns {Promise<Object>} Metadata object
   */
  static async fetchDatasetMetadata(datasetShortName) {
    try {
      const response = await apiService.catalog.datasetMetadata(
        datasetShortName,
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('UNAUTHORIZED');
        } else {
          throw new Error('Failed to fetch metadata');
        }
      }

      const metadataJSON = await response.json();

      // The API returns metadata in a specific format that needs to be transformed
      const formattedData = datasetMetadataToDownloadFormat(metadataJSON);

      return {
        dataset: formattedData.datasetRows,
        variables: formattedData.variableRows,
        variableStats: formattedData.summaryStatisticsRows,
      };
    } catch (error) {
      console.error('Error fetching metadata:', error);
      throw error;
    }
  }

  /**
   * Convert visualization data to CSV format
   * @param {Array} data - Visualization data array
   * @returns {string} CSV formatted string
   */
  static convertVisualizationDataToCSV(data) {
    if (!data || data.length === 0) {
      return '';
    }

    // Normalize data first to ensure consistent structure
    const normalizedData = DataExportService.normalizeVisualizationData(data);

    // Determine column order based on data type
    const columns =
      DataExportService.determineVisualizationColumns(normalizedData);

    return DownloadService.jsonToCSV(normalizedData, columns);
  }

  /**
   * Convert dataset API response to CSV format
   * @param {Array} data - Dataset data from API
   * @returns {string} CSV formatted string
   */
  static convertDatasetToCSV(data) {
    if (!data || data.length === 0) {
      return '';
    }

    // Dataset data is typically already in the correct format
    return DownloadService.jsonToCSV(data);
  }

  /**
   * Normalize visualization data to consistent format
   * @param {Array} data - Raw visualization data
   * @returns {Array} Normalized data array
   */
  static normalizeVisualizationData(data) {
    // Handle different visualization data formats
    return data.map((row) => {
      const normalized = { ...row };

      // Ensure consistent date formatting
      if (row.time) {
        normalized.time = DataExportService.formatDate(row.time);
      }

      // Ensure numeric values are properly formatted
      Object.keys(normalized).forEach((key) => {
        if (
          typeof normalized[key] === 'number' &&
          !Number.isInteger(normalized[key])
        ) {
          normalized[key] = DataExportService.formatFloat(normalized[key]);
        }
      });

      return normalized;
    });
  }

  /**
   * Determine column order for visualization data
   * @param {Array} data - Normalized data array
   * @returns {Array<string>} Ordered column names
   */
  static determineVisualizationColumns(data) {
    if (!data || data.length === 0) {
      return [];
    }

    const firstRow = data[0];
    const columns = Object.keys(firstRow);

    // Define preferred column order
    const orderedColumns = [];
    const preferredOrder = ['time', 'lat', 'lon', 'depth'];

    // Add preferred columns in order if they exist
    preferredOrder.forEach((col) => {
      if (columns.includes(col)) {
        orderedColumns.push(col);
      }
    });

    // Add remaining columns
    columns.forEach((col) => {
      if (!orderedColumns.includes(col)) {
        orderedColumns.push(col);
      }
    });

    return orderedColumns;
  }

  /**
   * Format date for export
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date string
   */
  static formatDate(date) {
    if (!date) {
      return '';
    }

    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return String(date);
    }

    return dateObj.toISOString();
  }

  /**
   * Format float values with appropriate precision
   * @param {number} value - Float value to format
   * @param {number} precision - Number of decimal places (default: 6)
   * @returns {number} Formatted float
   */
  static formatFloat(value, precision = 6) {
    return parseFloat(value.toFixed(precision));
  }

  /**
   * Validate export parameters
   * @param {Object} params - Parameters to validate
   * @param {Array<string>} required - Required parameter names
   * @throws {Error} If validation fails
   */
  static validateExportParams(params, required) {
    required.forEach((param) => {
      if (!params[param]) {
        throw new Error(`Missing required parameter: ${param}`);
      }
    });
  }

  /**
   * Filter metadata for a specific variable
   * @param {Object} metadata - Complete metadata object
   * @param {string} variableShortName - Short name of the variable to filter for
   * @param {string} variableLongName - Long name of the variable to filter for (optional)
   * @returns {Object} Filtered metadata object
   * @throws {Error} If no metadata is found for the variable
   */
  static filterMetadataForVariable(
    metadata,
    variableShortName,
    variableLongName,
  ) {
    // Filter variables by short name
    const filteredVariables = metadata.variables.filter(
      (v) => v.var_short_name === variableShortName,
    );

    if (!filteredVariables || filteredVariables.length === 0) {
      throw new Error('No metadata found for variable');
    }

    // If variableLongName is not provided, get it from the filtered variables
    let resolvedVariableLongName = variableLongName;
    if (!resolvedVariableLongName) {
      resolvedVariableLongName = filteredVariables[0].var_long_name;
    }

    const filteredMetadata = {
      dataset: metadata.dataset,
      variables: filteredVariables,
      variableStats: metadata.variableStats.filter(
        (v) => v.Variable === resolvedVariableLongName,
      ),
    };

    return filteredMetadata;
  }

  /**
   * Parse CSV string data to JSON array
   * @param {string} csvData - CSV formatted string data
   * @returns {Array<Object>} Array of objects with headers as keys
   * @throws {Error} If CSV data is invalid or empty
   */
  static parseCSVToJSON(csvData) {
    if (!csvData || typeof csvData !== 'string') {
      throw new Error('Invalid CSV data: must be a non-empty string');
    }

    const trimmedData = csvData.trim();
    if (!trimmedData) {
      throw new Error('CSV data is empty');
    }

    const lines = trimmedData.split('\n');
    if (lines.length < 2) {
      throw new Error(
        'CSV data must have at least a header row and one data row',
      );
    }

    const headers = lines[0].split(',').map((header) => header.trim());
    const data = lines.slice(1).map((line, lineIndex) => {
      const values = line.split(',');

      // Ensure we have the same number of values as headers
      if (values.length !== headers.length) {
        throw new Error(
          `CSV row ${lineIndex + 2} has ${values.length} values but expected ${
            headers.length
          } (matching headers)`,
        );
      }

      return headers.reduce((obj, header, index) => {
        obj[header] = values[index]?.trim() || '';
        return obj;
      }, {});
    });

    return data;
  }
}

export default DataExportService;
