import React from 'react';
import { Typography } from '@material-ui/core';
import { colors } from '../Home/theme';
import { withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const styles = {
  banner: {
    position: 'relative',
    padding: '30px',
    margin: '1.5em 0',
    maxWidth: 'calc(100% - 30px)',
    background: colors.gradient.newsBlock,
    transition: 'height .2s ease-out, padding-top .2s ease-out',
    overflow: 'hidden',
    borderRadius: '6px',
  },
  purple: {
    background: colors.gradient.newsBlock,
  },
  blue: {
    background: colors.blue.dark,
  },
  innerBanner: {
    // background: 'rgba(255, 255, 255, 0.14)',
    borderRadius: '6px',
    '& h3': {
      color: 'white',
      fontWeight: '700',
    },
    '& a': {
      color: 'white',
    },
    // padding: '0.5em',
  },
  citation: {
    textAlign: 'right',
    marginBottom: '-30px',
    right: '30px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
};

const Banner = withStyles(styles)(
  ({ classes, children, variant, citation }) => {
    let bannerVariant = variant === 'blue' ? classes.blue : classes.purple;
    return (
      <div className={clsx(classes.banner, bannerVariant)}>
        <div className={classes.innerBanner}>{children}</div>
        {citation && (
          <div className={classes.citation}>
            <Typography variant="body2">{citation}</Typography>
          </div>
        )}
      </div>
    );
  },
);

export default Banner;
