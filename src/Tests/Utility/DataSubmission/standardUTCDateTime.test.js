// Note: this tests a module that is not used
import { isAcceptedFormat } from '../../../Components/DataSubmission/Helpers/standardUTCDateTime';

const timeRe = new RegExp (/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/);


describe('Standard UTC Date Time Parser', () => {
  test('regex works as expected', () => {
    // document which formats work and which don't
    const matchingDates = [
      '2010',
      '2010-01-01',
      '2011/01/01'

    ];
    const nonMatchingDates = [
      'February 12, 2014',
      '2014-02-10T00:00Z',
      '2014-02-10T00:00:00Z',
      '2014-02-10T00:00:00-08:00'
    ];

    matchingDates.forEach ((d) => {
      const match = d.match (timeRe);
      expect (match).toBeTruthy();
    });

    nonMatchingDates.forEach ((d) => {
      const match = d.match (timeRe);
      expect (match).toBeFalsy();
    });
  });

  test('regex works as expected', () => {
    // accepted dates, which parsed with the 'utc' plugin
    // will correctly not factor in the local time and
    // interpret each date as a UTC date
    const acceptedDates = [
      '2010',
      '2010-01-01',
      '2011/01/01',
      '2014-02-10T00:00:00Z',
    ];

    // non accepted dates
    const nonAcceptedDates = [
      'February 12, 2014',
      '2014-02-10T00:00Z',
      '2014-02-10T00:00:00-08:00', // valid ISO8601
      '20240313T171936Z', // this is a valid ISO8601
    ];

    acceptedDates.forEach ((d) => {
      const result = isAcceptedFormat (d);
      expect (result).toBeTruthy();
    });

    nonAcceptedDates.forEach ((d) => {
      const result = isAcceptedFormat (d);
      expect (result).toBeFalsy();
    });
  });
});
