import * as dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(utc);
dayjs.extend(tz);
dayjs.extend(LocalizedFormat);

const convertExcelNumeric = (val) => {
  // for 1904 format times
  const rounded = Math.ceil(val * 10000000) / 10000000;
  const numericToUTC = dayjs
    .utc((rounded - 25569) * 86400 * 1000)
    .format('YYYY-MM-DD');
  return numericToUTC;
};

const parseReleaseDate = (releaseDate, workbook) => {
  const is1904 = !!((workbook.Workbook || {}).WBProps || {}).date1904;

  if (typeof releaseDate === 'number') {
    if (is1904) {
      // audit will raise error
    } else {
      return convertExcelNumeric(releaseDate);
    }
  } else if (typeof releaseDate === 'string') {
    if (dayjs(releaseDate).isValid()) {
      return dayjs.utc(releaseDate).format('YYYY-MM-DD');
    }
  }
  // default: return unchanged value
  return releaseDate;
};

export default (metadata, workbook) => {
  if (!metadata || !metadata.length) {
    return;
  }

  const sample = metadata[0];
  const parsedReleaseDateValue = parseReleaseDate(
    sample.dataset_release_date,
    workbook,
  );

  sample.dataset_release_date = parsedReleaseDateValue;

  let cols = Object.keys(metadata[0]);
  let keysContaining__EMPTY = [];
  cols.forEach((e) => {
    if (e.indexOf('__EMPTY') !== -1) {
      keysContaining__EMPTY.push(e);
    }
  });

  if (keysContaining__EMPTY.length) {
    metadata.forEach((e) => {
      keysContaining__EMPTY.forEach((key) => {
        delete e[key];
      });
    });
  }

  cols.forEach((col) => {
    metadata.forEach((row) => {
      let cellValue = row[col];
      if (typeof cellValue === 'string') {
        row[col] = cellValue.trim();
      }
    });
  });

  return metadata;
};

// Format must match 2016-04-21T15:22:00

// const localDateToString = (date) => {
//     let year = date.getFullYear();
//     let month = date.getMonth() + 1;
//     let day = date.getDate()

//     let nYear = year.toString();
//     let nMonth = month < 10 ? '0' + month.toString() : month.toString();
//     let nDay = day < 10 ? '0' + day.toString() : day.toString();

//     return nYear + '-' + nMonth + '-' + nDay;
// }

// export default localDateToString;
