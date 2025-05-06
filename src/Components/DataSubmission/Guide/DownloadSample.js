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
      <Typography>{text}</Typography>
      <List>
        <ListItem>
          <ListItemText>
            <GuideLink
              href="https://www.dropbox.com/scl/fi/vntp1124t3a55m5evj5y7/Gradients5_TN412_15N13C.xlsx?rlkey=o317sjumqrskgwpexbb8h9m3d&st=9vke7zwm&dl=0"
              download="Gradients5_TN412_15N13C.xlsx"
            >
              Sample Dataset - Gradients5_TN412_15N13C
            </GuideLink>
          </ListItemText>
        </ListItem>
        <ListItem>
          <ListItemText>
            <GuideLink
              href="https://www.dropbox.com/scl/fi/d2j7hxkqfnrmlks0e2dd9/Influx_Stations_Gradients_2021v1_1.xlsx?rlkey=japjoei68tv5dxk095za0zz94&st=ofgqcbal&dl=0"
              download="Influx_Stations_Gradients_2021v1_1.xlsx"
            >
              Sample Dataset - Influx_Stations_Gradients_2021v1_1
            </GuideLink>
          </ListItemText>
        </ListItem>
      </List>
    </CustomAlert>
  );
};

export default DownloadSampleAlert;
