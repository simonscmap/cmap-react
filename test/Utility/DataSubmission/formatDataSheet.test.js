import XLSX from 'xlsx';

import createTestWorkbook from '../../TestUtils/createTestWorkbook';
import formatDataSheet, {
  processTimeString,
  TIME_CONVERSION_TYPES,
} from '../../../Components/DataSubmission/Helpers/formatDataSheet';

describe('formatDataSheet', () => {
  test('Handle excel date serialization formats', () => {
    let wb = createTestWorkbook.excelDate();
    let data = XLSX.utils.sheet_to_json(wb.Sheets['data'], { defval: null });
    let { data: formatted } = formatDataSheet(data, wb);

    expect(formatted[0].time).toMatch(
      /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z)?$/,
    );
  });

  test('Handle valid dates with alternate formats', () => {
    let wb = createTestWorkbook.alternateDateFormat();
    let data = XLSX.utils.sheet_to_json(wb.Sheets['data'], { defval: null });
    let { data: formatted } = formatDataSheet(data, wb);
    expect(formatted[0].time).toMatch(
      /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z)?$/,
    );
  });
});

describe('processTimeString', () => {
  test('should return unchanged value for invalid date format', () => {
    const invalidDate = 'not-a-date';
    const result = processTimeString(invalidDate);

    expect(result.value).toBe(invalidDate);
    expect(result.conversionType).toBe(TIME_CONVERSION_TYPES.NONE);
  });

  test('should add UTC designator to valid date without timezone', () => {
    const dateWithoutTZ = '2022-05-15T12:30:45';
    const result = processTimeString(dateWithoutTZ);

    expect(result.value).toMatch('2022-05-15T12:30:45Z');
    expect(result.conversionType).toBe(
      TIME_CONVERSION_TYPES.STRING_NO_TZ_TO_UTC,
    );
  });

  test('should not modify dates already in UTC format', () => {
    const utcDate = '2022-05-15T12:30:45Z';
    const result = processTimeString(utcDate);

    expect(result.value).toBe(utcDate);
    expect(result.conversionType).toBe(TIME_CONVERSION_TYPES.NONE);
  });

  test('should not modify dates with +00:00 timezone (UTC equivalent)', () => {
    const utcEquivalentDate = '2022-05-15T12:30:45+00:00';
    const result = processTimeString(utcEquivalentDate);

    expect(result.value).toBe(utcEquivalentDate);
    expect(result.conversionType).toBe(TIME_CONVERSION_TYPES.NONE);
  });

  test('should convert non-UTC timezone to UTC', () => {
    const nonUtcDate = '2022-05-15T12:30:45-07:00';
    const result = processTimeString(nonUtcDate);

    // Should be converted to UTC (7 hours ahead)
    expect(result.value).toMatch('2022-05-15T19:30:45Z');
    expect(result.conversionType).toBe(
      TIME_CONVERSION_TYPES.STRING_NON_UTC_TO_UTC,
    );
  });
});
