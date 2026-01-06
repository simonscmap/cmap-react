import React from 'react';
import { Tooltip } from '@material-ui/core';
import UniversalButton from '../../../shared/components/UniversalButton';
import zIndex from '../../../enums/zIndex';

const CollectionDownloadButton = ({
  disabled,
  onClick,
  size = 'medium',
  label = 'DOWNLOAD',
}) => {
  return (
    <Tooltip
      title={disabled ? 'This collection has no datasets to download' : ''}
      placement="top"
      PopperProps={{ style: { zIndex: zIndex.MODAL_LAYER_1_POPPER } }}
    >
      <span>
        <UniversalButton
          variant="primary"
          size={size}
          onClick={onClick}
          disabled={disabled}
        >
          {label}
        </UniversalButton>
      </span>
    </Tooltip>
  );
};

export default CollectionDownloadButton;
