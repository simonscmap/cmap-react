import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { formatDate } from './lib';

const DateDetail = withStyles({
  data: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'baseline',
    gap: '15px',
    '& > p': {
      color: 'rgba(255,255,255,0.5)',
      fontWeight: 500,
    },
  },
  date: {
    width: '190px',
  },
  time: {
    width: '108px',
  },
  label: {
    width: '65px',
    '& p': { color: 'rgba(255,255,255,0.5)', fontWeight: 500 },
  },
})(({ date, label, classes }) => {
  if (!date) {
    return '';
  }
  let dateObject = new Date(date);
  // date and time strings
  let [d, t] = formatDate(dateObject);
  return (
    <div className={classes.data}>
      <div className={classes.label}>
        <Typography variant="body2">{label}</Typography>
      </div>
      <div className={classes.date}>
        <Typography variant="h5">{d}</Typography>
      </div>
      <Typography variant="body2">at</Typography>
      <div className={classes.time}>
        <Typography variant="h5">{t}</Typography>
      </div>
    </div>
  );
});

export default DateDetail;
