import React, { useState, useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'relative',
    width: '100%',
  },
  content: {
    overflow: 'hidden',
    transition: 'all 0.3s ease-out',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100px',
    background: 'linear-gradient(transparent, rgba(255, 255, 255, 0.9))',
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease-out',
  },
  expandButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: theme.spacing(1),
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  buttonText: {
    marginRight: theme.spacing(1),
  },
}));

const ExpandableContent = ({ children, maxHeight = 300 }) => {
  const classes = useStyles();
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
      setNeedsExpansion(height > maxHeight);
    }
  }, [children, maxHeight]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={classes.container}>
      <div
        ref={contentRef}
        className={classes.content}
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : `${maxHeight}px`,
        }}
      >
        {children}
      </div>
      {needsExpansion && !isExpanded && <div className={classes.gradient} />}
      {needsExpansion && (
        <Button
          className={classes.expandButton}
          onClick={toggleExpand}
          disableRipple
        >
          <Typography className={classes.buttonText}>
            {isExpanded ? 'Show Less' : 'Show More'}
          </Typography>
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Button>
      )}
    </div>
  );
};

export default ExpandableContent;
