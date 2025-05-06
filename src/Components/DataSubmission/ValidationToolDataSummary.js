import React from 'react';

import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  statusArea: {
    color: 'white',
  },
  overview: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: '1em',
    alignItems: 'center',
    '& span': {
      display: 'inline-block',
      width: '125px',
      fontSize: '.9em',
    },
    '& p': {
      margin: 0,
      fontSize: '1em',
    },
  },
}));

const DataSummary = (props) => {
  const cl = useStyles();
  const { step, summary } = props;

  if (step < 1) {
    return <React.Fragment />;
  }
  return (
    <div className={cl.statusArea}>
      <Typography variant="h6">Data Summary</Typography>
      <div>
        <div className={cl.overview}>
          <span>{'short_name'}:</span>
          <Typography variant="body2">{summary.shortName}</Typography>
        </div>
        <div className={cl.overview}>
          <span>{'long_name'}:</span>
          <Typography variant="body2">{summary.longName}</Typography>
        </div>
        <div className={cl.overview}>
          <span>{'user variables'}:</span>
          <Typography variant="body2">{summary.vars}</Typography>
        </div>
        <div className={cl.overview}>
          <span>{'data columns'}:</span>
          <Typography variant="body2">{summary.cols}</Typography>
        </div>
        <div className={cl.overview}>
          <span>{'data rows'}:</span>
          <Typography variant="body2">{summary.rows}</Typography>
        </div>
      </div>
    </div>
  );
};

export default DataSummary;
