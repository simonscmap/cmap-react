import DownloadService from '../downloadService';

/**
 * Generates ZIP files containing CSV data and Excel metadata
 */
class ZipGenerator {
  /**
   * Generate and download ZIP file with CSV data and Excel metadata
   * @param {string} csvData - CSV formatted data
   * @param {Object} metadata - Dataset metadata
   * @param {string} datasetName - Name of the dataset
   * @param {string} baseFilename - Base filename for the ZIP
   * @returns {Promise<void>}
   */
  static async generate(csvData, metadata, datasetName, baseFilename) {
    const files = this.createZipFiles(csvData, metadata, datasetName);
    await DownloadService.downloadZip(files, baseFilename);
  }

  /**
   * Create files array for ZIP generation
   * @param {string|ArrayBuffer} csvData - CSV data (string or buffer)
   * @param {Object} metadata - Dataset metadata
   * @param {string} datasetName - Name of the dataset
   * @returns {Array} Files array for ZIP creation
   */
  static createZipFiles(csvData, metadata, datasetName) {
    // Create Excel metadata file
    const metadataWorkbook = DownloadService.createExcelWorkbook(
      DownloadService.createMetadataSheets(metadata),
    );
    const metadataBuffer = DownloadService.workbookToBuffer(metadataWorkbook);

    return [
      {
        filename: `${datasetName}_data.csv`,
        content: csvData,
      },
      {
        filename: `${datasetName}_metadata.xlsx`,
        content: metadataBuffer,
      },
    ];
  }
}

export default ZipGenerator;
