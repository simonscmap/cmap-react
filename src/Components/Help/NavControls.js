import React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import ToggleButton from '@material-ui/lab/ToggleButton';
import {
  Typography,
  MenuItem,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuList,
} from '@material-ui/core';
import z from '../../enums/zIndex';
import { useSelector, useDispatch } from 'react-redux';
import { toggleIntro } from '../../Redux/actions/help.js';
import { CATALOG_PAGE } from '../../constants.js';
import { useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  navButton: {
    backgroundColor: '#9dd162',
    marginBottom: '-0.8em',
    '&.MuiToggleButton-root.Mui-selected:hover': {
      backgroundColor: '#9dd162',
    },
    '&.MuiToggleButton-root.Mui-selected': {
      backgroundColor: '#9dd162',
    },
    '&.MuiToggleButton-root:hover': {
      backgroundColor: '#9dd162',
    },
  },
  navLink: {
    // textDecoration: 'none',
    marginRight: 0,
    fontFamily: '"Lato",sans-serif',
    color: 'black',
    '&:hover': {
      // color: theme.palette.primary.main,
    },
    fontSize: '14px',
    fontWeight: 100,
    display: 'inline-block',
    cursor: 'pointer',
    verticalAlign: 'middle',
    pointerEvents: 'all',
    letterSpacing: 'normal',
  },
  icon: {
    display: 'inline-flex',
    verticalAlign: 'middle',
    color: 'black',
    marginTop: '-0.2em',
  },
  dropdown: {
    // zIndex: 40000,
    zIndex: z.NAVBAR_DROPDOWN,
    marginTop: '5px',
    width: '200px',
  },
  popperPaperBlue: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    color: '#000',
    backgroundColor: '#9dd162',
  },
  popperPaperBlack: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: 'black',
  },
}));

const enabledLocations = ['/catalog'];

const locationIsEnabled = (pathName) => {
  return enabledLocations.includes(pathName);
};

const OpenClosedIndicator = ({ isOpen }) => {
  let classes = useStyles();
  return isOpen ? (
    <ExpandLess className={classes.icon} fontSize="small" />
  ) : (
    <ExpandMore className={classes.icon} fontSize="small" />
  );
};
// define the anchor component
const HelpAnchor = ({ onClick, isOpen }) => {
  let classes = useStyles();
  return (
    <ToggleButton
      value="check"
      className={classes.navButton}
      selected={isOpen}
      onChange={onClick}
    >
      <Typography variant="caption" className={classes.navLink}>
        Help
        <OpenClosedIndicator isOpen={isOpen} />
      </Typography>
    </ToggleButton>
  );
};

const HelpNavbarControls = (props) => {
  let classes = useStyles();
  // change style to black if on viz page
  const paperClass = window.location.pathname.includes('/visualization')
    ? classes.popperPaperBlack
    : classes.popperPaperBlue;

  const introIsEnabled = useSelector(({ intros }) => intros[CATALOG_PAGE]);
  const dispatch = useDispatch();

  // enable/disable menu by providing/withholding an anchor element to Popper
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTourClick = () => {
    console.log('handle tour click');
    dispatch(toggleIntro(CATALOG_PAGE));
    handleClose();
  };

  const handleHintsClick = () => {
    console.log('hints click');
  };

  // get router location
  const location = useLocation();

  // only render help menu on enabled pages

  return locationIsEnabled(location.pathname) ? (
    <React.Fragment>
      <HelpAnchor onClick={handleClick} isOpen={!!anchorEl} />
      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        role={undefined}
        transition
        className={classes.dropdown}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper className={paperClass}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="menu-list-grow">
                  <MenuItem onClick={handleClose} component={'a'}>
                    Watch Video
                  </MenuItem>
                  <MenuItem onClick={handleTourClick} component={Link} to={'#'}>
                    {introIsEnabled ? 'Disable Tour' : 'Start Tour'}
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  ) : (
    <React.Fragment />
  );
};

export default HelpNavbarControls;
