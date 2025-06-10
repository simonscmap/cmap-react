import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { processTimeString } from '../../../Components/DataSubmission/Helpers/formatDataSheet';

// Mock isValidDateTimeComponents from workbookAuditLib
// jest.mock('../../../Components/DataSubmission/Helpers/workbookAuditLib/time', () => ({
//   isValidDateTimeComponents: jest.fn(timeString => {
//     // Basic validation for testing - checks if string looks like a date
//     return /\d{4}-\d{2}-\d{2}/.test(timeString);
//   })
// }));

// Import formatDataSheet

// Set up dayjs plugins (matching the implementation file)
dayjs.extend(utc);
dayjs.extend(tz);

// Define TIME_CONVERSION_TYPES enum to match the original
const TIME_CONVERSION_TYPES = {
  NONE: 'NONE',
  EXCEL_TO_UTC: 'EXCEL_TO_UTC',
  STRING_NO_TZ_TO_UTC: 'STRING_NO_TZ_TO_UTC',
  STRING_NON_UTC_TO_UTC: 'STRING_NON_UTC_TO_UTC',
};


describe('processTimeString', () => {

  test('returns original string when not a valid date time', () => {
    const invalidTime = 'not a date';
    const result = processTimeString(invalidTime);
    
    expect(result.value).toBe(invalidTime);
    expect(result.conversionType).toBe(TIME_CONVERSION_TYPES.NONE);
  });

  test('converts string without timezone to UTC', () => {
    const timeWithoutTz = '2023-01-15T12:30:45';
    const result = processTimeString(timeWithoutTz);
    
    expect(result.value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(result.conversionType).toBe(TIME_CONVERSION_TYPES.STRING_NO_TZ_TO_UTC);
  });

  test('preserves UTC time with Z suffix', () => {
    const utcTimeZ = '2023-01-15T12:30:45Z';
    const result = processTimeString(utcTimeZ);
    
    expect(result.value).toBe(utcTimeZ);
    expect(result.conversionType).toBe(TIME_CONVERSION_TYPES.NONE);
  });

  test('preserves UTC time with +00:00 suffix', () => {
    const utcTimePlus = '2023-01-15T12:30:45+00:00';
    const result = processTimeString(utcTimePlus);
    
    expect(result.value).toBe(utcTimePlus);
    expect(result.conversionType).toBe(TIME_CONVERSION_TYPES.NONE);
  });

  test('converts non-UTC timezone to UTC', () => {
    const nonUtcTime = '2023-01-15T12:30:45-08:00';
    const result = processTimeString(nonUtcTime);
    
    // Should be converted to UTC (8 hours ahead for -08:00)
    expect(result.value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(result.conversionType).toBe(TIME_CONVERSION_TYPES.STRING_NON_UTC_TO_UTC);
    
    // Verify the time conversion is correct
    const originalDate = dayjs(nonUtcTime);
    const convertedDate = dayjs(result.value);
    
    // Timestamps should match when compared in the same timezone
    expect(convertedDate.valueOf()).toBe(originalDate.valueOf());
  });

  test('handles different non-UTC timezone formats', () => {
    // Test with different timezone formats
    const formats = [
      { input: '2023-01-15T12:30:45+05:30', description: 'with minutes' },
      { input: '2023-01-15T12:30:45+05', description: 'hours only' }
    ];
    
    formats.forEach(format => {
      const result = processTimeString(format.input);
      expect(result.conversionType).toBe(TIME_CONVERSION_TYPES.STRING_NON_UTC_TO_UTC);
      expect(result.value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    });
  });

  test('treats very small UTC offsets as UTC', () => {
    // Mock the utcOffset to return a very small value
    const mockParsedDate = {
      utcOffset: jest.fn().mockReturnValue(0.1),
      utc: jest.fn().mockReturnValue({
        format: jest.fn().mockReturnValue('2023-01-15T12:30:45Z')
      })
    };
    
    // Mock dayjs for this specific test
    const originalDayjs = dayjs;
    global.dayjs = jest.fn().mockReturnValue(mockParsedDate);
    
    const result = processTimeString('2023-01-15T12:30:45+00:01');
    
    expect(result.value).toBe('2023-01-15T12:30:45+00:01');
    expect(result.conversionType).toBe(TIME_CONVERSION_TYPES.NONE);
    
    // Restore original dayjs
    global.dayjs = originalDayjs;
  });
  
  test('handles edge case with null input', () => {
    // Mock isValidDateTimeComponents to handle null input
    jest.requireMock('../../../Components/DataSubmission/Helpers/workbookAuditLib/time')
      .isValidDateTimeComponents.mockReturnValueOnce(false);
    
    const result = processTimeString(null);
    
    expect(result.value).toBe(null);
    expect(result.conversionType).toBe(TIME_CONVERSION_TYPES.NONE);
  });

  test('handles edge case with undefined input', () => {
    // Mock isValidDateTimeComponents to handle undefined input
    jest.requireMock('../../../Components/DataSubmission/Helpers/workbookAuditLib/time')
      .isValidDateTimeComponents.mockReturnValueOnce(false);
    
    const result = processTimeString(undefined);
    
    expect(result.value).toBe(undefined);
    expect(result.conversionType).toBe(TIME_CONVERSION_TYPES.NONE);
  });

  test('handles edge case with empty string input', () => {
    // Mock isValidDateTimeComponents to handle empty string input
    jest.requireMock('../../../Components/DataSubmission/Helpers/workbookAuditLib/time')
      .isValidDateTimeComponents.mockReturnValueOnce(false);
    
    const result = processTimeString('');
    
    expect(result.value).toBe('');
    expect(result.conversionType).toBe(TIME_CONVERSION_TYPES.NONE);
  });
  
  test('handles incomplete date format', () => {
    // This is a date but not a complete ISO datetime
    const incompleteDate = '2023-01-15';
    
    // Mock validation to allow this string
    jest.requireMock('../../../Components/DataSubmission/Helpers/workbookAuditLib/time')
      .isValidDateTimeComponents.mockReturnValueOnce(true);
    
    const result = processTimeString(incompleteDate);
    
    // Should convert to a full ISO string with time 00:00:00Z
    expect(result.value).toMatch(/^2023-01-15T00:00:00Z$/);
    expect(result.conversionType).toBe(TIME_CONVERSION_TYPES.STRING_NO_TZ_TO_UTC);
  });
  
  test('handles date with just time but no timezone', () => {
    const dateWithTime = '2023-01-15T12:30';
    
    // Mock validation to allow this string
    jest.requireMock('../../../Components/DataSubmission/Helpers/workbookAuditLib/time')
      .isValidDateTimeComponents.mockReturnValueOnce(true);
    
    const result = processTimeString(dateWithTime);
    
    // Should convert to a full ISO string with seconds and Z
    expect(result.value).toMatch(/^2023-01-15T12:30:00Z$/);
    expect(result.conversionType).toBe(TIME_CONVERSION_TYPES.STRING_NO_TZ_TO_UTC);
  });
}); 