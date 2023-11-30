import React, { useState } from 'react';
import { makeStyles, Link, Popper } from '@material-ui/core';
import { useDispatch } from 'react-redux';

import { Link as RouterLink } from 'react-router-dom';
import styles from '../searchResultStyles';
import { FaRegCopy } from "react-icons/fa6";
import GreenButton from './DownloadButton';
import { copyTextToClipboard } from '../../../Redux/actions/ui';

const useMoreStyles = makeStyles((theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing(1),
    background: 'rgba(0,0,0,0.2)',
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
  }
}));
const useStyles = makeStyles(styles);

const DatasetTitleLink = (props) => {
  const { dataset } = props;
  const { Long_Name, Short_Name } = dataset;
  const cl = useStyles();
  const clextra = useMoreStyles();
  const dispatch = useDispatch();

  // Popover State & Event Handling
  const [anchorEl, setAnchorEl] = useState(null);
  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  // Copy Text
  const copy = () => {
    dispatch (copyTextToClipboard (Long_Name));
  }

  return (
    <div className={cl.linkContainer} onMouseLeave={handlePopoverClose}>
      <Link
        component={RouterLink}
        to={`/catalog/datasets/${Short_Name}`}
        className={cl.titleLink}
        onMouseEnter={handlePopoverOpen}
      >
        {Long_Name}
      </Link>
      <Popper
        id="mouse-over-popover"
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disablePortal={true}
      >
        <div className={clextra.popContent}>
          <div>{Long_Name}</div>
          <GreenButton onClick={copy} className={clextra.button}><FaRegCopy /></GreenButton>
        </div>
      </Popper>
    </div>
  );
};

export default DatasetTitleLink;
