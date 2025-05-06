import React, { useState } from 'react';
import { makeStyles, Typography, Popper } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { FaRegCopy } from 'react-icons/fa6';
import GreenButton from './DownloadButton';
import { copyTextToClipboard } from '../../../Redux/actions/ui';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'inline-block',
  },
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing(1),
  },
  popContent: {
    display: 'inline-grid',
    gridAutoFlow: 'column',
    columnGap: '1em',
    background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(5px)',
    border: `1px solid ${theme.palette.primary.light}`,
    borderRadius: '4px',
    padding: '.8em 1.5em',
    color: 'white',
    fontSize: '14px',
    '& > div': {
      alignSelf: 'center',
      placeSelf: 'center',
    },
  },
  button: {
    padding: '2px 8px',
    fontSize: '14px',
    minWidth: 'unset',
    height: '20px',
  },
  monoValue: {
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: theme.palette.primary.light,
  },
}));

const PopperCopy = (props) => {
  const { text, label, mono, contentStyle } = props;
  const cl = useStyles();
  const dispatch = useDispatch();

  // Popover State & Event Handling
  const [anchorEl, setAnchorEl] = useState(null);
  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const isOpen = Boolean(anchorEl);

  // Copy Text
  const copy = () => {
    dispatch(copyTextToClipboard(text));
  };

  const textClass = mono ? cl.monoValue : '';

  const inline = contentStyle || {};

  return (
    <div className={cl.container} onMouseLeave={handlePopoverClose}>
      <Typography
        component="p"
        className={textClass}
        onMouseEnter={handlePopoverOpen}
      >
        {text}
      </Typography>
      <Popper
        id={`mouseOverPopperControl_${label || 'x'}`}
        open={isOpen}
        anchorEl={anchorEl}
        anchororigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformorigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        placement="bottom-end"
        onClose={handlePopoverClose}
        disablePortal={true}
        style={{ zIndex: 9000 }}
      >
        <div className={cl.popContent} style={inline}>
          <div>{text}</div>
          <GreenButton onClick={copy} className={cl.button}>
            <FaRegCopy />
          </GreenButton>
        </div>
      </Popper>
    </div>
  );
};

export default PopperCopy;
