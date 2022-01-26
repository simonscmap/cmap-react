import React, { useState } from 'react';
import { withStyles, Link } from '@material-ui/core';
import ResizeObserver from 'react-resize-observer';
import Drawer from '@material-ui/core/Drawer';
import docLinks from './doc-links';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Fab from '@material-ui/core/Fab';

let drawerWidth = 240;

let styles = (theme) => ({
  docsWrapper: {
    margin: '80px 0 0 0',
    color: 'white',
  },
  link: {
    display: 'inline-block',
  },
  bookmarkOpen: {
    position: 'absolute',
    top: '90px',
    left: '0',
    zIndex: 99999,
  },
  bookmarkClosed: {
    position: 'absolute',
    visibility: 'hidden',
  },

  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: '#1F4A63',
  },

  drawerHeader: {
    display: 'flex',
    margin: '180px 0 0 0',
    padding: '1em',
    alignItems: 'start',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
});

const Docs = (props) => {
  let { classes } = props;
  let [innerAccordionWidth, setInnerAccordionWidth] = useState(
    window.innerWidth,
  );

  const [open, setOpen] = React.useState(false);
  const [pkgTarget, setPkgTarget] = useState('py');

  let onResize = (rect) => {
    let { width } = rect;
    setInnerAccordionWidth(width - 20);
  };

  let handleToggleDrawer = () => {
    setOpen(!open);
  }

  let handleDrawerOpen = () => {
    setOpen(true);
  };
  let handleDrawerClose = () => {
    setOpen(false);
  };
  let setPackage = (target) => {
    return () => {
      setPkgTarget(target);
      handleDrawerClose();
    };
  };
  return (
    <div className={classes.docsWrapper}>
      <ResizeObserver onResize={onResize}></ResizeObserver>

      <div className={ classes.bookmarkOpen}>
    <Fab color="primary" onClick={handleToggleDrawer}>
      { open ? <ChevronRightIcon />: <ChevronLeftIcon />}
        </Fab>
      </div>

      <Drawer
        className={classes.drawer}
        open={open}
        variant="persistent"
        anchor="left"
        classes={{ paper: classes.drawerPaper }}
      >
        <div className={classes.drawerHeader}>
          <br />
          <Link href="#" onClick={setPackage('py')} className={classes.link}>
            Python
          </Link>

          <br />
          <Link href="#" onClick={setPackage('r')} className={classes.link}>
            R
          </Link>

          <br />
          <Link href="#" onClick={setPackage('julia')} className={classes.link}>
            Julia
          </Link>

          <br />
          <Link
            href="#"
            onClick={setPackage('matlab')}
            className={classes.link}
          >
            Matlab
          </Link>
        </div>
      </Drawer>
      <iframe
        id="python"
        title="CMAP Read the Docs: Python"
        width={innerAccordionWidth}
        height={window.innerHeight - 80}
        src={docLinks[pkgTarget]}
      ></iframe>
    </div>
  );
};

export default withStyles(styles)(Docs);
