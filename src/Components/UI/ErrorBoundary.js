// Catches uncaught errors in front end and transmits to api

import React from 'react';
import { connect } from 'react-redux';

import Bowser from 'bowser';

import { Paper, Typography } from '@material-ui/core';

import { errorReportSend } from '../../Redux/actions/community';

const mapDispatchToProps = {
  errorReportSend,
};

class ErrorBoundary extends React.Component {
  state = {
    caughtError: false,
  };

  static getDerivedStateFromError(error) {
    return { caughtError: true };
  }

  componentDidCatch(error, errorInfo) {
    let info = Bowser.parse(window.navigator.userAgent);
    let browserInfo = `${info.browser.name || 'Unknown browser'} ${
      info.browser.version || 'Unknown version'
    }`;
    let osInfo = `${info.os.name || 'Unknown OS'} ${
      info.os.versionName || 'Unknown version'
    }`;
    this.props.errorReportSend(error.toString(), browserInfo, osInfo);
  }

  render() {
    return this.state.caughtError ? (
      <Paper
        style={{ margin: '90px auto', width: '60vw', padding: '16px' }}
        elevation={4}
      >
        <img
          src="/images/cmap-logo2.png"
          alt="CMAP Logo"
          style={{ maxWidth: '90%' }}
        />
        <Typography variant="h6">
          Something went wrong. The issue has been reported to our development
          team. Please reload the page and try again.
        </Typography>
      </Paper>
    ) : (
      this.props.children
    );
  }
}

export default connect(null, mapDispatchToProps)(ErrorBoundary);
