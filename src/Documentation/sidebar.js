import React, { useState } from 'react';
import { withStyles, Link } from '@material-ui/core';
import ResizeObserver from 'react-resize-observer';
import Drawer from '@material-ui/core/Drawer';
import docLinks from './doc-links';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Fab from '@material-ui/core/Fab';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';

let drawerWidth = 240;

let styles = (theme) => ({
  docsWrapper: {
    margin: '80px 0 0 0',
    color: 'white',
  },
  link: {
    fontSize: '1.5em',
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
    alignItems: 'start',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
  treeRoot: {
    height: 240,
    flexGrow: 1,
    maxWidth: 400,
  },
  treeRoot: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
});

const Accordion = withStyles({
  root: {
    border: '0 1px solid rgba(0, 0, 0, .125)',
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
    backgroundColor: 'rgba(0, 0, 0, .03)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    width: '240px',
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
  },
  content: {
    '&$expanded': {
      // margin: '12px 0',
    },
  },
  expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiAccordionDetails);

const data = {
  id: 'root',
  name: 'Parent',
  children: [
    {
      id: '1',
      name: 'Child - 1',
    },
    {
      id: '3',
      name: 'Child - 3',
      children: [
        {
          id: '4',
          name: 'Child - 4',
        },
      ],
    },
  ],
};
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
  };

  let handleDrawerOpen = () => {
    setOpen(true);
  };

  let handleDrawerClose = () => {
    setOpen(false);
  };

  let setPackage = (target) => {
    return () => {
      setPkgTarget(target);
    };
  };

  let accordionChange = () => {};

  const renderTree = (nodes) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  );

  return (
    <div className={classes.docsWrapper}>
      <ResizeObserver onResize={onResize}></ResizeObserver>

      <div className={classes.bookmarkOpen}>
        <Fab color="primary" onClick={handleToggleDrawer}>
          {open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
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
          <Accordion
            square
            expanded={pkgTarget === 'py'}
            onChange={accordionChange}
          >
            <AccordionSummary onClick={setPackage('py')} aria-controls="" id="">
              <Link href="#" className={classes.link}>
                Python
              </Link>
            </AccordionSummary>
            <AccordionDetails>
              <TreeView
                className={classes.root}
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpanded={['root']}
                defaultExpandIcon={<ChevronRightIcon />}
              >
                {renderTree(data)}
              </TreeView>
            </AccordionDetails>
          </Accordion>

          <Accordion
            square
            expanded={pkgTarget === 'r'}
            onChange={accordionChange}
          >
            <AccordionSummary onClick={setPackage('r')} aria-controls="" id="">
              <Link href="#" onClick={setPackage('r')} className={classes.link}>
                R
              </Link>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>R tree</Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion
            square
            expanded={pkgTarget === 'julia'}
            onChange={accordionChange}
          >
            <AccordionSummary
              onClick={setPackage('julia')}
              aria-controls=""
              id=""
            >
              <Link href="#" className={classes.link}>
                Julia
              </Link>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Julia tree</Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion
            square
            expanded={pkgTarget === 'matlab'}
            onChange={accordionChange}
          >
            <AccordionSummary
              onClick={setPackage('matlab')}
              aria-controls=""
              id=""
            >
              <Link href="#" className={classes.link}>
                Matlab
              </Link>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Matlab tree</Typography>
            </AccordionDetails>
          </Accordion>
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
