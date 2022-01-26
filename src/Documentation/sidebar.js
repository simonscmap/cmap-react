import React, { useState } from 'react';
import { withStyles } from '@material-ui/core';
import ResizeObserver from 'react-resize-observer';
import Drawer from '@material-ui/core/Drawer';
import docLinks from './doc-links';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

let styles = (theme) => ({
  docsWrapper: {
    margin: '80px 0 0 0',
    color: 'white',
  },
  drawerHeader: {
    margin: '80px 0 0 0',
  },
  bookmarkOpen: {
    position: 'absolute',
    top: '70px',
    left: '0',
    zIndex: 99999,
  },
  bookmarkClosed: {
    visibility: 'hidden',
  }
});

const Docs = (props) => {
  let { classes } = props;
  let [innerAccordionWidth, setInnerAccordionWidth] = useState(
    window.innerWidth,
  );

  const [open, setOpen] = React.useState(false);

  let onResize = (rect) => {
    let { width } = rect;
    setInnerAccordionWidth(width - 20);
  };

  let handleDrawerOpen = () => {
    setOpen(true);
  }
  let handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.docsWrapper}>
      <ResizeObserver onResize={onResize}></ResizeObserver>
      <div className={open ? classes.bookmarkClosed : classes.bookmarkOpen}>
        <IconButton onClick={handleDrawerOpen}>
          <ChevronLeftIcon />
        </IconButton>
      </div>
      <Drawer
        className={classes.drawer}
        open={open}
        variant="persistent"
        anchor="left"
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
          <span>Menu</span>
          <a>link</a>
        </div>
      </Drawer>
      <iframe
        id="python"
        title="CMAP Read the Docs: Python"
        width={innerAccordionWidth}
        height={window.innerHeight - 80}
        src={docLinks.py}
      ></iframe>
    </div>
  );
};

export default withStyles(styles)(Docs);
