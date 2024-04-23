// https://stackoverflow.com/questions/16229494/converting-excel-date-serial-number-to-date-using-javascript
import dayjs from 'dayjs';

import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// import standardFormat from './standardUTCDateTime';

dayjs.extend(utc);
dayjs.extend(tz);


const is1904Format = (workbook) => {
  return Boolean(((workbook.Workbook || {}).WBProps || {}).date1904);
}

const convertExcelNumeric = (val) => { // for 1904 format times
  const rounded = Math.ceil(val * 10000000) / 10000000;
  const numericToUTC = dayjs.utc((rounded - 25569) * 86400 * 1000).format()
  return numericToUTC;
}

const isNumericFormat = (data) => {
  if (!data || !Array.isArray(data) || (data[0] && data[0].time === undefined)) {
    return undefined;
  }
  const sample = data[0].time;
  if (typeof sample === 'number') {
    return true;
  } else {
    return false;
  }
}

const isExcelDateTimeFormat = (data) => {
  if (!data || !Array.isArray(data) || (data[0] && data[0].time === undefined)) {
    return undefined;
  }
  const sample = data[0].time;
  // excel date formats are decimal values
  if (typeof sample === 'number' && !Number.isInteger(sample)) {
    return true;
  } else {
    return false;
  }
}

const deleteEmptyRows = (data) => {
  let cols = Object.keys(data[0]);
  let keysContaining__EMPTY = [];
  cols.forEach((e) => {
    if (e.indexOf('__EMPTY') !== -1) {
      keysContaining__EMPTY.push(e);
    }
  });

  if (keysContaining__EMPTY.length) {
    data.forEach((e) => {
      keysContaining__EMPTY.forEach((key) => {
        delete e[key];
      });
    });
  }

  return keysContaining__EMPTY;
}

const convertExcelDateTimeToString = (data) => {
  data.forEach((row) => {
    const newUTCDateString = convertExcelNumeric (row.time);
    row.time = newUTCDateString;
  });
}

/* The following formatting aims to provide a minimal parsing of time values:
   - if the value in numeric it will be converted to a string
   - if the provided sheet is in 1904 excel format, a appropriate specifc conversion will be used
   - if the value is a string, it will merely be tested to see if it can be instantiated as a valid date object
   - a critical error will be flagged if a numeric date is negative, or if a string cannot become a valid date
 */
export default (data, workbook) => {
  // flags
  let numericDateFormatConverted = false;
    // predicates
  const isNumeric = isNumericFormat (data);
  const is1904 = is1904Format (workbook);
  const isExcelDateTime = isExcelDateTimeFormat (data);

  if (isNumeric) {
    if (isExcelDateTime) {
      if (is1904) {
        // audit will raise error
      } else {
        convertExcelDateTimeToString (data);
        numericDateFormatConverted = true;
      }
    }
  }

  // remove empty rows
  const deletedKeys = deleteEmptyRows (data);

  return {
    data,
    deletedKeys,
    // flags
    is1904,
    numericDateFormatConverted,
  };
}

const _oldFormattingFn = (data, workbook) => {
  if (!data || !data.length) {
    return;
  }

  try {
    let sample = data[0].time;
    let regex = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z)?$/;
    // Test sample row for correct format
    if (!regex.test(sample)) {
      let is1904 = !!((workbook.Workbook || {}).WBProps || {}).date1904;

      console.log(
        `time format is not correct;\nreceived ${sample} as type ${typeof sample};\nis1904 excel format: ${is1904}`,
      );

      let type = typeof sample;

      if (type === 'number') {
        console.log('time format is a number');
        if (is1904) {
          console.log('time format is date1904');
          data.forEach((e) => {
            e.time = new Date(
              (e.time - 25567) * 86400 * 1000 + 1000 * 60 * 60 * 24 * 365 * 4,
            )
              .toISOString()
              .slice(0, -5);
          });
        } else {
          console.log(
            'correct date serial by 255679, round to seconds, convert to ISO string, truncate ms',
          );

          data.forEach((e) => {
            let rounded = Math.ceil(e.time * 10000000) / 10000000;
            let newTime = new Date((rounded - 25569) * 86400 * 1000)
              .toISOString()
              .slice(0, -5);

            console.log(
              'date conversion:\n',
              `${e.time} ~> ${new Date(e.time * 86400 * 1000).toISOString()}\n`,
              `${e.time - 25569} ~> ${new Date(
                (e.time - 25569) * 86400 * 1000,
              ).toISOString()}\n`,
              `${rounded}     ~> ${new Date(
                (rounded - 25569) * 86400 * 1000,
              ).toISOString()}\n`,
              `                  ~> ${newTime}`,
            );
            e.time = newTime;
          });
        }
      } else {
        console.log(
          'type is not a number; attempting to convert number to ISO string and truncate ms',
        );

        let convertGMTTimeStringToISO = (s, shouldLog) => {
          if (!s || typeof s !== 'string') {
            console.log('expected a string format for the time field');
            return null;
          }

          let d = new Date(s);
          let offset = d.getTimezoneOffset();
          let offsetHours = offset / 60;
          let offsetMinutes = offset % 60;
          let utcHours = d.getUTCHours();

          d.setUTCHours(utcHours - offsetHours);

          if (offsetMinutes !== 0) {
            d.setUTCMinutes(d.getUTCMinutes - offsetMinutes);
          }

          let iso = d.toISOString();
          let final = iso.slice(0, -5);

          if (shouldLog) {
            console.log(`converting time field as follows:`);
            console.log(`
              sample:    ${s}
              tz offset: ${offset}
              offset H:  ${offsetHours}
              offset M:  ${offsetMinutes}
              corrected: ${d}
              iso:       ${iso}
              final:     ${final}
            `);
          }
          return final;
        };

        // log conversion of sample
        convertGMTTimeStringToISO(sample, true);

        // convert each cell
        data.forEach((e) => {
          e.time = convertGMTTimeStringToISO(e.time); // new Date(e.time).toISOString().slice(0, -5);
        });
      }
    }
  } catch (e) {
    console.log('Caught while formatting data', e);
  }

  let cols = Object.keys(data[0]);
  let keysContaining__EMPTY = [];
  cols.forEach((e) => {
    if (e.indexOf('__EMPTY') !== -1) {
      keysContaining__EMPTY.push(e);
    }
  });

  if (keysContaining__EMPTY.length) {
    data.forEach((e) => {
      keysContaining__EMPTY.forEach((key) => {
        delete e[key];
      });
    });
  }

  return data;
};
