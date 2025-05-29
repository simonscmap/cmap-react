import {
  detectFormat,
} from '../../../Components/DataSubmission/Helpers/workbookAuditLib/time.js';
import { validTime } from '../../../Components/DataSubmission/Helpers/generateAudits.js';

describe('titan of time', () => {
  describe('detectFormat', () => {
    test('should detect integer values', () => {
      expect(detectFormat(123)).toBe('integer');
      expect(detectFormat(0)).toBe('integer');
      expect(detectFormat(-456)).toBe('integer');
    });

    test('should detect decimal values', () => {
      expect(detectFormat(123.45)).toBe('decimal');
      expect(detectFormat(0.789)).toBe('decimal');
      expect(detectFormat(-456.78)).toBe('decimal');
    });

    test('should detect valid date strings', () => {
      expect(detectFormat('2022-01-01')).toBe('date string');
      expect(detectFormat('2019-12-31')).toBe('date string');
    });

    test('should detect valid datetime strings', () => {
      expect(detectFormat('2022-01-01T12:30:45')).toBe('datetime string');
      expect(detectFormat('2022-01-01T12:30:45Z')).toBe('datetime string');
      expect(detectFormat('2022-01-01T12:30:45.123')).toBe('datetime string');
      expect(detectFormat('2022-01-01T12:30:45.123Z')).toBe('datetime string');
    });

    test('should detect invalid string formats', () => {
      expect(detectFormat('not-a-date')).toBe('invalid string');
      expect(detectFormat('2022/01/01')).toBe('invalid string');
      expect(detectFormat('01-01-2022')).toBe('invalid string');
      expect(detectFormat('2022-01-01 12:30:45')).toBe('invalid string'); // Space instead of T
    });

    test('should handle undefined or null values', () => {
      expect(detectFormat(undefined)).toBe(undefined);
      expect(detectFormat(null)).toBe(undefined);
      expect(detectFormat('')).toBe('invalid string');
    });

    test('should handle non-string and non-number values', () => {
      expect(detectFormat({})).toBe(undefined);
      expect(detectFormat([])).toBe(undefined);
      expect(detectFormat(true)).toBe(undefined);
    });
  });

  describe('validTime', () => {
    test('should pass valid time formats', () => {
      expect(validTime(123.45)).toBe(undefined); // decimal - valid
      expect(validTime('2022-01-01')).toBe(undefined); // date string - valid
      expect(validTime('2022-01-01T12:30:45')).toBe(undefined); // datetime string - valid
      expect(validTime('2022-01-01T12:30:45Z')).toBe(undefined); // datetime string with Z - valid
      expect(validTime('2022-01-01T12:30:45.123')).toBe(undefined); // datetime string with ms - valid
      expect(validTime('2022-01-01T12:30:45.123Z')).toBe(undefined); // datetime string with ms and Z - valid
    });

    test('should reject integer time values', () => {
      expect(validTime(123)).toBe('Value is integer type.');
      expect(validTime(0)).toBe('Value is integer type.');
      expect(validTime(-456)).toBe('Value is integer type.');
    });

    test('should reject invalid string formats', () => {
      expect(validTime('not-a-date')).toBe('Value is incorrect string format.');
      expect(validTime('2022/01/01')).toBe('Value is incorrect string format.');
      expect(validTime('01-01-2022')).toBe('Value is incorrect string format.');
      expect(validTime('2022-01-01 12:30:45')).toBe('Value is incorrect string format.'); // Space instead of T
    });

    test('should reject missing or undefined values', () => {
      expect(validTime(undefined)).toBe('Value is missing or unknown type.');
      expect(validTime(null)).toBe('Value is missing or unknown type.');
      expect(validTime('')).toBe('Value is incorrect string format.');
    });

    test('should reject non-string and non-number values', () => {
      expect(validTime({})).toBe('Value is missing or unknown type.');
      expect(validTime([])).toBe('Value is missing or unknown type.');
      expect(validTime(true)).toBe('Value is missing or unknown type.');
    });
  });
});