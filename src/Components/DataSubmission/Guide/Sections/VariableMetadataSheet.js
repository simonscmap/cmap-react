import React from 'react';
import Typography from '@material-ui/core/Typography';
import { sectionStyles } from '../guideStyles';
import { GuideLink } from '../Links';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import { CustomAlert } from '../Alert';
import DemoSheet from '../DemoSheet';
import { varCols, varSheet } from '../demoSheetData';



const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Typography>
        A dataset can contain multiple different measurements (variables).
        This sheet (labeled as <code>vars_meta_data</code>) holds a list of top-level
        attributes about these variables such as the variable name, unit,
        and description. Each variable along with its attributes
        (metadata) is stored in separate rows. Below is the list of these
        attributes along with their descriptions.
      </Typography>

      <div className={cl.scrollWrapper}>
        <div className={cl.standoutBadgeNoOverlap}>Example Variable Metadata Sheet</div>
        <DemoSheet columns={varCols} source={varSheet} />
      </div>

      <div className={cl.subHeader}>Sample Data Sheets</div>
      <Typography>You may download and refer to following examples of completed submisions.</Typography>

    <CustomAlert severity="info">
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
