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
    color: 'black',
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.secondary.light,
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
    <Button onClick={handleCopy} className={cl.button}>
      <FaRegCopy />
    </Button>
  );
};

export default CopyButton;
