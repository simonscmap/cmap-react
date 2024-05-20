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
import useLegendStyles from './useLegendStyles';



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
  const classes = useLegendStyles();

  const cruises = useSelector (cruiseSelector);

  const colors = palette('rainbow', cruises.length).map((hex) => `#${hex}`);

  const [expanded, setExpanded] = useState (null);

  const handleFocus = (cruiseId) => () => {
    if (!cruiseId) {
      console.log ('no cruise id', cruiseId)
    } else if (cruiseId !== expanded) {
      setExpanded (cruiseId);
      onFocus (cruiseId);
    } else {
      setExpanded (null);
    }
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
