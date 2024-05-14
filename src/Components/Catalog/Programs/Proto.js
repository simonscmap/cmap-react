import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
// import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import states from '../../../enums/asyncRequestStates';
import Spinner from '../../UI/Spinner';

const {
  notTried,
  inProgress,
  streaming,
  processing,
  failed,
  succeeded,
  expired,
} = states;

// prioritize states, where failures are higher priority than successes
const sortAsyncStates = (a, b) => {
  const enumMap = {};
  enumMap[notTried] = 0;
  enumMap[failed] = 1;
  enumMap[expired] = 2;
  enumMap[inProgress] = 3;
  enumMap[streaming] = 4;
  enumMap[processing] = 5;
  enumMap[succeeded] = 6;

  if (enumMap[a] < enumMap[b]) {
    return -1;
  } else if (enumMap[a] === enumMap[b]) {
    return 0;
  } else {
    return 1;
  }
};

// :: [Dep] -> [overallState, allStatuses];
const useAsyncDeps = (deps) => {
  const isAsyncState = (s) => Boolean(states[s]);
  const statuses = deps
    .map ((selector) => useSelector (selector))
    .filter (isAsyncState)
    .sort (sortAsyncStates);

  if (statuses.length === 0) {
    return [failed, []];
  } else {
    return [statuses[0], statuses];
  }
};


// ~~~~~~~~~~ HEADER ~~~~~~~~~~~
const useHeaderStyles = makeStyles ((theme) => ({
  sectionHeader: {
    color: 'white',
    margin: '16px 0 16px 0',
    fontWeight: 100,
    fontFamily: '"roboto", Serif',
  },

}));

const SectionHeader = (props) => {
  const cl = useHeaderStyles ()
  const { title } = props;
  if (title) {
    return (
      <Typography variant="h5" className={cl.sectionHeader}>
      {title}
      </Typography>
    );
  } else {
    return <React.Fragment />
  }
}

// ~~~~~~~~~~ Spinner ~~~~~~~~~~~
const useStyles = makeStyles (() => ({
  spinnerWrapper: {
    textAlign: 'center',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
}));


const SpinnerWrapper = (props) => {
  const { message } = props;
  const cl = useStyles();
  return (
    <div className={cl.spinnerWrapper}>
      <Spinner message={message} />
    </div>
  );
};

// ~~~~~~~~~~ Main Proto Component ~~~~~~~~~~~
const Proto = (props) => {
  const {
    title,
    deps, // array of selector functions that point to state enums
    children
  } = props;

  const cl = useStyles();
  const [overallStatus] = useAsyncDeps(deps);

  let content = '';

  if (overallStatus === notTried) {
    content = (
      <Typography variant="body1">Preparing to fetch data...</Typography>
    );
  } else if (overallStatus === failed || overallStatus === expired) {
    content = (
      <Typography variant="body1">Data is unavailable at this time.</Typography>
    );
  } else if ([inProgress, streaming, processing].includes (overallStatus)) {
    content = <SpinnerWrapper message={'Loading...'}/>
  } else {
    content = children;
  }

  return (
    <div>
      <Grid container className={cl.container}>
        <Grid item xs="12">
          <SectionHeader title={title} />
        </Grid>
        <Grid item xs="12">
          {content}
        </Grid>
      </Grid>
    </div>
  );

};

export default Proto;
