import DownloadService from './downloadService';
import apiService from '../../api/api';
import datasetMetadataToDownloadFormat from './datasetMetadataToDownloadFormat';
import Papa from 'papaparse';
/**
 * Unified data export service for handling all export operations
 */
class DataExportService {
  /**
   * UNIFIED EXPORT METHOD
   * Exports data with metadata as ZIP containing CSV data and Excel metadata
   * @param {Object} params - Export parameters
   * @param {Array|string|ArrayBuffer} params.data - Data as JSON array, CSV string, or ArrayBuffer
   * @param {Object} params.metadata - Dataset and variable metadata
   * @param {string} params.datasetName - Name of the dataset
   * @param {string} params.variableName - Name of the variable (optional)
   * @returns {Promise<void>}
   */
  static async exportDataWithMetadata({
    data,
    metadata,
    datasetName,
    variableName = null,
  }) {
    // Handle ArrayBuffer input - always use ZIP path
    if (data instanceof ArrayBuffer) {
      const baseFilename = variableName
        ? `${datasetName}_${variableName}_${DownloadService.formatDateForFilename()}`
        : `${datasetName}_${DownloadService.formatDateForFilename()}`;

      const metadataWorkbook = DownloadService.createExcelWorkbook(
        DownloadService.createMetadataSheets(metadata),
      );
      const metadataBuffer = DownloadService.workbookToBuffer(metadataWorkbook);

      const files = [
        { filename: `${datasetName}_data.csv`, content: data },
        { filename: `${datasetName}_metadata.xlsx`, content: metadataBuffer }
      ];

      await DownloadService.downloadZip(files, baseFilename);
      return;
    }

    // Convert data to CSV format
    let csvData;

    if (typeof data === 'string') {
      // Data is already CSV string
      csvData = data;
    } else if (Array.isArray(data)) {
      // Data is JSON array - convert to CSV
      csvData = DataExportService.convertVisualizationDataToCSV(data);
    } else {
      throw new Error(
        'Data must be either a CSV string, JSON array, or ArrayBuffer',
      );
    }

    // Always use ZIP format with CSV data and Excel metadata
    const baseFilename = variableName
      ? `${datasetName}_${variableName}_${DownloadService.formatDateForFilename()}`
      : `${datasetName}_${DownloadService.formatDateForFilename()}`;

    const metadataWorkbook = DownloadService.createExcelWorkbook(
      DownloadService.createMetadataSheets(metadata),
    );
    const metadataBuffer = DownloadService.workbookToBuffer(metadataWorkbook);

    const files = [
      {
        filename: `${datasetName}_data.csv`,
        content: csvData,
      },
      {
        filename: `${datasetName}_metadata.xlsx`,
        content: metadataBuffer,
      },
    ];

    await DownloadService.downloadZip(files, baseFilename);
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

    try {
      // Use Papa Parse for robust CSV parsing that handles escaping properly
      const parseResult = Papa.parse(trimmedData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => value.trim(),
      });

      if (parseResult.errors && parseResult.errors.length > 0) {
        // Log the first parsing error for debugging
        const firstError = parseResult.errors[0];
        throw new Error(
          `CSV parsing error at row ${firstError.row}: ${firstError.message}`,
        );
      }

      if (!parseResult.data || parseResult.data.length === 0) {
        throw new Error(
          'CSV data must have at least a header row and one data row',
        );
      }

      return parseResult.data;
    } catch (error) {
      // If it's already our custom error, re-throw it
      if (
        error.message.includes('CSV parsing error') ||
        error.message.includes('CSV data must have')
      ) {
        throw error;
      }

      // Otherwise, wrap the Papa Parse error with more context
      throw new Error(`Failed to parse CSV data: ${error.message}`);
    }
  }
}

export default DataExportService;
