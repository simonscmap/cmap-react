import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { useSelector } from 'react-redux';
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

const isAsyncState = (s) => Boolean(states[s]);

// :: [Dep] -> [overallState, allStatuses];
const useAsyncDeps = (deps) => {
  const [s, setS] = useState([notTried]);

  const statuses = useSelector((state) => {
    return deps.map((fn) => fn.call(null, state));
  })
    .filter(isAsyncState)
    .sort(sortAsyncStates);

  useEffect(() => {
    if (statuses.length && s.length && statuses[0] !== s[0]) {
      setS(statuses);
    }
  }, [statuses]);

  if (s.length === 0) {
    return [notTried, []];
  } else {
    return [s[0], s];
  }
};

// ~~~~~~~~~~ HEADER ~~~~~~~~~~~
const useHeaderStyles = makeStyles((theme) => ({
  sectionHeader: {
    color: 'white',
    margin: '16px 0 16px 0',
  },
}));

export const SectionHeader = (props) => {
  const cl = useHeaderStyles();
  const { title } = props;
  if (title) {
    return (
      <Typography variant="h6" className={cl.sectionHeader}>
        {title}
      </Typography>
    );
  } else {
    return <React.Fragment />;
  }
};

// ~~~~~~~~~~ Spinner ~~~~~~~~~~~
const useStyles = makeStyles(() => ({
  spinnerWrapper: {
    textAlign: 'center',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  container: {
    height: '100%',
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
    description,
    deps, // array of selector functions that point to state enums
    children,
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
  } else if ([inProgress, streaming, processing].includes(overallStatus)) {
    content = <SpinnerWrapper message={'Loading...'} />;
  } else {
    content = children;
  }

  return (
    <Grid container className={cl.container}>
      <Grid item xs={12}>
        <SectionHeader title={title} />
      </Grid>
      {description && (
        <Grid item xs={12}>
          {description}
        </Grid>
      )}
      <Grid item xs={12}>
        {content}
      </Grid>
    </Grid>
  );
};

export default Proto;
