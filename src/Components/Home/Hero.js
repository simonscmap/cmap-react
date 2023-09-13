import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import heroStyles from './heroStyles';
import Grid from '@material-ui/core/Grid';

const Hero = (props) => {
  let { classes } = props;
  return (
    <Grid container item direction={'column'} spacing={5} className={classes.hero} wrap='nowrap'>
      <Grid container direction={'row'} spacing={2} item xs={12}>
        <Grid item xs={7} className={classes.logo}>
          <img src="images/home/simons-cmap-logo-full.svg" />
        </Grid>
        <Grid item xs={3} className={classes.globe}>
          <img src="images/home/hero.svg" />
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <div className={classes.copy}>
          <Typography variant="h2" style={{ margin: '1em 0 .5em 0' }}>
            Marine Data, Unified
          </Typography>
          <Typography variant="subtitle1" className={classes.heroBlurb}>
            A collection of harmonized data and open-source tools to investigate
            the hidden worlds of ocean microbes
          </Typography>
        </div>
      </Grid>
    </Grid>
  );
};

export default withStyles(heroStyles)(Hero);
