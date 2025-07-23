import ExportFormatDecider from './ExportFormatDecider';
import OutputGeneratorFactory from './generators/OutputGeneratorFactory';
import ArrayBufferProcessor from './processors/ArrayBufferProcessor';

/**
 * Standardized error handling for export operations
 */
class ExportErrorHandler {
  /**
   * Handle export errors with appropriate fallback strategies
   * @param {Error} error - The error that occurred
   * @param {Object} processedData - Result from input processor
   * @param {Object} metadata - Dataset metadata
   * @param {string} datasetName - Name of the dataset
   * @param {string} baseFilename - Base filename
   * @returns {Promise<void>}
   */
  static async handleExportError(
    error,
    processedData,
    metadata,
    datasetName,
    baseFilename,
  ) {
    console.warn('Export failed, attempting fallback:', error.message);

    // Handle large buffer special case
    if (processedData.type === 'large_buffer') {
      return ArrayBufferProcessor.handleLargeBuffer(
        processedData.data,
        datasetName,
        metadata,
      );
    }

    // Try ZIP format as fallback if error suggests Excel issues
    if (ExportFormatDecider.shouldFallbackToZip(error)) {
      try {
        return await OutputGeneratorFactory.generate(
          'zip',
          processedData,
          metadata,
          datasetName,
          baseFilename,
        );
      } catch (fallbackError) {
        console.error('Fallback to ZIP also failed:', fallbackError.message);
        throw new Error(
          `Export failed: ${error.message}. Fallback also failed: ${fallbackError.message}`,
        );
      }
    }

    // Re-throw original error if no fallback strategy applies
    throw error;
  }

  /**
   * Create a descriptive error message for export failures
   * @param {string} operation - The operation that failed
   * @param {Error} error - The original error
   * @param {string} datasetName - Name of the dataset
   * @returns {string} Formatted error message
   */
  static createErrorMessage(operation, error, datasetName) {
    return `Failed to ${operation} dataset "${datasetName}": ${error.message}`;
  }

  /**
   * Log export operation details for debugging
   * @param {string} operation - The operation being performed
   * @param {Object} details - Operation details
   */
  static logOperation(operation, details) {
    console.info(`Export operation: ${operation}`, details);
  }
}

export default ExportErrorHandler;
