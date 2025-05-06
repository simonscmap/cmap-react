import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import { useSelector } from 'react-redux';
import { Meta } from './DataSheetSections';
import { sectionStyles } from '../guideStyles';
import { GuideLink } from '../Links';
import SensorTabs from './SensorTabs';
import { sensors as sensorLookup } from './sensorLookup3';

const meta = {
  required: true,
  type: 'Preset option',
  example: 'Fluorometer',
};

// Helpers

const rankSort = (a, b) => {
  if (a.rank >= b.rank) {
    return -1;
  }
  if (a.rank < b.rank) {
    return 1;
  }
  return 0;
};

const groupBy = (acc, curr) => {
  const { rank } = curr;
  const lastGroup = acc.length && acc[acc.length - 1];
  if (lastGroup && lastGroup.rank === rank) {
    lastGroup.members.push(curr);
  } else {
    acc.push({
      rank: rank,
      label: curr.rankNote,
      members: [curr],
    });
  }
  return acc;
};

const mungeSensors = (sensors) => {
  if (!sensors) {
    return null;
  }
  const template = {
    devices: [],
    methods: [],
    uncat: [],
  };
  const categorized = sensors.reduce((acc, curr) => {
    const full = sensorLookup.find((item) => item.Sensor === curr);
    if (!full) {
      console.log('no match', curr);
      return acc;
    }
    const t = full.sType;
    let target;
    if (t === 'Device') {
      target = acc.devices;
    } else if (t === 'Method') {
      target = acc.methods;
    } else {
      target = acc.uncat;
    }
    target.push(full);
    return acc;
  }, template);

  categorized.devices.sort(rankSort);
  categorized.methods.sort(rankSort);
  categorized.methods.sort(rankSort);

  categorized.devices = categorized.devices.reduce(groupBy, []);
  categorized.methods = categorized.methods.reduce(groupBy, []);
  categorized.uncat = categorized.uncat.reduce(groupBy, []);

  return categorized;
};

// Component: Section Conten for Sensor
const useSensorStyles = makeStyles((theme) => ({
  sensorList: {
    display: 'grid',
    'grid-template-columns': 'repeat(3, 1fr)',
    gridGap: '0',
    padding: '0 20px',
  },
  sensorColumn: {
    minWidth: 0,
    padding: '0 20px',
  },

  contentContainer: {
    padding: 0,
    margin: '0 auto',
    '& > span': {
      color: '#69FFF2',
      fontSize: '1.2em',
      padding: '0 0 10px 0',
      display: 'inline-block',
    },
  },
}));

const Content = () => {
  const cl = sectionStyles();
  const ss = useSensorStyles();

  const sensors = useSelector(
    (state) =>
      state.dataSubmissionSelectOptions &&
      state.dataSubmissionSelectOptions.Sensor,
  );

  const data = mungeSensors(sensors);

  return (
    <div className={cl.container}>
      <Meta meta={meta} />
      <Typography>
        This is a required field that refers to the instrument used to produce
        the measurements such as CTD, fluorometer, flow cytometer, sediment
        trap, etc. If your dataset is the output of a numerical model use the
        term “simulation”, and if it is the output of a combination of model and
        observation use the term “blend”. This field will significantly help to
        find and categorize data generated using a similar class of instruments.{' '}
        <code>var_sensor</code> will be visible in the Simons CMAP catalog. This
        field is populated via a dropdown menu. If a value you would like to use
        is missing from the dropdown menu please contact us at{' '}
        <GuideLink href="mailto:simonscmap@uw.edu">simonscmap@uw.edu</GuideLink>{' '}
        to request that it be added.
      </Typography>
      <div className={cl.subHeader}>Sensors</div>

      <SensorTabs data={data} />
    </div>
  );
};

export default Content;
