import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../Home/theme';
import { CiCalendar } from "react-icons/ci";


const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContetn: 'center',
  },
  labelSet: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    gap: '.5em',
  },
  label: {
    color: theme.palette.secondary.light,
  },
  val: {
    color: theme.palette.primary.light,
    fontFamily: 'mono',
  },
  icon: {
    textAlign: 'center',
    fontSize: '3em'
  }

}));

const TemporalCoverage = (props) => {
  const cl = useStyles();
  const { dataset } = props;
  if (!dataset) {
    return '';
  }

  const { Time_Min, Time_Max } = dataset;

  if (typeof Time_Min !== 'string' || typeof Time_Max !== 'string') {
    return '';
  }

  const min = Time_Min.slice(0, 10);
  const max = Time_Max.slice(0, 10);

  return (
    <div className={cl.container}>
      <div className={cl.labelSet}>
        <div className={cl.label}>Start</div>
        <div className={cl.val}>{min}</div>
      </div>
      <div className={cl.icon}><CiCalendar color={colors.blue.teal} /></div>
      <div className={cl.labelSet}>
        <div className={cl.label}>End</div>
        <div className={cl.val}>{max}</div>
      </div>
    </div>
  );
}

export default TemporalCoverage;
