import React, { useState } from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import ToggleButton from '@material-ui/lab/ToggleButton';
import {
  Backdrop,
  ClickAwayListener,
  Grow,
  ListItemIcon,
  MenuItem,
  MenuList,
  Modal,
  Paper,
  Popper,
  ThemeProvider,
  Tooltip,
  Typography,
} from '@material-ui/core';
import z from '../../enums/zIndex';
import { useSelector, useDispatch } from 'react-redux';
import { toggleIntro, toggleHints } from '../../Redux/actions/help.js';
import { useLocation } from 'react-router-dom';
import { pathNameToPageName } from '../../Utility/routing.js';
import { mapPageNameToIntroVideo } from './pageVideo';

// icons
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import MapIcon from '@material-ui/icons/Map'; // Quick Tour
import HelpIcon from '@material-ui/icons/Help'; // Help
import PlayArrowIcon from '@material-ui/icons/PlayArrow'; // Watch Video
import DescriptionIcon from '@material-ui/icons/Description'; // Documentation
import ContactMailIcon from '@material-ui/icons/ContactMail'; // Contact Us
import { VISUALIZATION_PAGE } from '../../constants';

const useStyles = makeStyles({
  navButton: {
    marginBottom: '-0.8em',
  },
  navHelpButtonText: {
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
  navPopperMenu: {
    zIndex: z.NAVBAR_DROPDOWN,
    marginTop: '5px',
    width: '200px',
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '9000 !important',
  },
  videoPlayer: {
    height: 'calc(75vw * 0.5625)',
    maxHeight: '960px',
    width: 'calc(75vw)',
    maxWidth: '1920px',
    borderRadius: '0.5em',
    border: '1px solid #9dd162',
    zIndex: 9000,
    backgroundColor: (props) => props.backgroundColor,
  },
});

const enabledLocations = [
  '/catalog',
  '/visualization',
  '/visualization/charts',
  '/visualization/cruises',
];

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
      id="nav-help-toggle-button"
      value="check"
      className={classes.navButton}
      selected={isOpen}
      onChange={onClick}
    >
      <Typography
        variant="caption"
        className={classes.navHelpButtonText}
        component="div"
      >
        Help
        <OpenClosedIndicator isOpen={isOpen} />
      </Typography>
    </ToggleButton>
  );
};

const HelpNavbarControls = () => {
  // get router location
  const location = useLocation();
  const pageName = pathNameToPageName(location.pathname);
  const styleVariant = pageName === VISUALIZATION_PAGE ? 'black' : '#2f769c'

  let classes = useStyles({ backgroundColor: styleVariant });

  // TODO replate CATALOG_PAGE with router path
  const introIsEnabled = useSelector(({ intros }) => intros[pageName]);
  const dispatch = useDispatch();

  const hintsAreEnabled = useSelector(({ hints }) => hints[pageName]);

  // enable/disable menu by providing/withholding an anchor element to Popper
  const [anchorEl, setAnchorEl] = useState(null);

  const [videoOpen, setVideoOpen] = useState(false);
  const overviewVideo = mapPageNameToIntroVideo(pageName);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    handleVideoClose();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTourClick = () => {
    dispatch(toggleIntro(pageName, !introIsEnabled));
    handleClose();
  };

  const handleHintsClick = () => {
    dispatch(toggleHints(pageName));
    handleClose();
  };

  const handleOpenVideo = () => {
    setVideoOpen(!videoOpen);
    handleClose();
  };

  const handleVideoClose = () => {
    setVideoOpen(false);
  };

  const VideoModal = ({ videoSrc }) => (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={classes.modal}
      open={videoOpen}
      onClose={handleVideoClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <iframe
        className={classes.videoPlayer}
        src={videoSrc}
        allow="autoplay; encrypted-media"
      ></iframe>
    </Modal>
  );

  const ArrowToolTip = ({ content, children }) => {
    return (
      <Tooltip title={content} placement="left" arrow interactive>
        {children}
      </Tooltip>
    );
  };

  // an inline theme override function
  // switch on pagename
  const themeOverride = (primary) => {
    if (pageName === VISUALIZATION_PAGE) {
      return {
        ...primary,
        overrides: {
          ...primary.overrides,
          MuiPaper: {
            root: {
              ...primary.overrides.MuiPaper.root,
              color: 'black',
              backgroundColor: '#9dd162',
            },
          },
          MuiTooltip: {
            ...primary.overrides.MuiTooltip,
            tooltip: {
              ...primary.overrides.MuiTooltip.tooltip,
              backgroundColor: 'black',
            },
          },
        },
      };
    }
    return {
      ...primary,
      overrides: {
        ...primary.overrides,
        MuiPaper: {
          root: {
            ...primary.overrides.MuiPaper.root,
            color: 'black',
            backgroundColor: '#9dd162',
          },
        },
      },
    };
  };

  // only render help menu on enabled pages
  return locationIsEnabled(location.pathname) ? (
    <React.Fragment>
      <ThemeProvider theme={themeOverride}>
        <HelpAnchor onClick={handleClick} isOpen={!!anchorEl} />

        <VideoModal videoSrc={overviewVideo} />

        <div id="nav-dropdown-menu-wrapper">
          <Popper
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            role={undefined}
            transition
            id="test"
            disablePortal={true}
            className={classes.navPopperMenu}
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === 'bottom' ? 'center top' : 'center bottom',
                }}
              >
                <Paper id="nav-help-menu">
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList id="menu-list-grow">
                      <ArrowToolTip
                        content={'Watch a video overview for this page'}
                      >
                        <MenuItem
                          id="nav-help-watch-video"
                          onClick={handleOpenVideo}
                          component={'a'}
                        >
                          <ListItemIcon>
                            <PlayArrowIcon />
                          </ListItemIcon>
                          Watch Video
                        </MenuItem>
                      </ArrowToolTip>

                      <ArrowToolTip content={'Take a quick tour of the page'}>
                        <MenuItem
                          id="nav-help-tour"
                          onClick={handleTourClick}
                          component={Link}
                          to={'#'}
                        >
                          {/* this is a fully functional toggle, but menu is only ever
                        available when tour is disabled */}
                          <ListItemIcon>
                            <MapIcon />
                          </ListItemIcon>
                          {introIsEnabled ? 'Stop Tour' : 'Quick Tour'}
                        </MenuItem>
                      </ArrowToolTip>

                      <ArrowToolTip content={'Turn feature help on or off'}>
                        <MenuItem
                          id="nav-help-hints"
                          onClick={handleHintsClick}
                          component={Link}
                          to={'#'}
                        >
                          <ListItemIcon>
                            <HelpIcon />
                          </ListItemIcon>
                          {hintsAreEnabled
                            ? 'Hide Feature Help'
                            : 'Feature Help'}
                        </MenuItem>
                      </ArrowToolTip>

                      <ArrowToolTip
                        content={
                          'See documentation for sdk functionality corresponding to features on this page'
                        }
                      >
                        <MenuItem
                          id="nav-help-documentation"
                          onClick={handleClose}
                          component={'a'}
                          href={'https://cmap.readthedocs.io/en/latest/'}
                        >
                          <ListItemIcon>
                            <DescriptionIcon />
                          </ListItemIcon>
                          Documentation
                        </MenuItem>
                      </ArrowToolTip>

                      <ArrowToolTip
                        content={'Contact Simons CMAP for additional help'}
                      >
                        <MenuItem
                          id="nav-help-contact-us"
                          onClick={handleClose}
                          component={'a'}
                          href={'/about'}
                        >
                          <ListItemIcon>
                            <ContactMailIcon />
                          </ListItemIcon>
                          Contact Us
                        </MenuItem>
                      </ArrowToolTip>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </div>
      </ThemeProvider>
    </React.Fragment>
  ) : (
    <React.Fragment />
  );
};

export default HelpNavbarControls;
