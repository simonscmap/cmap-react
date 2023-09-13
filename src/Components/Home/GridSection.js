import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import featureGridStyles from './featureGridStyles';
import Grid from '@material-ui/core/Grid';

let useStyle = makeStyles(featureGridStyles);

// look up style via the seaction id
// exception: id === findData (then render a search box)
const Art = ({ children }) => {
  let classes = useStyle();
  return (
    <div className={classes.art}>
      {children}
    </div>
  );
};

const Copy = ({ data, children }) => {
  let classes = useStyle();
  let { title, text } = data;
  return (
    <div className={classes.sectionTextContainer}>
      <Typography variant="h3" className={classes.textAlignLeft}>
        {title}
      </Typography>
      <Typography variant="h5" className={classes.textAlignLeft}>
        {text}
      </Typography>
      <div className={classes.buttonsContainer}>
        {children}
      </div>
    </div>
  );
};

const Section = (props) => {
  let { data, children } = props;

  let direction = data.variant === 'left'
                ? 'row'
                : 'row-reverse';

  return (
    <Grid container item direction={direction} spacing={2} wrap={'no-wrap'}>
      <Grid item xs={12} sm={5} >
        <Art data={data}>{children[0]}</Art>
      </Grid>
      <Grid item xs={12} sm={7}>
        <Copy data={data}>{children[1]}</Copy>
      </Grid>
    </Grid>
  );
};

export default Section;
