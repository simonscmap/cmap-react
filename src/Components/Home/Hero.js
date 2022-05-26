import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import heroStyles from './heroStyles';

const Hero = (props) => {
  let { classes, children } = props;
  return (
    <div className={classes.heroOuterContainer}>
      <div className={classes.heroInnerContainer}>
        <div className={'heroFirstGroup'}></div>
        <div className={'heroSecondGroup'}>
          <div className={classes.cmapLogoContainer}></div>
          <Typography variant="h2" style={{ margin: '3em 0 .5em 0' }}>
            Marine Data, Unified
          </Typography>
          <Typography variant="subtitle1" className={classes.heroBlurb}>
            A collection of harmonized data and open-source tools to investigate
            the hidden worlds of ocean microbes
          </Typography>
        </div>
      </div>
      {/* News Banner renders within the Hero space*/}
      {children}
    </div>
  );
};

export default withStyles(heroStyles)(Hero);
