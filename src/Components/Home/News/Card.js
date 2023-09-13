import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import { ThemeProvider, createTheme, withStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import { colors } from '../theme';
import newsBannerStyles from './newsBannerStyles';
import renderBody from './renderBody';
import renderHeadline from './renderHeadline';

const ChipTheme = createTheme({
  palette: {
    primary: {
      main: colors.green.lime
      // main: "#d16265;",
    },
    secondary: {
      main: "#ffd54f",
    }
  },
});

const useStyles = makeStyles({
  chip: {
    height: '20px',
  }
});

const StyledChip = ({ label }) => {
  const classes = useStyles();
  if (!label) {
    return '';
  }
  return (
    <ThemeProvider theme={ChipTheme}>
      <Chip color="primary" label={label} className={classes.chip} />
    </ThemeProvider>
  );
}

const Card = withStyles(newsBannerStyles)(
  ({ classes, story }) => {
    let { date, headline, link, body, label } = story;

    return (
      <div
        className={clsx(
          classes.newsCard,
          classes.newsCardContent,
        )}
      >
        <div className={classes.cardTopLine}>
          <Typography variant="body2" className={classes.date}>
            {date}
          </Typography>
          <StyledChip label={label} />
        </div>
        <div>
          {renderHeadline(headline, link)}
        </div >
        <Typography variant="body2">{renderBody(body)}</Typography>
      </div >
    );
  },
);

export default Card;
