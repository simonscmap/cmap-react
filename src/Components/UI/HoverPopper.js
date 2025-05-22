import React, { useState } from 'react';
import { makeStyles, Popper } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'inline-block',
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
}));

const HoverPopper = ({ children, content, label, contentStyle }) => {
  const cl = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const isOpen = Boolean(anchorEl);
  const inline = contentStyle || {};

  return (
    <div className={cl.container} onMouseLeave={handlePopoverClose}>
      {React.cloneElement(children, {
        onMouseEnter: handlePopoverOpen,
      })}
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
          {content}
        </div>
      </Popper>
    </div>
  );
};

export default HoverPopper;
