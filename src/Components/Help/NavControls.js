import React, { useState } from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import ToggleButton from '@material-ui/lab/ToggleButton';
import {
  Typography,
  MenuItem,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuList,
  ListItemIcon,
  Tooltip,
  Modal,
  Backdrop,
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
  tooltip: {
    backgroundColor: 'black',
    border: '1px solid',
    color: 'white',
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
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayer: {
    height: 'calc(75vw * 0.5625)',
    maxHeight: '960px',
    width: 'calc(75vw)',
    maxWidth: '1920px',
    borderRadius: '0.5em',
    border: '1px solid #9dd162',
    backgroundColor: '#2F769C',
  },
}));

const enabledLocations = ['/catalog', '/visualization', '/visualization/charts', '/visualization/cruises'];

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

const HelpNavbarControls = () => {
  // get router location
  const location = useLocation();
  const pageName = pathNameToPageName(location.pathname);

  let classes = useStyles();

  // change style to black if on viz page
  const paperClass = window.location.pathname.includes('/visualization')
    ? classes.popperPaperBlack
    : classes.popperPaperBlue;

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
    dispatch(toggleIntro(pageName));
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

  // only render help menu on enabled pages
  return locationIsEnabled(location.pathname) ? (
    <React.Fragment>
      <HelpAnchor onClick={handleClick} isOpen={!!anchorEl} />
      {/* Video Modal*/}
      <VideoModal videoSrc={overviewVideo} />
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
                  <ArrowToolTip
                    content={'Watch a video overview for this page'}
                  >
                    <MenuItem onClick={handleOpenVideo} component={'a'}>
                      <ListItemIcon>
                        <PlayArrowIcon />
                      </ListItemIcon>
                      Watch Video
                    </MenuItem>
                  </ArrowToolTip>

                  <ArrowToolTip content={'Take a quick tour of the page'}>
                    <MenuItem
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
                      onClick={handleHintsClick}
                      component={Link}
                      to={'#'}
                    >
                      <ListItemIcon>
                        <HelpIcon />
                      </ListItemIcon>
                      {hintsAreEnabled ? 'Hide Feature Help' : 'Feature Help'}
                    </MenuItem>
                  </ArrowToolTip>
                  <ArrowToolTip
                    content={
                      'See documentation for sdk functionality corresponding to features on this page'
                    }
                  >
                    <MenuItem
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
    </React.Fragment>
  ) : (
    <React.Fragment />
  );
};

export default HelpNavbarControls;
