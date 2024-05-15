import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import { createSelector } from 'reselect';
import Page2 from '../../Common/Page2';
import { Grid } from '@material-ui/core';
import Title from '../../Common/Title';
import Typography from '@material-ui/core/Typography';
// import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import Proto from './Proto';
import DatasetList from './ListDatasets';
import CruiseList from './ListCruises';
import Globe from './Globe/Globe';

import {
  fetchProgramDetailsSend,
} from '../../../Redux/actions/catalog';
const useStyles = makeStyles (() => ({
  container: {
    color: 'white',
    padding: '0 25px'
  }
}));

const ProgramDetail = (props) => {
  const cl = useStyles();
  const programName = props.match.params.programName; // param defined in App.js
  const dispatch = useDispatch();

  useEffect(() => {
    // navigate action
    dispatch (fetchProgramDetailsSend(programName));
    return () => {
      // unload action
    }
  }, []);

  const trajectorySelector = createSelector(
    [ (state) => state.programDetails.cruises ],
    (cruises) => {
      console.log ('createSelector trajSel', cruises)
      if (!cruises) {
        return [];
      } else {
        return Object.keys(cruises).reduce((acc, currKey) => {
          Object.assign(acc, { [currKey]: cruises[currKey] && cruises[currKey].trajectory })
          return acc;
        }, {});
      }
    }
  );

  const cruiseSelector = createSelector(
    [ (state) => state.programDetails.cruises ],
    (cruises) => {
      if (!cruises) {
        return [];
      } else {
        return Object.values(cruises);
      }
    }
  );


  const activeTrajectorySelector = createSelector(
    [ (state) => state.programDetails.cruises ],
    (cruises) => {
      if (!cruises) {
        return [];
      } else {
        return Object.values(cruises)[0].trajectory;
      }
    }
  );




  return (
     <Page2 bgVariant={'slate2'}>
      <Grid container spacing="3" className={cl.container}>
        <Grid item xs="12">
          <Title text={programName} />
        </Grid>
        <Grid item xs="6">
          <Typography>Description of Program</Typography>
        </Grid>
        <Grid item xs="6">
          <Globe
            trajectorySelector={trajectorySelector}
            cruiseSelector={cruiseSelector}
            activeTrajectorySelector={activeTrajectorySelector}
          />
        </Grid>
        <Grid item xs="6">
          <DatasetList />
        </Grid>
        <Grid item xs="6">
          <CruiseList />
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
