import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import footerStyles from './footerStyles';
import clsx from 'clsx';

const Footer = (props) => {
  let { classes } = props;
  return (
    <div className={classes.footerOuterContainer}>
      <div className={classes.footerInnerContainer}>
        <img src="/images/home/cmap-logo-mark.svg" width="68" height="68" />
        <Typography variant="h2">Experience Simons CMAP</Typography>
        <div className={classes.footerLinksContainer}>
          <Link to="/catalog">Catalog</Link>
          <Link to="/visualization">Visualization</Link>
          <Link to="/datasubmission/guide">Data Submission</Link>
          <Link to="/apikeymanagement">API Access</Link>
          <Link to="/gallery">Gallery</Link>
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
                src="/images/home/logo-simons.svg"
                style={{ marginTop: '10px' }}
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
          © Simons CMAP 2022. All rights reserved. Privacy Policy.
        </Typography>
      </div>
    </div>
  );
};

export default withStyles(footerStyles)(Footer);
