import React, { useState } from 'react';
import { Paper } from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { MdMyLocation } from 'react-icons/md';
import { useSelector, useDispatch } from 'react-redux';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import palette from 'google-palette';
// import { cruiseTrajectoryZoomTo } from '../../../../Redux/actions/visualization';
import colors from '../../../../enums/colors';

const useStyles = makeStyles((theme) => ({
  legend: {
    position: 'absolute',
    width: '300px',
    top: '20px',
    left: '20px',
    color: 'white',
    '& h6': { }
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    alignItems: 'flex-start',
    '& .MuiPaper-root': {
      backgroundColor: 'transparent'
    },
  },
  paper: {
    border: '1px solid black',
    backdropFilter: 'blur(5px)',
    width: '100%',
  },
  legendEntry: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1em',
    width: '100%',
    margin: '.3em 0'
  },
  swatch: {
    height: '1em',
    width: '1em',
    textAlign: 'center',
    borderRadius: '.5em',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'start',
    justifyContent: 'flex-start',
    gap: '.5em',
    '& a': {
      color: 'white',
    },
    '& p': {
      margin: 0,
    },
    '& > div': {
      margin: 0,
    }
  },
  zoomIcon: {
    color: colors.primary,
    '& svg': {
      fontSize: '1.1em',
      marginBottom: '-3px'
    }
  },
  openPageIcon: {
    color: colors.primary,
    '& svg': {
      marginBottom: '-4px',
      marginLeft: '5px',
      fontSize: '1.1em',
      cursor: 'pointer',
    }
  },
  nick: {
    fontSize: '.9em'
  }
}));


// Accordion

const Accordion = withStyles({
  root: {
    // border: '1px solid rgba(0, 0, 0, .125)',
    backgroundColor: 'none',
    '&:hover': {
      backgroundColor: '1px solid rgba(0, 0, 0, .125)',
      backdropFilter: 'blur(5px)',
    },
    width: '100%',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      // margin: 'auto',
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles({
  root: {
    // backgroundColor: 'rgba(0, 0, 0, .03)',
    // borderBottom: '1px solid rgba(0, 0, 0, .125)',
    // marginBottom: -1,
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
    width: '100%',
    padding: '0 10px'
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: '2px 10px 5px 15px',
  },
}))(MuiAccordionDetails);

const Legend = (props) => {
  const { cruiseSelector, onFocus } = props;
  const classes = useStyles();
  // const dispatch = useDispatch();

  const cruises = useSelector (cruiseSelector);

  console.log ('Legend', { cruises });


  const colors = palette('rainbow', cruises.length).map((hex) => `#${hex}`);

  const [expanded, setExpanded] = useState (null);
  const handleFocus = (cruiseId) => () => {
    console.log ('on Focus', cruiseId)
    if (cruiseId !== expanded) {
      setExpanded (cruiseId);
    } else {
      setExpanded (null);
    }
    // onFocus (cruiseId);
    // dispatch (cruiseTrajectoryZoomTo (cruiseId));
  }

  return (
    <div className={classes.legend}>
      <Paper className={classes.paper}>
        <div className={classes.wrapper}>
          {cruises.map((cruise, i) => (
            <Accordion square expanded={cruise.ID === expanded} onClick={handleFocus(cruise.ID)}>
              <AccordionSummary id={`${cruise.ID}control`}>
                <div className={classes.legendEntry} key={`chip-wrapper${i}`}>
                  <div className={classes.container}>
                    <div
                      className={classes.swatch}
                      style={{ backgroundColor: colors[i] }}
                    >
                    </div>
                    <div className={classes.container}>
                      <span>{cruise.Name}</span> <span className={classes.nick}>({cruise.Nickname})</span>
                    </div>
                  </div>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <div className={classes.container}>
                  <a href={`/catalog/cruises/${cruise.Name}`} target="_blank" rel="noreferrer">
                    <p className={classes.openPageIcon}>
                      <span>{cruise.Nickname}</span>
                      <OpenInNewIcon color="primary" />
                    </p>
                  </a>
                </div>
            <div className={classes.container}>
            <div>
                   <p>Chief: {cruise.Chief_Name}</p>
                   <p>Ship: {cruise.Ship_Name}</p>
                   <p>Start: {cruise.Start_Time}</p>
                   <p>End: {cruise.End_Time}</p>
            </div>
                </div>
              </AccordionDetails>
            </Accordion>
          ))}
          {(!Array.isArray(cruises) || cruises.length === 0) && <Typography>No Trajectories</Typography>}
        </div>
      </Paper>
    </div>
  );
}

export default Legend;
