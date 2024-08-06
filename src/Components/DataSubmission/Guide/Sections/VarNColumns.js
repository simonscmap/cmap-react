import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Meta } from './DataSheetSections';
import { sectionStyles } from '../guideStyles';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { GuideLink } from '../Links';

import { CustomAlert } from '../Alert';
const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Meta meta={{
              required: true,
              format: 'Any',
              units: 'Any (specify in the variable sheet)',
              constraints: ['None'],
            }} />

      <Typography>
         These columns represent the dataset variables (measurements). Please
         rename them as appropriate for your data. Note that these names should
         be identical to the names defined as{' '}
         <GuideLink hash="#var_short_name-column">var_short_name</GuideLink>
         &nbsp;in the{' '}
         <GuideLink hash="#variable-metadata-sheet">Variable Metadata</GuideLink> sheet.
         Please do not include units in these columns; units are recorded in
         the Variable Metadata sheet. Leave a given cell empty for those
         instances when data was not taken and a value is missing. Do not
         replace the missing data with arbitrary values such as 99999, 0,
         “UNKNOWN”, etc. If you wish to flag specific column values, please add
         relevant flag columns with descriptions of flag values in the Variable Metadata Sheet\'s <code>comment</code> column.
      </Typography>
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
