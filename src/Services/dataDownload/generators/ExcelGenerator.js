import DownloadService from '../downloadService';

/**
 * Generates Excel files with data and metadata sheets
 */
class ExcelGenerator {
  /**
   * Generate and download Excel file with data and metadata sheets
   * @param {Array} normalizedData - Normalized data array
   * @param {Object} metadata - Dataset metadata
   * @param {string} baseFilename - Base filename for the Excel file
   * @throws {Error} If Excel generation fails
   */
  static generate(normalizedData, metadata, baseFilename) {
    const sheets = this.createExcelSheets(normalizedData, metadata);
    DownloadService.downloadExcel(sheets, baseFilename);
  }

  /**
   * Create sheets array for Excel generation
   * @param {Array} normalizedData - Normalized data array
   * @param {Object} metadata - Dataset metadata
   * @returns {Array} Sheets array for Excel creation
   */
  static createExcelSheets(normalizedData, metadata) {
    return [
      {
        name: 'Data',
        data: normalizedData,
      },
      ...DownloadService.createMetadataSheets(metadata),
    ];
  }
}

export default ExcelGenerator;
