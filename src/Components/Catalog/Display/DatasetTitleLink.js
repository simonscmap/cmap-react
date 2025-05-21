import React, { useState } from 'react';
import { makeStyles, Link, Popper } from '@material-ui/core';
import { useDispatch } from 'react-redux';

import { Link as RouterLink } from 'react-router-dom';
import styles from './DatasetTitleLink.styles';
import { FaRegCopy } from 'react-icons/fa6';
import GreenButton from './DownloadButton';
import { copyTextToClipboard } from '../../../Redux/actions/ui';

const useStyles = makeStyles(styles);

const DatasetTitleLink = (props) => {
  const { dataset, componentId = {} } = props;
  const { Long_Name, Short_Name } = dataset;
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
  const open = Boolean(anchorEl);

  // Copy Text
  const copy = () => {
    dispatch(copyTextToClipboard(Long_Name));
  };

  return (
    <div
      className={cl.linkContainer}
      onMouseLeave={handlePopoverClose}
      {...componentId}
    >
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
        anchororigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformorigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disablePortal={true}
      >
        <div className={cl.popContent}>
          <div>{Long_Name}</div>
          <GreenButton onClick={copy} className={cl.button}>
            <FaRegCopy />
          </GreenButton>
        </div>
      </Popper>
    </div>
  );
};

export default DatasetTitleLink;
