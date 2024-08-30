import React from 'react';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'inline-block',
    height: '20px',
    width: '50px',
    position: 'relative',
    '& > div': {
      transition: 'all .5s ease-out',
    }
  },
  track: {
    position: 'absolute',
    top: 4,
    left: 3,
    right: 3,
    bottom: 3,
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '6px',
    boxShadow: 'inset 0 0 4px #000000',
  },
  dot: {
    position: 'absolute',
    top: 3,
    width: '15px',
    height: '15px',
    borderRadius: '15px',
    boxShadow: '0px 4px 4px rgba(0,0,0,0.3)',
  },
  dotOn: {
    left: 'unset',
    right: 3,
    backgroundColor: '#69FFF2',
  },
  dotOff: {
    right: 'unset',
    left: 3,
    backgroundColor: '#aaa',
  }
}));

const Switch = (props) => {
  const { width, state = false} = props;
  const cl = useStyles();

  const dot = state
        ? cl.dotOn
        : cl.dotOff;

  const widthOverride = width ? {
    width: `${width}px`
  } : undefined ;

  return (
    <div
      className={cl.wrapper}
      style={widthOverride}
    >
      <div className={cl.track}></div>
      <div className={`${cl.dot} ${dot}`}></div>
    </div>
  );
};

export default Switch;
