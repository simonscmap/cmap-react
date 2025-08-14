import DownloadService from './downloadService';
import apiService from '../../../api/api';
import datasetMetadataToDownloadFormat from './datasetMetadataToDownloadFormat';
import Papa from 'papaparse';
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
    if (data instanceof ArrayBuffer) {
      await DataExportService.createAndDownloadZip(
        data,
        metadata,
        datasetName,
        variableName,
      );
      return;
    }

    let csvData;

    if (typeof data === 'string') {
      csvData = data;
    } else if (Array.isArray(data)) {
      csvData = DataExportService.convertVisualizationDataToCSV(data);
    } else {
      throw new Error(
        'Data must be either a CSV string, JSON array, or ArrayBuffer',
      );
    }

    await DataExportService.createAndDownloadZip(
      csvData,
      metadata,
      datasetName,
      variableName,
    );
  }

  /**
   * Fetch dataset metadata from API
   * @param {string} datasetShortName - Short name of the dataset
   * @returns {Promise<Object>} Metadata object
   */
  static async fetchDatasetMetadata(datasetShortName) {
    try {
      const response =
        await apiService.catalog.datasetMetadata(datasetShortName);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('UNAUTHORIZED');
        } else {
          throw new Error('Failed to fetch metadata');
        }
      }

      const metadataJSON = await response.json();

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

  static convertVisualizationDataToCSV(data) {
    if (!data || data.length === 0) {
      return '';
    }

    const normalizedData = DataExportService.normalizeVisualizationData(data);

    const columns =
      DataExportService.determineVisualizationColumns(normalizedData);

    return DownloadService.jsonToCSV(normalizedData, columns);
  }

  static normalizeVisualizationData(data) {
    return data.map((row) => {
      const normalized = { ...row };

      if (row.time) {
        normalized.time = DataExportService.formatDate(row.time);
      }

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

  static determineVisualizationColumns(data) {
    if (!data || data.length === 0) {
      return [];
    }

    const firstRow = data[0];
    const columns = Object.keys(firstRow);

    const orderedColumns = [];
    const preferredOrder = ['time', 'lat', 'lon', 'depth'];

    preferredOrder.forEach((col) => {
      if (columns.includes(col)) {
        orderedColumns.push(col);
      }
    });

    columns.forEach((col) => {
      if (!orderedColumns.includes(col)) {
        orderedColumns.push(col);
      }
    });

    return orderedColumns;
  }

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

  static formatFloat(value, precision = 6) {
    return parseFloat(value.toFixed(precision));
  }

  static async createAndDownloadZip(
    csvData,
    metadata,
    datasetName,
    variableName = null,
  ) {
    const baseFilename = variableName
      ? `${datasetName}_${variableName}_${DownloadService.formatDateForFilename()}`
      : `${datasetName}_${DownloadService.formatDateForFilename()}`;

    const metadataWorkbook = DownloadService.createExcelWorkbook(
      DownloadService.createMetadataSheets(metadata),
    );
    const metadataBuffer = DownloadService.workbookToBuffer(metadataWorkbook);

    const files = [
      { filename: `${datasetName}_data.csv`, content: csvData },
      { filename: `${datasetName}_metadata.xlsx`, content: metadataBuffer },
    ];

    await DownloadService.downloadZip(files, baseFilename);
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
    const filteredVariables = metadata.variables.filter(
      (v) => v.var_short_name === variableShortName,
    );

    if (!filteredVariables || filteredVariables.length === 0) {
      throw new Error('No metadata found for variable');
    }

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

  static parseCSVToJSON(csvData) {
    if (!csvData || typeof csvData !== 'string') {
      throw new Error('Invalid CSV data: must be a non-empty string');
    }

    const trimmedData = csvData.trim();
    if (!trimmedData) {
      throw new Error('CSV data is empty');
    }

    try {
      const parseResult = Papa.parse(trimmedData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => value.trim(),
      });

      if (parseResult.errors && parseResult.errors.length > 0) {
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
      if (
        error.message.includes('CSV parsing error') ||
        error.message.includes('CSV data must have')
      ) {
        throw error;
      }

      throw new Error(`Failed to parse CSV data: ${error.message}`);
    }
  }
}

export default DataExportService;
