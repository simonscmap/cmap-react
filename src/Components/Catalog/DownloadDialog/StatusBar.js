import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InfoIcon from '@material-ui/icons/Info';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Link from '@material-ui/core/Link';

const useStyles = makeStyles({
  root: {
    marginTop: '.75em',
    marginLeft: '40px', // match Dialog Title Root
    marginRight: '40px'
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoHandle: {
    cursor: 'pointer',
  },
  infoBox: {
    margin: '1em 0'
  }
});

const StatusBar = (props) => {
  const classes = useStyles();
  const { message } = props;

  let [infoState, setInfoState] = useState(false);

  return (
    <div className={classes.root}>
      <div className={classes.container}>
    <div>
    <Typography variant="body1" component="p">{message}</Typography>

    </div>
        {!infoState && <div className={classes.infoHandle} onClick={() => setInfoState(true)}>
          <Tooltip title="Download Size Validation Info">
            <InfoIcon color='primary' />
          </Tooltip>
        </div>}
      </div>
      {infoState && (<div className={classes.infoBox}>
        <Card>
          <CardContent>
            <Typography variant="body2" component="p">
              Some datasets are very large. Download requests are checked to ensure the estimated size is less than ~2 million rows. If the download is disabled due to size, try configuring a subset with parameters that decrease the overall size of the download.
            </Typography>
            <Link onClick={() => setInfoState(false)} style={{ cursor: 'pointer' }}>
              <Typography variant="body2">
                Close
              </Typography>
            </Link>
          </CardContent>
        </Card>
      </div>)}
    </div>
  );
}

export default StatusBar;
