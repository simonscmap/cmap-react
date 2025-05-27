import React, { useState } from 'react';
import { makeStyles, Button, Tooltip } from '@material-ui/core';
import { FaRegCopy } from 'react-icons/fa6';

// todo refactor with UI/CopyableText.js
const useStyles = makeStyles((theme) => ({
  button: {
    padding: '2px 8px',
    fontSize: '14px',
    minWidth: 'unset',
    height: '20px',
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: 'rgba(105,255,242,0.08)',
    },
    borderRadius: '36px',
    boxSizing: 'border-box',
    lineHeight: 'unset',
    textTransform: 'none',
    '& span': {
      whiteSpace: 'nowrap',
    },
    lineBreak: 'none',
  },
  icon: {
    color: theme.palette.primary.main,
    fontSize: '1.1em',
    verticalAlign: 'middle',
  },
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#333',
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontWeight: 600,
  },
}));

const CopyButton = ({ text }) => {
  const cl = useStyles();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 900);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Tooltip
      open={showTooltip}
      title="Copied!"
      placement="top"
      classes={{ tooltip: cl.tooltip }}
      arrow={false}
    >
      <Button onClick={handleCopy} className={cl.button} disableRipple>
        <FaRegCopy className={cl.icon} />
      </Button>
    </Tooltip>
  );
};

export default CopyButton;
