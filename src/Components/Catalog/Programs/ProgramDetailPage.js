import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import Page2 from '../../Common/Page2';
import { Grid } from '@material-ui/core';
import Title from '../../Common/Title';
import Typography from '@material-ui/core/Typography';
import { useDispatch } from 'react-redux';
import DatasetList from './ListDatasets';
import CruiseList from './ListCruises';
import Globe from './Globe/Globe';
import { data as programData } from './programData';
import {
  trajectorySelector,
  cruiseSelector,
  activeTrajectorySelector,
} from './programSelectors';

import {
  fetchProgramDetailsSend,
  setProgramCruiseTrajectoryFocus,
} from '../../../Redux/actions/catalog';

const useStyles = makeStyles (() => ({
  container: {
    color: 'white',
    padding: '0 25px'
  },
  blurbContainer: {
    '& img': {
      float: 'left',
    }
  }
}));

const ProgramDetail = (props) => {
  const cl = useStyles();
  const programName = props.match.params.programName; // param defined in App.js
  const pData = programData[programName];
  const dispatch = useDispatch();

  useEffect(() => {
    // navigate action
    dispatch (fetchProgramDetailsSend(programName));
    return () => {
      // unload action
    }
  }, []);

  const onCruiseFocus = (cruiseId) => {
    dispatch (setProgramCruiseTrajectoryFocus({ cruiseId }));
  }

  return (
     <Page2 bgVariant={'slate2'}>
      <Grid container spacing="3" className={cl.container}>
        <Grid item xs="12">
          <Title text={programName} />
        </Grid>
        <Grid item xs="6">
          <Typography variant="h6" className={cl.blurbContainer}>
            {pData && pData.logo && <img src={`/images/${pData.logo}`} />}
            <span> {(pData && pData.blurb) ? pData.blurb : programName}</span>
          </Typography>
        </Grid>
        <Grid item xs="6">
          <Globe
            trajectorySelector={trajectorySelector}
            cruiseSelector={cruiseSelector}
            activeTrajectorySelector={activeTrajectorySelector}
            onCruiseFocus={onCruiseFocus}
            downSampleWarning={true}
          />
        </Grid>
        <Grid item xs="6">
          <DatasetList />
        </Grid>
        <Grid item xs="6">
          {'Sample Visualization'}
        </Grid>
      </Grid>
    </Page2>
  );
};

export default ProgramDetail;

export const programDetailConfig = {
  video: false,
  tour: false,
  hints: false,
  navigationVariant: 'Left',
};
