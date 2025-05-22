import React from 'react';
import { makeStyles, Button } from '@material-ui/core';
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
}));

const CopyButton = ({ text }) => {
  const cl = useStyles();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Button onClick={handleCopy} className={cl.button} disableRipple>
      <FaRegCopy className={cl.icon} />
    </Button>
  );
};

export default CopyButton;
