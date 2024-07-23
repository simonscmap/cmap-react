import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import { sectionStyles } from '../guideStyles';

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Typography>
        <Link
          href="https://github.com/simonscmap/DBIngest/raw/master/template/datasetTemplate.xlsx"
          download="datasetTemplate.xlsx"
        >
          Download a Blank xlsx Template
        </Link>
      </Typography>

      <Typography>
        <Link
          href="https://github.com/simonscmap/DBIngest/raw/master/template/amt01_extracted_cholorphyll_2020_07_25.xlsx"
          download="AMT01_Extracted_Cholorphyll_Sample.xlsx"
        >
          Sample Dataset - amt01_extracted_cholorphyll
        </Link>
      </Typography>

      <Typography>
        <Link
          href="https://github.com/simonscmap/DBIngest/raw/master/template/Influx_Stations_Gradients_2016_example_2020_08_13.xlsx"
          download="Influx_Stations_Gradients_2016_example.xlsx"
        >
          Sample Dataset - Influx_Stations_Gradients_2016
        </Link>
      </Typography>

      <Typography></Typography>
      <div className={cl.subHeader}></div>
    </div>
  );
};

export default Content;
