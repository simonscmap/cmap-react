import DownloadService from '../downloadService';

/**
 * Handles processing of JSON array data inputs (visualization data)
 */
class JSONArrayProcessor {
  /**
   * Process JSON array data
   * @param {Array} data - JSON array data
   * @returns {Object} Processing result with normalized data and CSV conversion
   */
  static process(data) {
    const normalizedData = this.normalizeVisualizationData(data);
    const csvData = this.convertVisualizationDataToCSV(data);

    return {
      type: 'json_array',
      normalizedData,
      csvData,
      requiresSpecialHandling: false,
    };
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

    const normalizedData = this.normalizeVisualizationData(data);
    const columns = this.determineVisualizationColumns(normalizedData);

    return DownloadService.jsonToCSV(normalizedData, columns);
  }

  /**
   * Normalize visualization data to consistent format
   * @param {Array} data - Raw visualization data
   * @returns {Array} Normalized data array
   */
  static normalizeVisualizationData(data) {
    return data.map((row) => {
      const normalized = { ...row };

      // Ensure consistent date formatting
      if (row.time) {
        normalized.time = this.formatDate(row.time);
      }

      // Ensure numeric values are properly formatted
      Object.keys(normalized).forEach((key) => {
        if (
          typeof normalized[key] === 'number' &&
          !Number.isInteger(normalized[key])
        ) {
          normalized[key] = this.formatFloat(normalized[key]);
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
}

export default JSONArrayProcessor;