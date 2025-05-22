import React, { useEffect, useState } from 'react';
import { Chip } from '@material-ui/core';

const SpatialCoverage = (props) => {
  const { features } = props;
  if (!features || !features.ancillary) {
    return '';
  }

  return <Chip color="primary" size="small" label="Ancillary Data" />;
};

export default SpatialCoverage;
