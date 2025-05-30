import {
  detectFormat,
  isValidDateString,
  isValidDateTimeString,
  isValidDateTimeComponents,
} from '../../../Components/DataSubmission/Helpers/workbookAuditLib/time.js';

describe('titan of time', () => {
  describe('detectFormat', () => {
    test('should detect integer values', () => {
      expect(detectFormat(123)).toBe('integer');
      expect(detectFormat(0)).toBe(undefined);
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

    test('should detect validate ORIGINAL datetime strings', () => {
      expect(detectFormat('2022-01-01T12:30:45')).toBe('datetime string');
      expect(detectFormat('2022-01-01T12:30:45Z')).toBe('datetime string');
      expect(detectFormat('2022-01-01T12:30:45.123')).toBe('datetime string');
      expect(detectFormat('2022-01-01T12:30:45.123Z')).toBe('datetime string');
    });
    
    describe('should detect datetime strings with timezone information (future support)', () => {
      test('length 24 - no colon in timezone offset', () => {
        expect(detectFormat('2009-10-20T04:38:00+0000')).toBe('datetime string');
        expect(detectFormat('2009-10-20T04:38:00-0500')).toBe('datetime string');
      });

      test('length 25 - with colon in timezone offset', () => {
        expect(detectFormat('2009-10-20T04:38:00+00:00')).toBe('datetime string');
        expect(detectFormat('2009-10-20T04:38:00-05:00')).toBe('datetime string');
      });

      test('length 22 - short timezone offset', () => {
        expect(detectFormat('2009-10-20T04:38:00+00')).toBe('datetime string');
        expect(detectFormat('2009-10-20T04:38:00-05')).toBe('datetime string');
      });

      test('length 29 - with milliseconds and timezone offset', () => {
        expect(detectFormat('2009-10-20T04:38:00.123+00:00')).toBe('datetime string');
        expect(detectFormat('2009-10-20T04:38:00.123-05:00')).toBe('datetime string');
      });
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
      expect(detectFormat('')).toBe(undefined);
    });

    test('should handle non-string and non-number values', () => {
      expect(detectFormat({})).toBe(undefined);
      expect(detectFormat([])).toBe(undefined);
      expect(detectFormat(true)).toBe(undefined);
    });
  });

  describe('isValidDateString', () => {
    test('should validate correct date strings', () => {
      expect(isValidDateString('2022-01-01')).toBe(true);
      expect(isValidDateString('2019-12-31')).toBe(true);
      expect(isValidDateString('2020-02-29')).toBe(true); // Leap year
    });

    test('should reject invalid date strings', () => {
      expect(isValidDateString('2022/01/01')).toBe(false);
      expect(isValidDateString('01-01-2022')).toBe(false);
      expect(isValidDateString('2022-13-01')).toBe(false); // Invalid month
      expect(isValidDateString('2022-01-32')).toBe(false); // Invalid day
      expect(isValidDateString('2021-02-29')).toBe(false); // Not a leap year
      expect(isValidDateString('not-a-date')).toBe(false);
    });

    test('should handle non-string values', () => {
      expect(isValidDateString(20220101)).toBe(undefined);
      expect(isValidDateString(null)).toBe(undefined);
      expect(isValidDateString(undefined)).toBe(undefined);
      expect(isValidDateString({})).toBe(undefined);
    });
  });

  describe('DEPRECATEisValidDateTimeString', () => {
    test('should validate different datetime string formats', () => {
      expect(isValidDateTimeString('2022-01-01T12:30:45')).toBe(true);
      expect(isValidDateTimeString('2022-01-01T12:30:45Z')).toBe(true);
      expect(isValidDateTimeString('2022-01-01T12:30:45.123')).toBe(true);
      expect(isValidDateTimeString('2022-01-01T12:30:45.123Z')).toBe(true);
    });

    test('should reject invalid datetime strings', () => {
      expect(isValidDateTimeString('2022-01-01 12:30:45')).toBe(false); // Space instead of T
      expect(isValidDateTimeString('2022-01-01T25:30:45')).toBe(false); // Invalid hour
      expect(isValidDateTimeString('2022-01-01T12:60:45')).toBe(false); // Invalid minute
      expect(isValidDateTimeString('2022-01-01T12:30:61')).toBe(false); // Invalid second
      expect(isValidDateTimeString('2022-01-01T12:30')).toBe(false); // Missing seconds
      expect(isValidDateTimeString('2022-01-01T12:30:45.1234')).toBe(false); // Too many millisecond digits
    });

    test('should handle non-string values', () => {
      expect(isValidDateTimeString(20220101123045)).toBe(undefined);
      expect(isValidDateTimeString(null)).toBe(undefined);
      expect(isValidDateTimeString(undefined)).toBe(undefined);
      expect(isValidDateTimeString({})).toBe(undefined);
    });
  });

  describe('isValidDateTimeComponents', () => {
    test('should validate correct datetime components', () => {
      expect(isValidDateTimeComponents('2022-01-01T12:30:45')).toBe(true);
      expect(isValidDateTimeComponents('2022-01-01T12:30:45Z')).toBe(true);
      expect(isValidDateTimeComponents('2022-01-01T12:30:45.123')).toBe(true);
      expect(isValidDateTimeComponents('2022-01-01T12:30:45.123Z')).toBe(true);
      expect(isValidDateTimeComponents('2009-10-20T04:38:00.123+00:00')).toBe(true);
      expect(isValidDateTimeComponents('2009-10-20T04:38:00.123-05:00')).toBe(true);
      expect(isValidDateTimeComponents('2009-10-20T04:38:00.103')).toBe(true);
    });

    test('should reject invalid datetime components', () => {
      expect(isValidDateTimeComponents('2022-01-01 12:30:45')).toBe(false); // Space instead of T
      expect(isValidDateTimeComponents('2022-01-01T25:30:45')).toBe(false); // Invalid hour
      expect(isValidDateTimeComponents('2022-01-01T12:60:45')).toBe(false); // Invalid minute
      expect(isValidDateTimeComponents('2022-01-01T12:30:61')).toBe(false); // Invalid second
      expect(isValidDateTimeComponents('2022-01-01T12:30:45.1234')).toBe(false); // Too many millisecond digits
    });
  });
});