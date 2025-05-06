import { Link } from 'react-router-dom';
import { withStyles, ThemeProvider } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import footerStyles from './footerStyles';
import clsx from 'clsx';
import { homeTheme } from './theme';

const Footer = (props) => {
  let { classes } = props;
  return (
    <ThemeProvider theme={homeTheme}>
      <div className={classes.footerOuterContainer}>
        <div className={classes.footerInnerContainer}>
          <img src="/images/home/cmap-logo-mark.svg" width="68" height="68" />
          <Typography variant="h2">Simons CMAP</Typography>
          <div className={classes.footerLinksContainer}>
            <Link to="/catalog">Catalog</Link>
            <Link to="/visualization">Visualization</Link>
            <Link to="/programs">Programs</Link>
            <Link to="/datasubmission/guide">Data Submission</Link>
            <Link to="/gallery">Gallery</Link>
          </div>
          <div className={classes.footerLinksContainer}>
            <Link to="/apikeymanagement">API Access</Link>
            <Link to="/documentation">Documentation</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/about">About</Link>
          </div>

          <div className={classes.footerConnectLinks}>
            <a href="https://join.slack.com/t/simons-cmap/shared_invite/enQtNjQzMTkzMjg0NjQ2LTdlOGRhZjNhMDY3MjRlNjg2OTY5NzE3ZWZhNWE0OWZhYmQzMTJjNDkyNDQ1MjNkZDg0N2MzMzhlZDliNGYxYzQ">
              <img src="/images/home/logo-slack.svg" />
            </a>
            <a href="https://github.com/simonscmap">
              <img src="/images/home/logo-github.svg" />
            </a>
          </div>
          <hr className={clsx(classes.footerHR, classes.variableHR)} />
          <div className={classes.footerCollaboration}>
            <div className={classes.footerSponsor}>
              <Typography variant="h6" className={classes.greyTitle}>
                Our Sponsor
              </Typography>
              <a href="https://www.simonsfoundation.org">
                <img
                  src="/images/simons-foundation-logo-white.png"
                  style={{ marginTop: '10px', width: '155px' }}
                />
              </a>
            </div>
            <div className={classes.footerPartners}>
              <Typography variant="h6" className={classes.greyTitle}>
                Our Partners
              </Typography>
              <div className={classes.footerPartnerLogos}>
                <a href="https://cbiomes.org/">
                  <img src="/images/home/partner-logo-cbiomes.svg" />
                </a>
                <a href="http://scope.soest.hawaii.edu/">
                  <img src="/images/home/partner-logo-scope.svg" />
                </a>
                <a href="https://www.washington.edu/">
                  <img src="/images/home/partner-logo-uw.svg" />
                </a>
              </div>
            </div>
          </div>
          <hr className={classes.footerHR} />
          <Typography variant="body1" style={{ marginTop: '20px' }}>
            © Simons CMAP {new Date().getFullYear()}. All rights reserved.
          </Typography>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default withStyles(footerStyles)(Footer);
