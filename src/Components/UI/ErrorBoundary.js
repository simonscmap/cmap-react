// Catches uncaught errors in front end and transmits to api

import React from 'react';
import { connect } from 'react-redux';
import { Paper, Typography } from '@material-ui/core';

import parseError from '../../Utility/parseError';
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
    const { errorMessage, browserInfo, osInfo, stackFirstLine, location } =
      parseError(error);
    this.props.errorReportSend(
      errorMessage,
      browserInfo,
      osInfo,
      stackFirstLine,
      location,
    );
  }

  render() {
    return this.state.caughtError ? (
      <Paper
        style={{ margin: '90px auto', width: '60vw', padding: '16px' }}
        elevation={4}
      >
        <img
          src="/images/home/simons-cmap-logo-full.svg"
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
