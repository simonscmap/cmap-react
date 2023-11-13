import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import heroStyles from './heroStyles';
import Grid from '@material-ui/core/Grid';
import Segways from './Segways';

const Hero = (props) => {
  let { classes } = props;
  return (
    <Grid id="hero-container" container item direction={'column'} spacing={5} className={classes.hero} wrap='nowrap'>

      <Grid container direction={'row'} spacing={2} item xs={12}>
        <Grid item xs={6}>
          <div className={classes.arrangeLeftSideHeroContent}>
            <div className={classes.logo}>
              <img src="images/home/simons-cmap-logo-full.svg" />
            </div>
            <div className={classes.copy}>
              <Typography variant="h2" style={{ margin: '-2em 0 .5em 0' }}>
                Interconnected, harmonized ocean data
              </Typography>
            </div>
            <Segways />
          </div>
        </Grid>
        <Grid item xs={4} className={classes.globe}>
          <img src="images/home/hero.svg" />
        </Grid>
      </Grid>

    </Grid>
  );
};

export default withStyles(heroStyles)(Hero);
