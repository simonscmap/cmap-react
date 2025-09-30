import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Collapse from '@material-ui/core/Collapse';
import { withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import ResizeObserver from 'react-resize-observer';
import { Link, useLocation } from 'react-router-dom';
import {
  NAVIGATION_WIDTH_BREAKPOINT as BREAKPOINT,
  NAVIGATION_COMPRESS_BREAKPOINT as COMPRESS_BREAKPOINT,
} from '../../constants';
import { getPageConfiguration } from '../Common/pageConfiguration';
import ExpandableItem from './ExpandableItem';
import HelpNavbarControls from './Help/NavControls';
import navigationStyles from './navigationStyles';
import UserMenu from './UserMenu';
import DataSubmissionLink from './DataSubmissionLink';

const Navigation = (props) => {
  let { classes, variant } = props;

  let location = useLocation();

  // menu is collapsable if window is smaller than breakpoint
  let [menuIsCollapsable, setCollapsable] = React.useState(false);
  let [menuHasTwoRows, setMenuHasTwoRows] = React.useState(false);

  // set initial state
  React.useEffect(() => {
    setCollapsable(window.innerWidth <= BREAKPOINT);
    setMenuHasTwoRows(window.innerWidth <= COMPRESS_BREAKPOINT);
  }, []);

  // declare menu state and handlers
  let [menuIsOpen, setMenuOpen] = React.useState(false);

  const handleMenuClick = () => setMenuOpen(!menuIsOpen);

  const handleMenuClose = () => setMenuOpen(false);

  // close the menu any time location changes
  // and scroll back to the top of the page
  React.useEffect(() => {
    window.scrollTo(0, 0);
    handleMenuClose();
  }, [location]);

  // on resize: set collapsable if <= BREAKPOINT
  const onResize = ({ width }) => {
    // menu is too wide to  be collapsable
    if (width > BREAKPOINT) {
      if (menuIsCollapsable) {
        setMenuOpen(false);
        setCollapsable(false);
      }
    }
    // menu is narrow enough to be collapsable
    if (width <= BREAKPOINT) {
      if (!menuIsCollapsable) {
        setCollapsable(true);
        setMenuOpen(false);
      }
    }
    // menu is too wide to be compressed into two rows
    if (width >= COMPRESS_BREAKPOINT) {
      if (menuHasTwoRows) {
        setMenuHasTwoRows(false);
      }
    }
    // menu is narrow enough to be compressed into two rows
    if (width <= COMPRESS_BREAKPOINT) {
      if (!menuHasTwoRows) {
        setMenuHasTwoRows(true);
      }
    }
  };

  // menu should be open
  // 1. if screen is > 900px
  // 2. if screen is <= 900px and has been opened
  const navShouldBeOpen =
    !menuIsCollapsable || (menuIsCollapsable && menuIsOpen);

  const collapseOpts = {
    appear: 200,
    enter: 200,
    exit: 100, // otherwise background will blip
  };

  // class swaps based on collapsable state
  const scrimClasses = clsx(
    classes.scrim,
    menuIsCollapsable ? classes.scrimShow : classes.scrimHide,
  );

  const widthConstraintClasses = clsx(
    menuIsCollapsable
      ? classes.widthConstraintCollapsable
      : classes.widthConstraint,
    classes[`contain${variant}`],
  );

  const menuControlClasses = clsx(
    classes.menuControl,
    navShouldBeOpen ? classes.menuOpen : classes.menuClosed,
    menuIsCollapsable ? classes.showMenuControl : classes.hideMenuControl,
  );

  const innerContainerClasses = clsx(
    classes.navigationInnerContainer,
    menuIsCollapsable ? classes.innerContainerCollapsable : null,
  );

  const isActive = (rex) => {
    if (rex && rex.test && rex.test(location.pathname)) {
      return classes.highlight;
    } else {
      return '';
    }
  };

  return (
    <div className={classes.navigationContainer}>
      <ResizeObserver onResize={onResize}></ResizeObserver>
      <div className={scrimClasses}></div>
      <div id="widthContainer" className={widthConstraintClasses}>
        <Link to="/">
          <div id="mark" className={classes.cmapMark}></div>
        </Link>
        <ClickAwayListener onClickAway={handleMenuClose}>
          <div>
            {/* place menu control INSIDE click away listener */}
            <div
              id="menu-control"
              onClick={handleMenuClick}
              className={menuControlClasses}
            ></div>
            {/* adjust Collapse style to allow inner layer with background to fill full width*/}
            <Collapse in={navShouldBeOpen} timeout={collapseOpts}>
              <div
                id="navigationInnerContainer"
                className={innerContainerClasses}
              >
                <div className={classes.navigationGroupFirst}>
                  <Link to="/catalog" className={isActive(/\/catalog/)}>
                    Catalog
                  </Link>
                  <ExpandableItem
                    linkText={'Visualization'}
                    highlight={isActive(/\/visualization/)}
                  >
                    <Link to="/visualization/charts">Charts & Plots</Link>
                    <Link to="/visualization/cruises">Cruises</Link>
                  </ExpandableItem>
                  <Link to="/programs" className={isActive(/\programs/)}>
                    Programs
                  </Link>
                  <Link to="/collections" className={isActive(/\/collections/)}>
                    Collections
                  </Link>
                  <ExpandableItem
                    linkText={'Data Submission'}
                    highlight={isActive(/\/datasubmission/)}
                  >
                    <Link to="/datasubmission/guide">Submission Guide</Link>
                    <DataSubmissionLink />
                    <Link to="/datasubmission/nominate-data">
                      Nominate New Data
                    </Link>
                    <Link to="/datasubmission/userdashboard">
                      Data Submission Dashboard
                    </Link>
                  </ExpandableItem>
                  <ExpandableItem
                    linkText={'Documentation'}
                    highlight={isActive(/\/documentation/)}
                  >
                    <Link to="/apikeymanagement">API Key</Link>
                    <Link to="/documentation">Documentation</Link>
                  </ExpandableItem>
                  <Link to="/gallery" className={isActive(/\/gallery/)}>
                    Gallery
                  </Link>
                  <ExpandableItem
                    linkText={'About'}
                    highlight={isActive(/\/about|\/contact/)}
                    isRightEdge={menuHasTwoRows && true}
                  >
                    <Link to="/about">About</Link>
                    <Link to="/contact">Contact Us</Link>
                  </ExpandableItem>
                </div>
                <hr className={classes.navGroupHR} />
                <div className={classes.navigationGroupSecond}>
                  <HelpNavbarControls />
                  <UserMenu />
                </div>
              </div>
            </Collapse>
          </div>
        </ClickAwayListener>
      </div>
    </div>
  );
};

export const Nav = withStyles(navigationStyles)(Navigation);

const NavSwitcher = () => {
  let location = useLocation();
  let config = getPageConfiguration(location.pathname);
  let variant =
    config && config.navigationVariant ? config.navigationVariant : 'Center';
  return <Nav variant={variant} />;
};

export default NavSwitcher;
