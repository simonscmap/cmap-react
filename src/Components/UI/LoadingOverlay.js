import React from 'react';
import Spinner from './Spinner';
import z from '../../enums/zIndex';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  loader: {
    backgroundColor: '#000000',
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    zIndex: z.LOADING_OVERLAY,
  },
});

const LoadingOverlay = withStyles(styles)((props) => {
  const { classes, loadingMessage } = props;

  if (loadingMessage && loadingMessage.length) {
    return (
      <div className={classes.loader}>
        <Spinner message={loadingMessage} />
      </div>
    );
  } else {
    return '';
  }
});

export default LoadingOverlay;
