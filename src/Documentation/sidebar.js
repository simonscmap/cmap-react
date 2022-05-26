import React, { useState } from 'react';
import { withStyles, Link } from '@material-ui/core';
import ResizeObserver from 'react-resize-observer';
import MuiDrawer from '@material-ui/core/Drawer';
import docLinks from './doc-links';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import LaunchIcon from '@material-ui/icons/Launch';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { pythonTree } from './python-tree';
import { rTree } from './r-tree';
import zIndex from '../enums/zIndex';

export const documentationConfig = {
  navigationVariant: 'Left',
};

let drawerWidth = 300;

let styles = (theme) => ({
  docsWrapper: {
    margin: `100px 0 0 ${theme.spacing(7) + 18}px`,
    color: 'white',
    textAlign: 'left',
  },
  link: {
    fontSize: '1.2em',
  },
  externalLink: {
    fontSize: '1.1em',
    // paddingLeft: '1em',
  },
  spacer: {
    zIndex: 8000,
    cursor: 'pointer',
    display: 'flex',
    alignContent: 'center',
    margin: '84px auto 0 auto',
  },
  drawerOpen: {
    backgroundColor: '#1F4A63',
    borderRight: '4px solid #143445',
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
    width: theme.spacing(9) + 1,
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
  treeItem: {
    paddingBottom: '.3em',
  },
  linkContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  warning: {
    fontStyle: 'italic',
  },
});

const Drawer = withStyles({
  root: {
    zIndex: zIndex.DOCS_SIDEBAR,
  },
})(MuiDrawer);

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
    width: `${drawerWidth - 32}px`,
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
    width: '100%',
  },
}))(MuiAccordionDetails);

const Docs = (props) => {
  let { classes } = props;
  let [innerAccordionWidth, setInnerAccordionWidth] = useState(
    window.innerWidth,
  );

  // sidebar open or retracted
  const [open, setOpen] = React.useState(true);

  const [timeoutId, setTimeoutId] = useState(null);

  let drawerLostFocus = (e) => {
    if (open) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      let id = setTimeout(setOpen, 900, false);
      setTimeoutId(id);
    }
  };

  let drawerGetsFocus = () => {
    if (!open) {
      setOpen(true);
    }
  };

  // which doc package is open (only one at a time)
  const [pkgTarget, setPkgTarget] = useState('py');

  let startingPage =
    'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/api_ref.html';
  const [iFrameURL, setIFrameURL] = useState(startingPage);

  let onResize = (rect) => {
    let { width } = rect;
    setInnerAccordionWidth(width - 20);
  };

  let setPackage = (target) => {
    return () => {
      // TODO set iFrameURL to root link for package
      setPkgTarget(target);
      setIFrameURL(docLinks[target]);
    };
  };

  let accordionChange = () => {};

  let handlePyClick = (node) => {
    setIFrameURL(node.link);
  };

  const renderTree = (nodes) => {
    return (
      <TreeItem
        key={nodes.id}
        nodeId={nodes.id}
        label={nodes.name}
        onClick={() => handlePyClick(nodes)}
        className={classes.treeItem}
      >
        {Array.isArray(nodes.children)
          ? nodes.children.map((node) => renderTree(node))
          : null}
      </TreeItem>
    );
  };

  let LinkContainer = ({ children }) => (
    <div className={classes.linkContainer}>{children}</div>
  );

  return (
    <div className={classes.docsWrapper}>
      <ResizeObserver onResize={onResize}></ResizeObserver>
      <Drawer
        open={open}
        variant="permanent"
        anchor="left"
        onMouseLeave={drawerLostFocus}
        onMouseEnter={drawerGetsFocus}
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
        <div className={classes.spacer}></div>

        <div className={classes.drawerHeader}>
          <Accordion
            square
            expanded={pkgTarget === 'py'}
            onChange={accordionChange}
          >
            <AccordionSummary onClick={setPackage('py')} aria-controls="" id="">
              <LinkContainer>
                <Link href="#" className={classes.link}>
                  {open ? 'Python' : 'Py'}
                </Link>
                <Link
                  href="https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/pycmap_api_ref.html"
                  className={classes.externalLink}
                >
                  <LaunchIcon />
                </Link>
              </LinkContainer>
            </AccordionSummary>

            <div hidden={!open}>
              <AccordionDetails>
                <TreeView
                  className={classes.root}
                  defaultCollapseIcon={<ExpandMoreIcon />}
                  defaultExpanded={['root']}
                  defaultExpandIcon={<ChevronRightIcon />}
                >
                  {renderTree(pythonTree)}
                </TreeView>
              </AccordionDetails>
            </div>
          </Accordion>

          <Accordion
            square
            expanded={pkgTarget === 'r'}
            onChange={accordionChange}
          >
            <AccordionSummary onClick={setPackage('r')} aria-controls="" id="">
              <LinkContainer>
                <Link
                  href="#"
                  onClick={setPackage('r')}
                  className={classes.link}
                >
                  R
                </Link>
                <Link
                  href="https://simonscmap.github.io/cmap4r/index.html"
                  className={classes.externalLink}
                >
                  <LaunchIcon />
                </Link>
              </LinkContainer>
            </AccordionSummary>
            <div hidden={!open}>
              <AccordionDetails>
                <TreeView
                  className={classes.root}
                  defaultCollapseIcon={<ExpandMoreIcon />}
                  defaultExpanded={['root']}
                  defaultExpandIcon={<ChevronRightIcon />}
                >
                  {renderTree(rTree)}
                </TreeView>
              </AccordionDetails>
            </div>
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
                {open ? 'Julia' : 'J'}
              </Link>
            </AccordionSummary>
            <AccordionDetails>
              <Typography className={classes.warning}>
                Under development
              </Typography>
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
                {open ? 'Matlab' : 'M'}
              </Link>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>matcmap API</Typography>
            </AccordionDetails>
          </Accordion>
        </div>
      </Drawer>
      <iframe
        id="documentation-frame"
        title="iframe title"
        width={innerAccordionWidth}
        height={window.innerHeight - 110}
        style={{ border: 0 }}
        src={iFrameURL || docLinks[pkgTarget]}
      ></iframe>
    </div>
  );
};

export default withStyles(styles)(Docs);
