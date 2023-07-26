// Ammend the results of a catalog search with a new "column"
// "DataFeatures", in order to ascribe properties of the dataset that are not
// stored in the dataset metadata,
// namely Continuous Ingestion and Ancillary Data flags
import initLogger from '../../Services/log-service';
const log = initLogger('Utility/Catalog/ammendSearchResultsWithDatasetFeatures');


export const CONTINUOUSLY_UPDATED = 'Continuously Updated';
export const ANCILLARY_DATA = 'Ancillary Data';

const ammendResults = (resultArray, datasetFeatures) => {
  let results = resultArray.map((datasetMetadata) => {
    let { Table_Name } = datasetMetadata;

    let ammendation = {
      DataFeatures: [],
    };

    if (typeof Table_Name === 'string') {
      // NOTE that the API guarantees that the keys to datasetFeatures are lower case
      // This match depends upon that being true
      let datasetFeatureRecord = datasetFeatures[Table_Name.toLowerCase()];
      if (datasetFeatureRecord) {
        if (datasetFeatureRecord.ci) {
          ammendation.DataFeatures.push(CONTINUOUSLY_UPDATED);
        }
        if (datasetFeatureRecord.ancillary) {
          ammendation.DataFeatures.push(ANCILLARY_DATA);
        }
      } else {
        // console.log (`no dataset features for ${Table_Name}`);
      }
    } else {
      log.error ('table name was not a string', { Table_Name });
    }

    return Object.assign(datasetMetadata, ammendation);
  });

  return results;
}

export default ammendResults;
