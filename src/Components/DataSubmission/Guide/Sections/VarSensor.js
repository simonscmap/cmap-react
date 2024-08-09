import React from 'react';
import Typography from '@material-ui/core/Typography';
import { useSelector } from 'react-redux';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import { Meta } from './DataSheetSections';
import { sectionStyles } from '../guideStyles';
import { GuideLink } from '../Links';

const meta = {
  required: true,
  type: 'Preset option',
  example: 'Fluorometer'
};

const Content = () => {
  const cl = sectionStyles();
  const sensors = useSelector ((state) => state.dataSubmissionSelectOptions && state.dataSubmissionSelectOptions.Sensor);
  return (
    <div className={cl.container}>
      <Meta meta={meta} />
      <Typography>
        This is a required field that refers to the instrument used to produce the measurements such as CTD, fluorometer, flow cytometer, sediment trap, etc.
If your dataset is the output of a numerical model use the term “simulation”, and if it is the output of a combination of model and observation use the term “blend”.
         This field will significantly help to find and categorize data generated using a similar class of instruments.  <code>var_sensor</code> will be visible in the Simons CMAP catalog. This field is populated via a dropdown menu. If a value you would like to use is missing from the dropdown menu please contact us at <GuideLink href="mailto:simonscmap@uw.edu">simonscmap@uw.edu</GuideLink> to request that it be added.
      </Typography>
      <div className={cl.subHeader}>Sensor List</div>
      <div className={cl.sensorList}>
        {Array.isArray(sensors) && sensors.map((o, i) =>
          (<div key={`${i}`}>{o}</div>) )}
      </div>
    </div>
  );
};

export default Content;
