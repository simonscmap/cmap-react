import React from 'react';
import { makeStyles } from '@material-ui/core';
import CopyButton from '../../../UI/CopyButton';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  ackText: {
    flex: 1,
    '& p': {
      display: '-webkit-box',
      '-webkit-line-clamp': 2,
      '-webkit-box-orient': 'vertical',
      overflow: 'hidden',
      margin: 0,
    },
  },
}));

const Ack = (props) => {
  const cl = useStyles();
  const text = props.text;

  return (
    <div className={cl.container}>
      <div className={cl.ackText}>
        <p>{text}</p>
      </div>
      <CopyButton text={text} />
    </div>
  );
};

export default Ack;
