// https://stackoverflow.com/questions/16229494/converting-excel-date-serial-number-to-date-using-javascript

const checkDateFormat = (data, workbook) => {
if (!data || !Array.isArray(data) || !data[0].time) {
    return null;
  }
  let sample = data[0].time;
  let regex = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z)?$/;
  let is1904 = false;
  // Test sample row for correct format
  if (!regex.test(sample)) {
    is1904 = !!((workbook.Workbook || {}).WBProps || {}).date1904;
  }

  return is1904;
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

export default (data, workbook) => {
  const is1904 = checkDateFormat (data, workbook);

  console.log (`workbook date format is 1904: ${is1904}`);

  // remove empty rows
  const deletedKeys = deleteEmptyRows (data);

  console.log (`deleted keys:`, deletedKeys);

  return data;
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
