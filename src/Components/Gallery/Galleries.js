import React from 'react';

import FourOhFour from '../FourOhFour';
import compare_sst_data from './compare-sst-data';

let idx = {
  'compare-sst-data': compare_sst_data,
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
