import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import Page2 from '../../Common/Page2';
import { Grid } from '@material-ui/core';
import Title from '../../Common/Title';
// import Typography from '@material-ui/core/Typography';
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

    // const y = useSelector (selectProgramDetailsRequestStatus);

  return (
     <Page2 bgVariant={'slate2'}>
      <Grid container spacing="3" className={cl.container}>
        <Grid item xs="12">
          <Title text={programName} />
        </Grid>
        <Grid item xs="6">
          <Globe />
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
