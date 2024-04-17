import {
  isValidDateString,
  isValidDateTimeString,
} from '../../../Components/DataSubmission/Helpers/workbookAuditLib/time.js';

describe('check that time is valid', () => {
  test('valid date', () => {
    // correct date
    const s1 = '2014-09-10';
    const r1 = isValidDateString (s1);
    expect(r1).toBeTruthy();

    // incorrect year
    const s2 = '201-09-10';
    const r2 = isValidDateString (s2);
    expect(r2).toBeFalsy();

    // only year
    const s3 = '2010';
    const r3 = isValidDateString (s3);
    expect(r3).toBeFalsy();

    // nonsense month
    const s4 = '2010-20-15';
    const r4 = isValidDateString (s4);
    expect(r4).toBeFalsy();

    // nonsense day
    const s5 = '2010-10-32';
    const r5 = isValidDateString (s5);
    expect(r5).toBeFalsy();

    // single digit month
    const s6 = '2010-1-32';
    const r6 = isValidDateString (s6);
    expect(r6).toBeFalsy();

    // single digit day
    const s7 = '2010-01-1';
    const r7 = isValidDateString (s7);
    expect(r7).toBeFalsy();
  })
});

describe('check that time is valid', () => {
  test('valid date time', () => {
    // correct date time
    const s1 = '2014-09-10T21:30:00';
    const r1 = isValidDateTimeString (s1);
    expect(r1).toBeTruthy();

    // correct date time
    const s2 = '2014-09-10T21:30:00Z';
    const r2 = isValidDateTimeString (s2);
    expect(r2).toBeTruthy();

    // correct date time
    const s3 = '2014-09-10T21:30:00.000';
    const r3 = isValidDateTimeString (s3);
    expect(r3).toBeTruthy();

    // correct date time
    const s4 = '2014-09-10T21:30:00.000Z';
    const r4 = isValidDateTimeString (s4);
    expect(r4).toBeTruthy();

    // -- incorrect date times

    const incorrectDateTimes = [
      '',
      '2014-09-01', // a valid date is not a valid date time
      '2014-09-10 21:30:00.0Z', // only 1 milisecond digit
      '2014-09-10T21:30:00.0Z', // only 1 milisecond digit
      '2014-09-10T21:30:00.00Z', // only 2 milisecond digits
      '2014-09-10T21:30:00.000-08:00', // valid ISO with tz offset is NOT valid for CMAP
      '2014-09-10T21:30:00.000+08:00', // ditto
// --- malformed
      '2014-09-10T21:30:90.000',
      '2014-09-10T21:60:00.000',
      '2014-09-10T25:30:00.000',
    ];
    const rs = incorrectDateTimes.map (isValidDateTimeString);
    rs.forEach (t => expect(t).toBeFalsy())

  });
});
