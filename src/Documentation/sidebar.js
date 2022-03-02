import React, { useState } from 'react';
import { withStyles, Link, Button } from '@material-ui/core';
import ResizeObserver from 'react-resize-observer';
import Drawer from '@material-ui/core/Drawer';
import docLinks from './doc-links';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
let drawerWidth = 240;

let styles = (theme) => ({
  docsWrapper: {
    margin: `80px 0 0 ${theme.spacing(7) + 1}px`,
    color: 'white',
    textAlign: 'left',
  },
  link: {
    fontSize: '1.5em',
  },
  bookmarkOpen: {
    zIndex: 8000,
    cursor: 'pointer',
    display: 'flex',
    alignContent: 'center',
    margin: '80px auto 0 auto',
  },
  bookmarkClosed: {
    position: 'absolute',
    visibility: 'hidden',
  },
  drawerOpen: {
    backgroundColor: '#1F4A63',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    backgroundColor: '#1F4A63',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },

  drawerHeader: {
    display: 'flex',
    margin: '1em 0 0 0',
    alignItems: 'start',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
  treeRoot: {
    height: 240,
    flexGrow: 1,
    maxWidth: 400,
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

const pythonTree = {
  id: 'root',
  name: 'Python Package',
  children: [
    {
      id: '1',
      name: 'Installation',
      link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/pycmap_install.html',
    },
    {
      id: '2',
      name: 'Data Retrieval',
      children: [
        {
          id: '4',
          name: 'API',
          link: '',
        },
        {
          id: '5',
          name: 'Query',
          link: '',
        }
      ],
    },
    {
      id: '3',
      name: 'Data Visualization',
      children: [

      ],
    }
  ],
};
const Docs = (props) => {
  let { classes } = props;
  let [innerAccordionWidth, setInnerAccordionWidth] = useState(
    window.innerWidth,
  );

  const [open, setOpen] = React.useState(true);
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

  let handlePySelect = (event, nodes) => {
    console.log(`select ${event.target} [ ${nodes} ]`);
  };

  let handlePyToggle = (e, v) => {
    console.log(e, v);
  };

  let handlePyClick = (node) => {
    console.log('click', node.id, node.name);
  }

  const renderTree = (nodes) => {
    return (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name} onClick={() => handlePyClick(nodes)}>
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
    );
  }

  return (
    <div className={classes.docsWrapper}>
      <ResizeObserver onResize={onResize}></ResizeObserver>

      <Drawer
        open={open}
        variant="permanent"
        anchor="left"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        <div className={classes.bookmarkOpen} onClick={handleToggleDrawer}>
          {open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </div>

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
                onNodeSelect={handlePySelect}
                onNodeToggle={handlePyToggle}
              >
                {renderTree(pythonTree)}
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
