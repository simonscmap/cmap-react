import React from 'react';
import Typography from '@material-ui/core/Typography';
import { GuideLink } from './Links';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { CustomAlert } from './Alert';

const DownloadSampleAlert = (props) => {
  const { text } = props;
  return (
      <CustomAlert severity="info">
        <Typography>
          { text }
        </Typography>
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
  );
}

export default DownloadSampleAlert;
