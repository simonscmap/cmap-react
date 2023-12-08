import React, { useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { useSelector, useDispatch } from 'react-redux';
import { highlightsRequestSend } from '../../Redux/actions/highlights';
import { colors } from './theme';
import { FaDatabase, FaCalendarDay } from 'react-icons/fa';
import { IoLayersSharp } from 'react-icons/io5';
import {GiFishingBoat} from 'react-icons/gi';
import { FaBacteria} from 'react-icons/fa';
import { MdSatelliteAlt } from 'react-icons/md';
import { Tooltip } from '@material-ui/core';

const useStatStyles = makeStyles({
  stat: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignContent: 'baseline',
    alignItems: 'baseline',
    gap: '0.5em',
    margin: '.5em 0',
    whiteSpace: 'nowrap',
    fontSize: '1em',
    '& span': {
      fontSize: '1.1em',
    },
    '& span:nth-child(3)': { // first span is svg, second the title
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }
  },
  icon: {
    color: colors.green.lime,
    // marginRight: '10px'
  },
  bigger: {
    color: colors.green.lime,
    fontSize: '1.4em',
    marginRight: '2px',
  },
  tooltip: {
  }
});

const Stat = ({ children, tooltip }) => {
  const classes = useStatStyles();
  return (
      <Tooltip title={tooltip} className={classes.tooltip}>
        <div className={classes.stat}>
          {children}
        </div>
      </Tooltip>
  );
}

const RI = ({children, cln = 'icon'}) => {
  const classes = useStatStyles();
  return (
    <span className={classes[cln]}>{children}</span>
  );
}

const DataSize = () => {
  return (
    <Stat tooltip="Total Database Size (TB)">
      <RI><FaDatabase /></RI>
      <Typography variant="body1" component="span">Size</Typography>
      <Typography variant="h2" component="span">~150 TB</Typography>
    </Stat>
  );
}

const TemporalCoverage = () => {
  const home = useSelector ((state) => state.home);
  const val = home && home.highlights && home.highlights.temporalCoverage;
  const dispatch = useDispatch();

  useEffect(() => {
    if (!val) {
      dispatch(highlightsRequestSend ('temporalCoverage'));
    }
  }, []);

  if (!val) {
    return ('');
  }
  return (
    <Stat tooltip="Maximum Temporal Coverage of CMAP Data">
      <RI><FaCalendarDay /></RI>
      <Typography variant="body1" component="span">Coverage</Typography>
      <Typography variant="h2" component="span">{val} Years</Typography>
    </Stat>
  );
}

const VariableCount = () => {
  const home = useSelector ((state) => state.home);
  const val = home && home.highlights && home.highlights.variableCount;
  const dispatch = useDispatch();

  useEffect(() => {
    if (!val) {
      dispatch(highlightsRequestSend ('variableCount'));
    }
  }, []);

  if (!val) {
    return ('');
  }

  return (
    <Stat tooltip="Number of Variables">
      <RI cln='bigger'><IoLayersSharp /></RI>
      <Typography variant="body1" component="span">Variables</Typography>
      <Typography variant="h2" component="span"> {val.toLocaleString()} </Typography>
    </Stat>
  );
};

const CruiseCount = () => {
  const home = useSelector ((state) => state.home);
  const val = home && home.highlights && home.highlights.cruiseCount;
  const dispatch = useDispatch();

  useEffect(() => {
    if (!val) {
      dispatch(highlightsRequestSend ('cruiseCount'));
    }
  }, []);

  if (!val) {
    return ('');
  }
  return (
    <Stat tooltip="Number of Cruise Expeditions">
    <RI cln="bigger"><GiFishingBoat/></RI>
      <Typography variant="body1" component="span">Expeditions</Typography>
      <Typography variant="h2" component="span"> {val.toLocaleString()} </Typography>
    </Stat>
  );
};

const SatelliteCount = () => {
  const home = useSelector ((state) => state.home);
  const val = home && home.highlights && home.highlights.satelliteCount;
  const dispatch = useDispatch();

  useEffect(() => {
    if (!val) {
      dispatch(highlightsRequestSend ('satelliteCount'));
    }
  }, []);

  if (!val) {
    return ('');
  }
  return (
    <Stat tooltip="Number of Satellite Datasets">
      <RI cln='bigger'><MdSatelliteAlt /></RI>
      <Typography variant="body1" component="span">Satellites</Typography>
      <Typography variant="h2" component="span"> {val.toLocaleString()} </Typography>
    </Stat>
  );
};

const OrganismCount = () => {
  const home = useSelector ((state) => state.home);
  const val = home && home.highlights && home.highlights.organismCount;
  const dispatch = useDispatch();

  useEffect(() => {
    if (!val) {
      dispatch(highlightsRequestSend ('organismCount'));
    }
  }, []);

  if (!val) {
    return ('');
  }
  return (
    <Stat tooltip="Number of Distinct Marine Microbial Organisms with Direct Observations in CMAP">
      <RI cln="bigger"><FaBacteria /></RI>
      <Typography variant="body1" component="span">Organisms</Typography>
      <Typography variant="h2" component="span"> {val.toLocaleString()} </Typography>
    </Stat>
  );
};


const useStyles = makeStyles({
  container: {
    margin: '1em 0em 2em 1em',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: 'calc(100% - 1em)',
    '& h2': {
      marginBottom: '1em'
    }
  }
});

const Summary = () => {
  let classes = useStyles();
  return (
    <div className={classes.container}>
      <Typography variant="h2">CMAP at a Glance</Typography>
      <Grid container>
        <Grid container item xs={12} sm={6} md={12} lg={6}>
          <Grid item xs={12}><DataSize /></Grid>
          <Grid item xs={12}><VariableCount /></Grid>
          <Grid item xs={12}><SatelliteCount /></Grid>
        </Grid>
        <Grid container item xs={12} sm={6} md={12} lg={6}>
          <Grid item xs={12}><TemporalCoverage /></Grid>
          <Grid item xs={12}><OrganismCount /></Grid>
          <Grid item xs={12}><CruiseCount /></Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default Summary;
