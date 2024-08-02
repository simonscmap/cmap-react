import React, { useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { RiQuestionLine } from "react-icons/ri";
import { RiFocusLine } from "react-icons/ri";

const useStyles = makeStyles (() => ({
  focalToggleButton: {
    background: 'none',
    border: 'none',
    color: 'unset',
    padding: '0',
    height: '24px',
    margin: '0',
    cursor: 'pointer',
    '& svg': {
      fontSize: '24px'
    },
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: '12px',
  },

  glow: {
    animation: '$glow 1000ms ease-out infinite alternate',
    borderRadius: '12px',
    '& svg': {
      color: 'rgb(105, 255, 242)',
      padding: 0,
    }
  },

  '@keyframes glow': {
    '0%': {
      borderColor: '#393',
      boxShadow: '0 0 5px rgba(105, 255, 242, 0.2), inset 0 0 5px rgba(105, 255, 242, 0.1), 0 2px 0 #000'
    },
    '100%': {
      borderColor: '#6f6',
      boxShadow: '0 0 20px rgba(105, 255, 242, 0.6), inset 0 0 10px rgba(105, 255, 242, 0.4), 0 2px 0 #000'
    },
  }
}));

export const FocusQuestion= (props) => {
  const { name, focus } = props;
  const cl = useStyles();

  return (
    <div className={`${focus === name ? cl.glow : ''} ${cl.focalToggleButton}`}>
      {focus === name ? <RiFocusLine/> : <RiQuestionLine />}
    </div>
  );
};

export const FocusEnumerator = (props) => {
  const { name, focus, children } = props;
  const cl = useStyles();

  return (
    <div className={`${focus === name ? cl.glow : ''} ${cl.focalToggleButton}`}>
      { children }
    </div>
  );
};

function scrollToFocus (name) {
  const scrollContainer = document.getElementById ('content-scroll-container');
  const query = `[data-focus="${name}"]`;
  const el = scrollContainer.querySelector (query);
  if (el) {
    const offset = el.offsetTop;
    scrollContainer.scrollTo (0, offset);
  }
}

export const FocusManager = (props) => {
  const { children, focus } = props;

  useEffect (() => {
    const scrollContainer = document.getElementById ('content-scroll-container');
    if (scrollContainer && focus) {
      // use timout to let the DOM update with the expanded height of the
      // accordion added to the innerHeight of the scrolling container
      setTimeout(scrollToFocus, 10, focus);
    }
  }, [focus]);


  return (
    <div>
      { children }
    </div>
  );
}
