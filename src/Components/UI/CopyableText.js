import React from 'react';
import { useDispatch } from 'react-redux';
import { Tooltip } from '@material-ui/core';
import { copyTextToClipboard } from '../../Redux/actions/ui';

// Wraps a tooltip and span with click event handler for copying to clipboard
const CopyableText = (props) => {
  const { tooltipPlacement, text, innerSpanProps, hideTooltip, textInTooltip } =
    props;

  const dispatch = useDispatch();

  const handleCopyText = () => {
    dispatch(copyTextToClipboard(text));
  };

  const title = textInTooltip ? text : 'Click to copy';
  const placement = tooltipPlacement || 'top';

  if (hideTooltip) {
    return (
      <span
        style={{ cursor: 'copy' }}
        onClick={handleCopyText}
        {...innerSpanProps}
      >
        {text}
      </span>
    );
  }

  return (
    <Tooltip placement={placement} title={title}>
      <span
        style={{ cursor: 'copy' }}
        onClick={handleCopyText}
        {...innerSpanProps}
      >
        {text}
      </span>
    </Tooltip>
  );
};

export default CopyableText;
