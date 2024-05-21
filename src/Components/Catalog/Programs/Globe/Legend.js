import React, { useState } from 'react';
import { Paper } from '@material-ui/core';
import Button from '@material-ui/core/Button';

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
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import dayjs from 'dayjs';
import colors from '../../../../enums/colors';


const toDate = (str) => {
  return dayjs (str).format('YYYY-MM-DD');
}
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
    width: 'calc(100% - 15px)',
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

const SmallButton = withStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: '15px',
    boxSizing: 'border-box',
    // height: '15px',
    fontSize: '11px',
    fontWeight: 200,
    fontFamily: ['Montserrat', 'sans-serif'].join(','),
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    lineHeight: 'unset',
    '& span': {
      whiteSpace: 'nowrap',
    },
    '& div': {
      padding: '0 4px'
    }
  },
}))(Button);

const useDetailStyles = makeStyles ((theme) => ({
  'root': {
    marginLeft: '5px',
    '& .MuiTableCell-root': {
      border: 0,
      padding: '5px 0',
    }
  }
}));

const CruiseDetails = (props) => {
  const { cruise } = props;
  const cl = useDetailStyles();
  return (
    <Table className={cl.root} aria-label="simple table">
      <TableBody>
        <TableRow key={'chief'}>
          <TableCell component="th" scope="row">
            {'Chief'}
          </TableCell>
          <TableCell align="left">
            {cruise.Chief_Name}
          </TableCell>
        </TableRow>

        <TableRow key={'ship'}>
          <TableCell component="th" scope="row">
            {'Ship'}
          </TableCell>
          <TableCell align="left">
            {cruise.Ship_Name}
          </TableCell>
        </TableRow>

        <TableRow key={'Start'}>
          <TableCell component="th" scope="row">
            {'Start'}
          </TableCell>
          <TableCell align="left">
            {toDate(cruise.Start_Time)}
          </TableCell>
        </TableRow>

        <TableRow key={'end'}>
          <TableCell component="th" scope="row">
            {'End'}
          </TableCell>
          <TableCell align="left">
            {toDate(cruise.End_Time)}
          </TableCell>
        </TableRow>

      </TableBody>
     </Table>

  );
}

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
    } else {
      setExpanded (null);
    }
  }

  const handleZoom = (cruiseId) => () => {
    if (!cruiseId) {
      console.log ('no cruise id', cruiseId)
    } else {
      onFocus (cruiseId);
    }
  }

  return (
    <div className={classes.legend}>
      <Paper className={classes.paper}>
        <div className={classes.wrapper}>
          {cruises.map((cruise, i) => (
            <Accordion square expanded={cruise.ID === expanded} >
              <AccordionSummary id={`${cruise.ID}control`} expandIcon={<ExpandMoreIcon />} onClick={handleFocus(cruise.ID)} >
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
                <div className={classes.detailsContainer}>
                  <div className={classes.zoomIcon}>
                    <SmallButton>
                      <div>
                        <span>{'Go to trajectory'}</span>
                        <MdMyLocation color={colors.primary} onClick={handleZoom(cruise.ID)} />
                      </div>
                    </SmallButton>
                  </div>
                  <CruiseDetails cruise={cruise} />
                  <a href={`/catalog/cruises/${cruise.Name}`} target="_blank" rel="noreferrer">
                    <p className={classes.openPageIcon}>
                      <span>{'View cruise details'}</span>
                      <OpenInNewIcon color="primary" />
                    </p>
                  </a>
                </div>
              </AccordionDetails>
            </Accordion>
          ))}
          {(!Array.isArray(cruises) || cruises.length === 0) && <Typography>Waiting for Trajectory Data</Typography>}
        </div>
      </Paper>
    </div>
  );
}

export default Legend;
