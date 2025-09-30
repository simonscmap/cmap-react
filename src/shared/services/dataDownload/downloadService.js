import XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

/**
 * Core download service providing utilities for file downloads, format conversion, and ZIP creation
 */
class DownloadService {
  /**
   * Downloads a file from a blob with the specified filename
   * @param {Blob} blob - The blob to download
   * @param {string} filename - The filename for the download
   */
  static downloadBlob(blob, filename) {
    saveAs(blob, filename);
  }

  /**
   * Creates a blob from string content
   * @param {string} content - The string content
   * @param {string} mimeType - The MIME type (default: 'text/plain')
   * @returns {Blob} The created blob
   */
  static createBlob(content, mimeType = 'text/plain') {
    return new Blob([content], { type: mimeType });
  }

  /**
   * Downloads a CSV file from string content
   * @param {string} csvContent - The CSV string content
   * @param {string} filename - The filename (without extension)
   */
  static downloadCSV(csvContent, filename) {
    const blob = this.createBlob(csvContent, 'text/csv;charset=utf-8;');
    this.downloadBlob(blob, `${filename}.csv`);
  }

  /**
   * Converts JSON data to CSV format
   * @param {Array<Object>} data - Array of objects to convert
   * @param {Array<string>} columns - Optional array of column names to include (in order)
   * @returns {string} CSV formatted string
   */
  static jsonToCSV(data, columns = null) {
    if (!data || data.length === 0) {
      return '';
    }

    // Determine columns from data if not provided
    const headers = columns || Object.keys(data[0]);

    // Create header row
    const headerRow = headers
      .map((header) => this.escapeCSVValue(header))
      .join(',');

    // Create data rows
    const dataRows = data.map((row) =>
      headers.map((header) => this.escapeCSVValue(row[header])).join(','),
    );

    return [headerRow, ...dataRows].join('\n');
  }

  /**
   * Escapes a value for CSV format
   * @param {any} value - The value to escape
   * @returns {string} The escaped value
   */
  static escapeCSVValue(value) {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = String(value);

    // Check if value needs to be quoted
    if (
      stringValue.includes(',') ||
      stringValue.includes('"') ||
      stringValue.includes('\n')
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  /**
   * Creates an Excel workbook from multiple sheets
   * @param {Array<{name: string, data: Array<Object>}>} sheets - Array of sheet definitions
   * @param {string} filename - The filename (without extension)
   * @returns {XLSX.WorkBook} The created workbook
   */
  static createExcelWorkbook(sheets) {
    const workbook = XLSX.utils.book_new();

    sheets.forEach(({ name, data }) => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, name);
    });

    return workbook;
  }

  /**
   * Downloads an Excel file with multiple sheets
   * @param {Array<{name: string, data: Array<Object>}>} sheets - Array of sheet definitions
   * @param {string} filename - The filename (without extension)
   * @throws {Error} When Excel file creation or download fails
   */
  static downloadExcel(sheets, filename) {
    try {
      const workbook = this.createExcelWorkbook(sheets);
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } catch (error) {
      console.log('❌ Error downloading Excel file:', error);
      throw new Error(`Excel download failed: ${error.message}`);
    }
  }

  /**
   * Creates a ZIP file with multiple files
   * @param {Array<{filename: string, content: string|Blob|ArrayBuffer}>} files - Array of file definitions
   * @returns {Promise<Blob>} Promise resolving to the ZIP blob
   */
  static async createZip(files) {
    const zip = new JSZip();

    files.forEach(({ filename, content }) => {
      zip.file(filename, content);
    });

    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Downloads a ZIP file containing multiple files
   * @param {Array<{filename: string, content: string|Blob|ArrayBuffer}>} files - Array of file definitions
   * @param {string} zipFilename - The ZIP filename (without extension)
   */
  static async downloadZip(files, zipFilename) {
    const zipBlob = await this.createZip(files);
    this.downloadBlob(zipBlob, `${zipFilename}.zip`);
  }

  /**
   * Formats a date for use in filenames
   * @param {Date} date - The date to format
   * @returns {string} Formatted date string (YYYY-MM-DD)
   */
  static formatDateForFilename(date = new Date()) {
    return date.toISOString().split('T')[0];
  }

  /**
   * Generates a filename with timestamp
   * @param {string} prefix - The filename prefix
   * @param {string} extension - The file extension (without dot)
   * @returns {string} Generated filename
   */
  static generateTimestampedFilename(prefix, extension) {
    const timestamp = this.formatDateForFilename();
    return `${prefix}_${timestamp}.${extension}`;
  }

  /**
   * Converts Excel workbook to buffer for inclusion in ZIP files
   * @param {XLSX.WorkBook} workbook - The workbook to convert
   * @returns {ArrayBuffer} The workbook as array buffer
   */
  static workbookToBuffer(workbook) {
    return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  }

  /**
   * Creates metadata sheets for Excel workbooks
   * @param {Object} metadata - Metadata object with dataset and variable information
   * @returns {Array<{name: string, data: Array<Object>}>} Array of sheet definitions
   */
  static createMetadataSheets(metadata) {
    const sheets = [];

    if (metadata.dataset) {
      sheets.push({
        name: 'Dataset Metadata',
        data: Array.isArray(metadata.dataset)
          ? metadata.dataset
          : [metadata.dataset],
      });
    }

    if (metadata.variables && metadata.variables.length > 0) {
      sheets.push({
        name: 'Variable Metadata',
        data: metadata.variables,
      });
    }

    if (metadata.variableStats && metadata.variableStats.length > 0) {
      sheets.push({
        name: 'Variable Summary Statistics',
        data: metadata.variableStats,
      });
    }

    return sheets;
  }
}

export default DownloadService;
