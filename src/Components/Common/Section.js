import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import clsx from 'clsx';
import { colors } from '../Home/theme';
import { Link } from 'react-router-dom';
import LinkIcon from '@material-ui/icons/Link';

const styles = () => ({
  sectionTitle: {
    margin: '0 0 1em 0',
  },
  fullWidthContainer: {
    width: '100%',
    textAlign: 'left',
    margin: 0,
    padding: 0,
  },
  sectionContainer: {
    // for some reason, every element g

    boxSizing: 'content-box',
    maxWidth: '1380px',
    margin: '0 auto',
    textAlign: 'left',
    padding: '2em 0',
    '@media(min-width: 1281px)': {
      width: 'calc(100% - 80px)',
    },
    '@media(max-width: 1280px)': {
      width: 'calc(100% - 60px)',
    },
    '@media(max-width: 900px)': {
      width: 'calc(100% - 40px)',
    },
    '@media(max-width: 600px)': {
      width: 'calc(100% - 20px)',
    },
    '& > h3': {
      display: 'inline-block',
      position: 'relative',
      '&::after': {
        width: '100%',
        bottom: '-7px',
        right: 0,
        content: '""',
        display: 'block',
        height: '4px',
        position: 'absolute',
        background: colors.blue.dark,
        opacity: 0.7,
      },
    },
  },
  textStyles: {
    '& p': {
      margin: '0.5em 0',
      lineHeight: '2rem',
    },
    '& a': {
      color: colors.blue.teal,
      // color: colors.green.lime,
      '&:hover': {
        color: colors.purple.bright,
      },
    },
    '& h5': {
      // color: colors.green.lime,
    },
    '& h6': {
      // marginTop: '1em',
      fontSize: '1.5rem',
    },
    '& h5, & h6, & p': {
      '& em': {
        display: 'inline-block',
        position: 'relative',
        fontStyle: 'normal',
        '&::after': {
          width: '100%',
          bottom: '-2px',
          right: 0,
          content: '""',
          display: 'block',
          height: '4px',
          position: 'absolute',
          // background: `linear-gradient(to left, ${colors.green.lime}, ${colors.blue.teal} 100%)`,
          opacity: 0.7,
        },
      },
    },
    '& code': {
      fontFamily: `source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace`,
      background: 'rgba(0,0,0,0.5)',
      padding: '3px 5px 4px 5px',
      borderRadius: '2px',
      color: colors.blue.teal,
    },
  },
  subGroup: {
    padding: '1em 0 0.75em 0',
    '& p': {
      padding: '.5em 0 0 0',
    },
  },
  subGroupTitle: {
    padding: '0 0 3px 0',
    '& h5': {
      margin: 0,
    },
  },

  vCenter: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    '& svg': {
      color: colors.green.lime,
      marginTop: '3px',
      marginLeft: '5px',
    },
  },
  deeps: {
    background: colors.gradient.deeps,
  },
  royal: {
    background: colors.gradient.royal,
  },
  slate: {
    background: colors.gradient.slate,
  },
  slate2: {
    background: colors.gradient.slate2,

  },
  purple: {
    background: colors.gradient.newsBlock,
  },
});

export const FullWidthContainer = withStyles(styles)(
  ({ classes, bgVariant, children, minWidth }) => {
    return (
      <div
        className={clsx(
          classes.fullWidthContainer,
          bgVariant ? classes[bgVariant] : classes.slate,
        )}
        style={{ minWidth: minWidth }}
      >
        {children}
      </div>
    );
  },
);

const GroupTitle = withStyles(styles)(({ classes, title, titleLink }) => {
  if (titleLink) {
    return (
      <Typography variant="h5">
        <Link to={titleLink} className={classes.vCenter}>
          <span>{title}</span>
          <LinkIcon />
        </Link>
      </Typography>
    );
  } else {
    return <Typography variant="h5">{title}</Typography>;
  }
});

export const Group = withStyles(styles)(
  ({ classes, title, titleLink, children }) => (
    <div className={classes.subGroup}>
      <div className={classes.subGroupTitle}>
        <GroupTitle title={title} titleLink={titleLink} />
      </div>
      {children}
    </div>
  ),
);

const Section = (props) => {
  let { classes, children, name, title, textStyles = true } = props;

  let cl = [classes.sectionContainer];
  if (textStyles) {
    cl.push(classes.textStyles);
  }
  return (
    <div id={name} className={clsx(...cl)}>
      {title && (
        <Typography variant="h3" className={classes.sectionTitle}>
          {title}
        </Typography>
      )}
      {children}
    </div>
  );
};

export default withStyles(styles)(Section);
