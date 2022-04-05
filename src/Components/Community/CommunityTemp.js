import React from 'react';

import {
  Grid,
  Typography,
  Paper,
  Tooltip,
  Link,
  Button,
} from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  root: {
    marginTop: '70px',
  },

  descriptionPaper: {
    padding: '6vh 6vw',
    margin: '110px 10vw 0px 10vw',
  },

  iconContainer: {
    marginTop: '4vh',
  },

  followContainer: {
    marginTop: '4vh',
  },

  softwareIcon: {
    maxHeight: 'calc(100% - 1vh)',
    maxWidth: 'calc(100% - .5vw)',
    height: '110px',
  },

  followUs: {
    lineHeight: 3.1,
    fontSize: '16px',
  },

  followUsGridSection: {
    textAlign: 'right',
    marginBottom: '12px',
  },

  followUsIcon: {
    marginLeft: '12px',
  },

  docButtonGrid: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
  },

  docButton: {
    color: 'white',
    textTransform: 'none',
    width: '180px',
  },
});

const CommunityTemp = (props) => {
  const { classes } = props;

  return (
    <div className={classes.root}>
      <Paper className={classes.descriptionPaper} elevation={8}>
        <Typography variant="body1">
          Simons CMAP is a community-based project intending to further
          cultivate the collaborative efforts at ocean sciences. It supports
          popular programming languages used for data analysis and seamlessly
          blends into your existing codebase. Review the{' '}
          <Link target="_blank" href="https://cmap.readthedocs.io/en/latest/">
            documentation
          </Link>{' '}
          to discover how to retrieve, visualize, and analyze the CMAP data sets
          using your preferred language. There you will also find information on
          how your own datasets can be submitted to CMAP. Please join us and
          contribute to growing the CMAP data and software ecosystem.
        </Typography>

        <Grid container className={classes.iconContainer}>
          <Grid item xs={12} md={6} lg={3}>
            <a
              href="https://github.com/simonscmap/cmap4r"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="images/cmap-sdk-R-COLORED.png"
                width="152"
                alt=""
                className={classes.softwareIcon}
              />
            </a>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <a
              href="https://github.com/simonscmap/pycmap"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="images/cmap-sdk-python-COLORED.png"
                width="273"
                alt=""
                className={classes.softwareIcon}
              />
            </a>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <a
              href="https://github.com/simonscmap/CMAP.jl"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="images/cmap-sdk-julia-COLORED.png"
                width="176"
                alt=""
                className={classes.softwareIcon}
              />
            </a>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <a
              href="https://github.com/simonscmap/matcmap"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="images/cmap-sdk-Matlab-COLORED.png"
                alt=""
                className={classes.softwareIcon}
              />
            </a>
          </Grid>
        </Grid>

        <Grid container className={classes.followContainer}>
          <Grid item xs={12} md={1}></Grid>
          <Grid item xs={5} md={2} className={classes.followUsGridSection}>
            <Typography variant="caption" className={classes.followUs}>
              Follow Us:
            </Typography>
          </Grid>

          <Grid item xs={4} md={3}>
            <a
              href="https://github.com/simonscmap"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="images/github-icon.png"
                width="55"
                srcSet="images/github-icon-p-500.png 500w, images/github-icon.png 512w"
                alt=""
                className={classes.followUsIcon}
              />
            </a>
            <a
              href="https://join.slack.com/t/simons-cmap/shared_invite/enQtNjQzMTkzMjg0NjQ2LTdlOGRhZjNhMDY3MjRlNjg2OTY5NzE3ZWZhNWE0OWZhYmQzMTJjNDkyNDQ1MjNkZDg0N2MzMzhlZDliNGYxYzQ"
              target="_blank"
              className={classes.followUsIcon}
              rel="noreferrer"
            >
              <img
                src="images/slack-icon.png"
                width="55"
                srcSet="images/slack-icon-p-500.png 500w, images/slack-icon.png 600w"
                alt=""
              />
            </a>
          </Grid>

          <Grid item xs={12} md={5} className={classes.docButtonGrid}>
            <Button
              color="primary"
              variant="contained"
              href="https://cmap.readthedocs.io/en/latest/"
              target="_blank"
              className={classes.docButton}
            >
              Documentation
            </Button>
          </Grid>

          <Grid item xs={3} md={12}></Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default withStyles(styles)(CommunityTemp);
