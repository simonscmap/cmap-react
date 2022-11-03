import React from 'react';

import FourOhFour from '../FourOhFour';
import compare_sst_data from './compare-sst-data';
import seaflow_time_series from './seaflow-time-series-decomposition';

let idx = {
  'compare-sst-data': compare_sst_data,
  'seaflow-time-series-decomposition': seaflow_time_series,
}

const ResourceSwitch = (props) => {
  let { match } = props;
  let slug = match.params.slug;

  let Resource;

  if (idx[slug]) {
    Resource = idx[slug]
  }

  return Resource ? <Resource /> : <FourOhFour />
};

export default ResourceSwitch;
