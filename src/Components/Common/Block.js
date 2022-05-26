import React from 'react';
import { colors } from '../Home/theme';
import { withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

// an indented text block

const styles = {
  block: {
    position: 'relative',
    padding: '0 1em',
    margin: '1.5em 0',
    maxWidth: 'calc(100% - 30px)',
    transition: 'height .2s ease-out, padding-top .2s ease-out',
  },
  blue: {
    background: colors.blue.dark,
  },
  innerBlock: {
    '& h3': {
      color: 'white',
      fontWeight: '700',
    },
    '& a': {
      color: 'white',
    },
    background: colors.blue.dark,
    padding: '1em',
    '& p': {
      lineHeight: '1em',
    },
    '& code': {
      fontFamily: `source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace`,
      color: colors.blue.teal,
      padding: '0',
      background: 'none',
      borderRadius: 'none',
    }
  },
  visualIndent: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '5px',
    background: 'linear-gradient(to top, #A1F640, #69FFF2 100%)',
  },
};

const Block = withStyles(styles)(({ classes, children, variant }) => {
  let blockVariant = variant === 'blue' ? classes.blue : {};
  return (
    <div className={clsx(classes.block, blockVariant)}>
      <div className={classes.visualIndent}></div>
      <div className={classes.innerBlock}>{children}</div>
    </div>
  );
});

export default Block;
