// api helpers
import CSVParser from 'csv-parse';
import encoding from 'text-encoding';

export const fetchAndParseCSVData = async ({
  endpoint,
  collector,
  options,
}) => {
  console.log(`fetching ${endpoint} and parsing as CSV`);
  let url = endpoint;
  let { fetchOptions, collectorType } = options;
  let decoder = new encoding.TextDecoder();
  // initialize collector according to provided option
  // either a "list" (array) or "keyValue" (object)
  let csvData = collectorType === 'list' ? [] : {};

  let csvParser = CSVParser({ columns: true });

  csvParser.on('readable', function () {
    let record;
    while ((record = csvParser.read())) {
      collector(csvData, record);
      // csvData.push(record);
    }
  });

  let response = await fetch(url, fetchOptions);

  if (!response.ok) {
    console.log(`error fetching ${url} from csv parser`);
    return false;
  }

  let body = response.body;

  let reader = body.getReader();

  try {
    let readerIsDone = false;
    while (!readerIsDone) {
      let chunk = await reader.read();
      if (chunk.done) {
        readerIsDone = true;
      } else {
        csvParser.write(decoder.decode(chunk.value));
      }
    }
  } catch (e) {
    console.log(`error parsing csv data`);
    return null;
  }

  return csvData;
};
