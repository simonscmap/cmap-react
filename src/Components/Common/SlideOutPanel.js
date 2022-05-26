import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Typography } from '@material-ui/core';
import Z from '../../enums/zIndex';
import Link from '@material-ui/core/Link';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles(() => ({
  drawer: {
    width: '900px',
    '@media (max-width:1000px)': {
      width: '800px',
    },
    '@media (max-width:700px)': {
      width: '500px',
    },
  },
  drawerPaper: {
    width: '900px',
    '@media (max-width:1000px)': {
      width: '800px',
    },
    '@media (max-width:700px)': {
      width: '500px',
    },
    zIndex: Z.SLIDE_OUT_PANEL,
  },
  innerWrapper: {
    padding: '2em',
  },
  title: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  close: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignContent: 'baseline',
    '& button': {
      color: 'white',
    },
  },
}));

const SidelOutPanel = (props) => {
  let { open, children, handleClose, title } = props;
  const classes = useStyles();

  return (
    <div>
      <CssBaseline />
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="right"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.innerWrapper}>
          <div className={classes.title}>
            <Typography variant="h6">{title}</Typography>
            <div className={classes.close}>
              <Link component="button" variant="body2" onClick={handleClose}>
                Close
              </Link>
              <CloseIcon />
            </div>
          </div>
          {children}
        </div>
      </Drawer>
    </div>
  );
};

export default SidelOutPanel;
