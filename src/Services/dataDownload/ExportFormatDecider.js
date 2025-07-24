/**
 * Determines the appropriate export format (Excel vs ZIP) based on data characteristics
 */
class ExportFormatDecider {
  /**
   * Determine if ZIP format should be used based on data size and options
   * @param {Object} processedData - Result from input processor
   * @param {Object} options - Export options
   * @param {boolean} options.forceZip - Force ZIP format regardless of size
   * @returns {string} 'excel' or 'zip'
   */
  static determineFormat(processedData, options = {}) {
    // Handle special cases first
    if (options.forceZip || processedData.requiresSpecialHandling) {
      return 'zip';
    }

    // Check data size constraints
    if (
      this.shouldUseZipFormat(
        processedData.normalizedData,
        processedData.csvData,
      )
    ) {
      return 'zip';
    }

    return 'excel';
  }

  /**
   * Determines if ZIP format should be used based on data size
   * @param {Array} normalizedData - Data as JSON array
   * @param {string} csvData - Data as CSV string
   * @returns {boolean} True if ZIP format should be used
   */
  static shouldUseZipFormat(normalizedData, csvData) {
    const MAX_EXCEL_ROWS = 500000; // Conservative limit for performance
    const MAX_CSV_SIZE_MB = 25; // CSV size limit for Excel export

    // Check row count
    if (normalizedData && normalizedData.length > MAX_EXCEL_ROWS) {
      return true;
    }

    // Check approximate file size (CSV string length as rough estimate)
    if (csvData) {
      const csvSizeMB = new Blob([csvData]).size / (1024 * 1024);
      if (csvSizeMB > MAX_CSV_SIZE_MB) {
        return true;
      }
    }

    return false;
  }

  /**
   * Determine if error should trigger fallback to ZIP format
   * @param {Error} error - The error that occurred
   * @returns {boolean} True if should fallback to ZIP
   */
  static shouldFallbackToZip(error) {
    // Common Excel-related errors that indicate we should use ZIP instead
    const excelErrorIndicators = [
      'excel',
      'workbook',
      'memory',
      'size',
      'rows',
      'columns',
    ];

    const errorMessage = error.message.toLowerCase();
    return excelErrorIndicators.some((indicator) =>
      errorMessage.includes(indicator),
    );
  }
}

export default ExportFormatDecider;
