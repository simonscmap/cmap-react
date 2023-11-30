import React from 'react';
import {
  makeStyles,
} from '@material-ui/core';
import PopperCopy from './PopperCopy';

const useStyles = makeStyles((theme) => ({
  ackText: {
    '& p': {
      display: '-webkit-box',
      '-webkit-line-clamp': 2,
      '-webkit-box-orient': 'vertical',
      overflow: 'hidden',
      fontSize: '.9em',
    },
  }
}));


const Ack = (props) => {
  const cl = useStyles();
  const text = props.text;

  return (
    <div className={cl.ackText}>
      <PopperCopy text={text} label={'ack'} contentStyle={{ maxWidth: '60%' }} />
    </div>
  );
}

export default Ack;
