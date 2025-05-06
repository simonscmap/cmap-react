import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Page from './Common/Page';
import { colors } from './Home/theme';

const styles = {
  container: {
    width: '100%',
    textAlign: 'center',
  },
  text: {
    display: 'inline-block',
    margin: '100px auto',
    backgroundImage: 'url(/images/underwater-unsplash.jpg)',
    backgroundSize: 'cover',
    backgroundRepeat: 'repeat',
    backgroundClip: 'text',
    color: 'transparent',
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
    fontSize: '18vw',
    lineHeight: '90%',
    fontWeight: '800',
    textTransform: 'uppercase',
    '-webkit-text-stroke-width': '3px',
    '-webkit-text-stroke-color': colors.green.lime,
    fontFamily: ['Montserrat', 'Lato', 'sans-serif'].join(','),
    '-webkit-font-smoothing': 'antialiased',
  },
};

const FourOhFour = withStyles(styles)(({ classes }) => {
  let Hero = () => (
    <div className={classes.container}>
      <h2 className={classes.text}>
        4<br />0<br />4
      </h2>
    </div>
  );

  return <Page bgVariant="deeps" heroContent={<Hero />}></Page>;
});

export default FourOhFour;
