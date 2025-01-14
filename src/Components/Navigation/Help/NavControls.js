import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { Backdrop, ListItemIcon, Modal } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { toggleIntro, toggleHints } from '../../../Redux/actions/help.js';
import { useLocation } from 'react-router-dom';
import { pathNameToPageName } from '../../../Utility/routing.js';
import { mapPageNameToIntroVideo } from './pageVideo';
import { colors } from '../../Home/theme';

import ExpandableItem from '../ExpandableItem';

// icons
import MapIcon from '@material-ui/icons/Map'; // Quick Tour
import HelpIcon from '@material-ui/icons/Help'; // Help
import PlayArrowIcon from '@material-ui/icons/PlayArrow'; // Watch Video
import DescriptionIcon from '@material-ui/icons/Description'; // Documentation
import ContactMailIcon from '@material-ui/icons/ContactMail'; // Contact Us
// import { VISUALIZATION_PAGE } from '../../../constants';
import { getPageConfiguration } from '../../Common/pageConfiguration';

const helpStyles = () => ({
  helpItem: {
    cursor: 'pointer',
    textAlign: 'left',
    '& a': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'start',
    },
    '& div': {
      height: '1.5em',
      color: colors.blue.teal,
    },
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
    zIndex: 9000,
    border: 0,
  },
});

// define the anchor component
const HelpMenu = withStyles(helpStyles)(({ classes, children }) => {
  return (
    <div
      id="nav-help-toggle-button"
      // selected={isOpen}
      // onChange={onClick}
    >
      <ExpandableItem linkText={'Help'}>{children}</ExpandableItem>
    </div>
  );
});

const HelpItem = withStyles(helpStyles)((props) => {
  let { classes, Icon, children, onClick, href } = props;
  return (
    <div className={classes.helpItem} onClick={onClick}>
      <Link to={href ? href : '#'}>
        <ListItemIcon>{Icon}</ListItemIcon>
        {children}
      </Link>
    </div>
  );
});

const HelpNavbarControls = (props) => {
  let { classes } = props;
  // get router location
  const location = useLocation();
  const pageName = pathNameToPageName(location.pathname);
  // const styleVariant = pageName === VISUALIZATION_PAGE ? 'black' : '#2f769c';

  // TODO replace CATALOG_PAGE with router path
  const introIsEnabled = useSelector(({ intros }) => intros[pageName]);
  const pageConfig = getPageConfiguration(location.pathname);

  const dispatch = useDispatch();

  const hintsAreEnabled = useSelector(({ hints }) => hints[pageName]);

  const [videoOpen, setVideoOpen] = useState(false);
  const overviewVideo = mapPageNameToIntroVideo(pageName);

  const handleTourClick = () => {
    console.log('handle tour click', pageName, introIsEnabled);
    dispatch(toggleIntro(pageName, !introIsEnabled));
  };

  const handleHintsClick = () => {
    dispatch(toggleHints(pageName));
  };

  const handleOpenVideo = () => {
    setVideoOpen(!videoOpen);
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

  return (
    <React.Fragment>
      <VideoModal videoSrc={overviewVideo} />
      <HelpMenu>
        {pageConfig.video && (
          <HelpItem
            id="nav-help-watch-video"
            onClick={handleOpenVideo}
            Icon={<PlayArrowIcon />}
          >
            <span>Watch Video</span>
          </HelpItem>
        )}

        {pageConfig.tour && (
          <HelpItem
            id="nav-help-tour"
            onClick={handleTourClick}
            Icon={<MapIcon />}
          >
            {/* this is a fully functional toggle, but menu is only ever
                        available when tour is disabled */}

            <span>{introIsEnabled ? 'Stop Tour' : 'Quick Tour'}</span>
          </HelpItem>
        )}

        {pageConfig.hints && (
          <HelpItem
            id="nav-help-hints"
            onClick={handleHintsClick}
            Icon={<HelpIcon />}
          >
            <span>
              {hintsAreEnabled ? 'Hide Feature Help' : 'Feature Help'}
            </span>
          </HelpItem>
        )}

        <HelpItem
          id="nav-help-documentation"
          href={'/documentation'}
          Icon={<DescriptionIcon />}
        >
          <span>Documentation</span>
        </HelpItem>

        <HelpItem
          id="nav-help-contact-us"
          href={'/contact'}
          Icon={<ContactMailIcon />}
        >
          <span>Contact Us</span>
        </HelpItem>
      </HelpMenu>
    </React.Fragment>
  );
};

export default withStyles(helpStyles)(HelpNavbarControls);
