import Papa from 'papaparse';

/**
 * Handles processing of CSV string data inputs
 */
class CSVStringProcessor {
  /**
   * Process CSV string data
   * @param {string} csvData - CSV formatted string
   * @returns {Object} Processing result with normalized data and original CSV
   */
  static process(csvData) {
    const normalizedData = this.parseCSVToJSON(csvData);

    return {
      type: 'csv_string',
      normalizedData,
      csvData,
      requiresSpecialHandling: false,
    };
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

export default CSVStringProcessor;