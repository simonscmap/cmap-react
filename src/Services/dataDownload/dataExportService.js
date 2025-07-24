import DownloadService from './downloadService';
import apiService from '../../api/api';
import datasetMetadataToDownloadFormat from './datasetMetadataToDownloadFormat';
import InputProcessorFactory from './processors/InputProcessorFactory';
import ExportFormatDecider from './ExportFormatDecider';
import OutputGeneratorFactory from './generators/OutputGeneratorFactory';
import ExportErrorHandler from './ExportErrorHandler';
import ArrayBufferProcessor from './processors/ArrayBufferProcessor';
/**
 * Unified data export service for handling all export operations
 */
class DataExportService {
  /**
   * UNIFIED EXPORT METHOD
   * Exports data with metadata, automatically choosing format based on data size
   * @param {Object} params - Export parameters
   * @param {Array|string|ArrayBuffer} params.data - Data as JSON array, CSV string, or ArrayBuffer
   * @param {Object} params.metadata - Dataset and variable metadata
   * @param {string} params.datasetName - Name of the dataset
   * @param {string} params.variableName - Name of the variable (optional)
   * @param {boolean} params.forceZip - Force ZIP format regardless of size
   * @returns {Promise<void>}
   */
  static async exportDataWithMetadata({
    data,
    metadata,
    datasetName,
    variableName = null,
    forceZip = false,
  }) {
    try {
      // Process input data using appropriate processor
      const processedData = InputProcessorFactory.process(data);

      // Handle large buffers that require special processing
      if (
        processedData.requiresSpecialHandling &&
        processedData.type === 'large_buffer'
      ) {
        return ArrayBufferProcessor.handleLargeBuffer(
          processedData.data,
          datasetName,
          metadata,
        );
      }

      // Determine export format based on data characteristics
      const format = ExportFormatDecider.determineFormat(processedData, {
        forceZip,
      });

      // Generate filename
      const baseFilename = variableName
        ? `${datasetName}_${variableName}_${DownloadService.formatDateForFilename()}`
        : `${datasetName}_${DownloadService.formatDateForFilename()}`;

      // Generate and download using appropriate generator
      await OutputGeneratorFactory.generate(
        format,
        processedData,
        metadata,
        datasetName,
        baseFilename,
      );

      ExportErrorHandler.logOperation('export', {
        datasetName,
        variableName,
        format,
        dataType: processedData.type,
      });
    } catch (error) {
      // Use standardized error handling with fallback strategies
      const processedData = InputProcessorFactory.process(data);
      const baseFilename = variableName
        ? `${datasetName}_${variableName}_${DownloadService.formatDateForFilename()}`
        : `${datasetName}_${DownloadService.formatDateForFilename()}`;

      await ExportErrorHandler.handleExportError(
        error,
        processedData,
        metadata,
        datasetName,
        baseFilename,
      );
    }
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
}

export default DataExportService;
