import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import HoverPopper from '../../../UI/HoverPopper';
import CopyButton from '../../../UI/CopyButton';

const useStyles = makeStyles((theme) => ({
  monoValue: {
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: theme.palette.primary.light,
  },
}));

const PopperCopy = (props) => {
  const { text, label, mono, contentStyle, children } = props;
  const cl = useStyles();
  const textClass = mono ? cl.monoValue : '';

  const popperContent = (
    <>
      <div>{text}</div>
      <CopyButton text={text} />
    </>
  );

  return (
    <HoverPopper
      content={popperContent}
      label={label}
      contentStyle={contentStyle}
    >
      {children ? (
        children
      ) : (
        <Typography component="p" className={textClass}>
          {text}
        </Typography>
      )}
    </HoverPopper>
  );
};

export default PopperCopy;
