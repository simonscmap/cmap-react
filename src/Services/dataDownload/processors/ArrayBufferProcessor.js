import DownloadService from '../downloadService';

/**
 * Handles processing of ArrayBuffer data inputs
 */
class ArrayBufferProcessor {

  /**
   * Process ArrayBuffer data
   * @param {ArrayBuffer} buffer - Raw data buffer
   * @returns {Object} Processing result
   */
  static process(buffer) {
    const bufferSize = buffer.byteLength;

    if (!this.canSafelyDecodeBuffer(bufferSize)) {
      return {
        type: 'large_buffer',
        data: buffer,
        requiresSpecialHandling: true,
      };
    }

    try {
      const csvString = new TextDecoder().decode(buffer);

      if (!csvString || csvString.length === 0) {
        throw new Error('TextDecoder returned empty string');
      }

      return {
        type: 'csv_string',
        data: csvString,
        requiresSpecialHandling: false,
      };
    } catch (decodingError) {
      console.error('TextDecoder failed, marking for special handling', {
        error: decodingError.message,
        bufferSize: bufferSize,
      });

      return {
        type: 'large_buffer',
        data: buffer,
        requiresSpecialHandling: true,
      };
    }
  }

  /**
   * Check if buffer can be safely decoded by TextDecoder
   * @param {number} bufferSize - Size in bytes
   * @returns {boolean} True if safe to decode
   */
  static canSafelyDecodeBuffer(bufferSize) {
    const MAX_TEXTDECODER_BUFFER = 100 * 1024 * 1024; // 100MB
    return bufferSize <= MAX_TEXTDECODER_BUFFER;
  }

  /**
   * Handle large buffer that cannot be processed normally
   * @param {ArrayBuffer} buffer - Raw data buffer
   * @param {string} datasetName - Name of the dataset
   * @param {Object} metadata - Dataset metadata
   * @returns {Promise<void>}
   */
  static async handleLargeBuffer(buffer, datasetName, metadata) {
    const baseFilename = `${datasetName}_${DownloadService.formatDateForFilename()}`;

    // Create Excel metadata file
    const metadataWorkbook = DownloadService.createExcelWorkbook(
      DownloadService.createMetadataSheets(metadata),
    );
    const metadataBuffer = DownloadService.workbookToBuffer(metadataWorkbook);

    // Create ZIP with CSV data and Excel metadata
    const files = [
      {
        filename: `${datasetName}_data.csv`,
        content: buffer,
      },
      {
        filename: `${datasetName}_metadata.xlsx`,
        content: metadataBuffer,
      },
    ];

    await DownloadService.downloadZip(files, baseFilename);

    console.info('Successfully downloaded large dataset as ZIP', {
      datasetName,
      sizeMB: (buffer.byteLength / (1024 * 1024)).toFixed(1),
    });
  }
}

export default ArrayBufferProcessor;