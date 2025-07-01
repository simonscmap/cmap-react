import DownloadService from '../../services/downloadService';
import { saveAs } from 'file-saver';
import XLSX from 'xlsx';
import JSZip from 'jszip';

// Mock external dependencies
jest.mock('file-saver');
jest.mock('xlsx');
jest.mock('jszip');

describe('DownloadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('downloadBlob', () => {
    it('should call saveAs with blob and filename', () => {
      const blob = new Blob(['test']);
      const filename = 'test.txt';
      
      DownloadService.downloadBlob(blob, filename);
      
      expect(saveAs).toHaveBeenCalledWith(blob, filename);
    });
  });

  describe('createBlob', () => {
    it('should create blob with default mime type', () => {
      const content = 'test content';
      const blob = DownloadService.createBlob(content);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/plain');
    });

    it('should create blob with specified mime type', () => {
      const content = 'test content';
      const mimeType = 'text/csv';
      const blob = DownloadService.createBlob(content, mimeType);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe(mimeType);
    });
  });

  describe('downloadCSV', () => {
    it('should download CSV file with correct filename', () => {
      const csvContent = 'col1,col2\nval1,val2';
      const filename = 'test';
      
      DownloadService.downloadCSV(csvContent, filename);
      
      expect(saveAs).toHaveBeenCalled();
      const [blob, savedFilename] = saveAs.mock.calls[0];
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/csv;charset=utf-8;');
      expect(savedFilename).toBe('test.csv');
    });
  });

  describe('jsonToCSV', () => {
    it('should convert JSON array to CSV', () => {
      const data = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Los Angeles' }
      ];
      
      const csv = DownloadService.jsonToCSV(data);
      
      expect(csv).toBe('name,age,city\nJohn,30,New York\nJane,25,Los Angeles');
    });

    it('should handle custom column order', () => {
      const data = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Los Angeles' }
      ];
      const columns = ['city', 'name'];
      
      const csv = DownloadService.jsonToCSV(data, columns);
      
      expect(csv).toBe('city,name\nNew York,John\nLos Angeles,Jane');
    });

    it('should return empty string for empty data', () => {
      expect(DownloadService.jsonToCSV([])).toBe('');
      expect(DownloadService.jsonToCSV(null)).toBe('');
    });

    it('should handle null and undefined values', () => {
      const data = [
        { name: 'John', age: null, city: undefined }
      ];
      
      const csv = DownloadService.jsonToCSV(data);
      
      expect(csv).toBe('name,age,city\nJohn,,');
    });
  });

  describe('escapeCSVValue', () => {
    it('should handle simple values', () => {
      expect(DownloadService.escapeCSVValue('simple')).toBe('simple');
      expect(DownloadService.escapeCSVValue(123)).toBe('123');
      expect(DownloadService.escapeCSVValue(true)).toBe('true');
    });

    it('should quote values with commas', () => {
      expect(DownloadService.escapeCSVValue('value,with,commas')).toBe('"value,with,commas"');
    });

    it('should escape quotes', () => {
      expect(DownloadService.escapeCSVValue('value with "quotes"')).toBe('"value with ""quotes"""');
    });

    it('should quote values with newlines', () => {
      expect(DownloadService.escapeCSVValue('line1\nline2')).toBe('"line1\nline2"');
    });

    it('should handle null and undefined', () => {
      expect(DownloadService.escapeCSVValue(null)).toBe('');
      expect(DownloadService.escapeCSVValue(undefined)).toBe('');
    });
  });

  describe('createExcelWorkbook', () => {
    it('should create workbook with multiple sheets', () => {
      const mockWorkbook = {};
      const mockWorksheet1 = {};
      const mockWorksheet2 = {};
      
      XLSX.utils.book_new.mockReturnValue(mockWorkbook);
      XLSX.utils.json_to_sheet.mockReturnValueOnce(mockWorksheet1).mockReturnValueOnce(mockWorksheet2);
      
      const sheets = [
        { name: 'Sheet1', data: [{ col1: 'val1' }] },
        { name: 'Sheet2', data: [{ col2: 'val2' }] }
      ];
      
      const result = DownloadService.createExcelWorkbook(sheets);
      
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledTimes(2);
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(2);
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(mockWorkbook, mockWorksheet1, 'Sheet1');
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(mockWorkbook, mockWorksheet2, 'Sheet2');
      expect(result).toBe(mockWorkbook);
    });
  });

  describe('downloadExcel', () => {
    it('should create and download Excel file', () => {
      const mockWorkbook = {};
      XLSX.utils.book_new.mockReturnValue(mockWorkbook);
      
      const sheets = [{ name: 'Data', data: [{ col1: 'val1' }] }];
      const filename = 'test';
      
      DownloadService.downloadExcel(sheets, filename);
      
      expect(XLSX.writeFile).toHaveBeenCalledWith(mockWorkbook, 'test.xlsx');
    });
  });

  describe('createZip', () => {
    it('should create ZIP with multiple files', async () => {
      const mockZip = {
        file: jest.fn(),
        generateAsync: jest.fn().mockResolvedValue(new Blob())
      };
      JSZip.mockReturnValue(mockZip);
      
      const files = [
        { filename: 'file1.txt', content: 'content1' },
        { filename: 'file2.txt', content: 'content2' }
      ];
      
      const result = await DownloadService.createZip(files);
      
      expect(mockZip.file).toHaveBeenCalledTimes(2);
      expect(mockZip.file).toHaveBeenCalledWith('file1.txt', 'content1');
      expect(mockZip.file).toHaveBeenCalledWith('file2.txt', 'content2');
      expect(mockZip.generateAsync).toHaveBeenCalledWith({ type: 'blob' });
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('downloadZip', () => {
    it('should create and download ZIP file', async () => {
      const mockZip = {
        file: jest.fn(),
        generateAsync: jest.fn().mockResolvedValue(new Blob())
      };
      JSZip.mockReturnValue(mockZip);
      
      const files = [{ filename: 'file1.txt', content: 'content1' }];
      const zipFilename = 'archive';
      
      await DownloadService.downloadZip(files, zipFilename);
      
      expect(saveAs).toHaveBeenCalled();
      const [blob, filename] = saveAs.mock.calls[0];
      expect(blob).toBeInstanceOf(Blob);
      expect(filename).toBe('archive.zip');
    });
  });

  describe('formatDateForFilename', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const formatted = DownloadService.formatDateForFilename(date);
      
      expect(formatted).toBe('2023-12-25');
    });

    it('should use current date if no date provided', () => {
      const spy = jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2023-12-25T10:30:00Z');
      
      const formatted = DownloadService.formatDateForFilename();
      
      expect(formatted).toBe('2023-12-25');
      spy.mockRestore();
    });
  });

  describe('generateTimestampedFilename', () => {
    it('should generate filename with timestamp', () => {
      jest.spyOn(DownloadService, 'formatDateForFilename').mockReturnValue('2023-12-25');
      
      const filename = DownloadService.generateTimestampedFilename('report', 'csv');
      
      expect(filename).toBe('report_2023-12-25.csv');
    });
  });

  describe('workbookToBuffer', () => {
    it('should convert workbook to array buffer', () => {
      const mockWorkbook = {};
      const mockBuffer = new ArrayBuffer(8);
      XLSX.write.mockReturnValue(mockBuffer);
      
      const result = DownloadService.workbookToBuffer(mockWorkbook);
      
      expect(XLSX.write).toHaveBeenCalledWith(mockWorkbook, {
        bookType: 'xlsx',
        type: 'array'
      });
      expect(result).toBe(mockBuffer);
    });
  });

  describe('createMetadataSheets', () => {
    it('should create sheets from metadata object', () => {
      const metadata = {
        dataset: { name: 'Test Dataset', id: 1 },
        variables: [{ name: 'var1', unit: 'm' }],
        variableStats: [{ variable: 'var1', min: 0, max: 100 }]
      };
      
      const sheets = DownloadService.createMetadataSheets(metadata);
      
      expect(sheets).toHaveLength(3);
      expect(sheets[0]).toEqual({
        name: 'Dataset Metadata',
        data: [{ name: 'Test Dataset', id: 1 }]
      });
      expect(sheets[1]).toEqual({
        name: 'Variable Metadata',
        data: [{ name: 'var1', unit: 'm' }]
      });
      expect(sheets[2]).toEqual({
        name: 'Variable Summary Statistics',
        data: [{ variable: 'var1', min: 0, max: 100 }]
      });
    });

    it('should handle partial metadata', () => {
      const metadata = {
        dataset: { name: 'Test Dataset' }
      };
      
      const sheets = DownloadService.createMetadataSheets(metadata);
      
      expect(sheets).toHaveLength(1);
      expect(sheets[0].name).toBe('Dataset Metadata');
    });

    it('should handle empty metadata', () => {
      const sheets = DownloadService.createMetadataSheets({});
      expect(sheets).toHaveLength(0);
    });
  });
});