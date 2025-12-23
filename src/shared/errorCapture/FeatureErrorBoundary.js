import React from 'react';
import { captureError } from './index';

class FeatureErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    captureError(error, {
      feature: this.props.featureName,
      componentStack: errorInfo.componentStack,
      errorType: 'sync_render',
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return null;
    }

    return this.props.children;
  }
}

export default FeatureErrorBoundary;
