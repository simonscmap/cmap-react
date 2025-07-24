import ExcelGenerator from './ExcelGenerator';
import ZipGenerator from './ZipGenerator';

/**
 * Factory for creating appropriate output generators based on format
 */
class OutputGeneratorFactory {
  /**
   * Generate output using the appropriate generator
   * @param {string} format - 'excel' or 'zip'
   * @param {Object} processedData - Result from input processor
   * @param {Object} metadata - Dataset metadata
   * @param {string} datasetName - Name of the dataset
   * @param {string} baseFilename - Base filename
   * @returns {Promise<void>}
   */
  static async generate(
    format,
    processedData,
    metadata,
    datasetName,
    baseFilename,
  ) {
    if (format === 'excel') {
      return ExcelGenerator.generate(
        processedData.normalizedData,
        metadata,
        baseFilename,
      );
    }

    if (format === 'zip') {
      return ZipGenerator.generate(
        processedData.csvData || processedData.data,
        metadata,
        datasetName,
        baseFilename,
      );
    }

    throw new Error(`Unsupported export format: ${format}`);
  }

  /**
   * Get generator for specific format
   * @param {string} format - 'excel' or 'zip'
   * @returns {Class} Appropriate generator class
   */
  static getGenerator(format) {
    if (format === 'excel') {
      return ExcelGenerator;
    }

    if (format === 'zip') {
      return ZipGenerator;
    }

    throw new Error(`Unsupported export format: ${format}`);
  }
}

export default OutputGeneratorFactory;
