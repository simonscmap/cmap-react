import * as Sentry from '@sentry/react';
import logInit from '../../Services/log-service';

const log = logInit('Utility/Catalog/groupDatasetsByMake');

const groupDatasetsByMake = (datasets) =>
  datasets.reduce(
    (acc, cur) => {
      let make = cur.variables && cur.variables[0] && cur.variables[0].Make;

      // Viz tool only supports Observation/Model categories; group Assimilation under Model
      if (make === 'Assimilation') {
        make = 'Model';
      }

      if (make && acc[make]) {
        acc[make].push(cur);
      } else {
        const datasetName = cur.Short_Name || cur.Dataset_Name || 'unknown';
        log.debug('unexpected Make value', {
          datasetName,
          make,
          hasVariables: !!cur.variables,
          variablesLength: cur.variables ? cur.variables.length : 0,
        });
        Sentry.captureException(new Error('Unexpected Make value'), {
          tags: { feature: 'visualization', phase: 'groupDatasetsByMake' },
          extra: { datasetName, make },
        });
      }
      return acc;
    },
    {
      Observation: [],
      Model: [],
    },
  );

export default groupDatasetsByMake;
