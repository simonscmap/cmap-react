// https://stackoverflow.com/questions/16229494/converting-excel-date-serial-number-to-date-using-javascript

export default (data, workbook) => {
  if (!data || !data.length) {
    return;
  }

  try {
    let sample = data[0].time;
    let regex = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z)?$/;
    // Test sample row for correct format
    if (!regex.test(sample)) {

      let is1904 = !!((workbook.Workbook || {}).WBProps || {}).date1904;

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
            'correct by 25567 convert number to ISO string and truncate ms',
          );
          data.forEach((e) => {
            let newTime = new Date((e.time - 25569) * 86400 * 1000)
              .toISOString()
              .slice(0, -5);
            console.log(
              e.time,
              new Date(e.time * 86400 * 1000).toISOString(),
              e.time - 25567,
              new Date((e.time - 25569) * 86400 * 1000).toISOString(),
            );
            e.time = newTime;
          });
        }
      } else {
        console.log('type is not a number; attempt to convert number to ISO string and truncate ms');
        data.forEach((e) => {
          e.time = new Date(e.time).toISOString().slice(0, -5);
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
