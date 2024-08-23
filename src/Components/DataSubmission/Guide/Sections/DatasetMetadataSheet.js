import React from 'react';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import { sectionStyles } from '../guideStyles';
import { GuideLink } from '../Links';
import { CustomAlert } from '../Alert';
import DemoSheet from '../DemoSheet';
import { metaCols, metaSheet } from '../demoSheetData';


const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Typography>
        This sheet, labeled <code>dataset_meta_data</code>, holds a list of top-level attributes about the dataset such as the dataset name and description.
      </Typography>

      <div className={cl.scrollWrapper}>
        <div className={cl.standoutBadge}>Example Metadata Sheet</div>
        <DemoSheet columns={metaCols} source={metaSheet} />
      </div>


      <CustomAlert severity="info">
        <Typography>Please review the example datasets for a full view of the sheet.</Typography>
        <List>
          <ListItem>
            <ListItemText>
              <GuideLink
                href="https://github.com/simonscmap/DBIngest/raw/master/template/amt01_extracted_cholorphyll_2020_07_25.xlsx"
                download="AMT01_Extracted_Cholorphyll_Sample.xlsx"
              >
                Sample Dataset - amt01_extracted_cholorphyll
              </GuideLink>
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText>
              <GuideLink
                href="https://github.com/simonscmap/DBIngest/raw/master/template/Influx_Stations_Gradients_2016_example_2020_08_13.xlsx"
                download="Influx_Stations_Gradients_2016_example.xlsx"
              >
                Sample Dataset - Influx_Stations_Gradients_2016
              </GuideLink>
            </ListItemText>
          </ListItem>
        </List>
      </CustomAlert>

    </div>
  );
};

export default Content;
