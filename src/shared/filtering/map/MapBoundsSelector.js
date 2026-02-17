import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useMapBoundsSelector, { MODE_SELECT } from './useMapBoundsSelector';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    width: '100%',
  },
  mapWrapper: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
    overflow: 'hidden',
    border: '1px solid ' + theme.palette.divider,
  },
  buttonOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  drawButton: {
    backgroundColor: 'rgba(15, 45, 66, 0.9)',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: 'rgba(15, 45, 66, 1)',
    },
  },
  loadingContainer: {
    width: '100%',
    height: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: 4,
    border: '1px solid ' + theme.palette.divider,
  },
  errorContainer: {
    width: '100%',
    height: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: 4,
    border: '1px solid ' + theme.palette.error.main,
    padding: theme.spacing(2),
  },
}));

const MapBoundsSelector = ({
  latStart,
  latEnd,
  lonStart,
  lonEnd,
  setLatStart,
  setLatEnd,
  setLonStart,
  setLonEnd,
}) => {
  let classes = useStyles();
  let mapContainerRef = useRef(null);
  let initRef = useRef(false);

  let { loading, error, mode, initializeView, setMode } = useMapBoundsSelector({
    latStart,
    latEnd,
    lonStart,
    lonEnd,
    setLatStart,
    setLatEnd,
    setLonStart,
    setLonEnd,
  });

  useEffect(() => {
    if (!loading && !error && mapContainerRef.current && !initRef.current) {
      initRef.current = true;
      initializeView(mapContainerRef.current);
    }
  }, [loading, error, initializeView]);

  let handleDrawClick = () => {
    setMode(MODE_SELECT);
  };

  if (loading) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={classes.errorContainer}>
        <Typography color="error">
          Failed to load map: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Box className={classes.mapWrapper}>
        <Box ref={mapContainerRef} className={classes.mapContainer} />
        <Box className={classes.buttonOverlay}>
          <Button
            variant="contained"
            size="small"
            className={classes.drawButton}
            onClick={handleDrawClick}
            disabled={mode === MODE_SELECT}
          >
            {mode === MODE_SELECT ? 'Drawing...' : 'Draw Selection'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

MapBoundsSelector.propTypes = {
  latStart: PropTypes.number.isRequired,
  latEnd: PropTypes.number.isRequired,
  lonStart: PropTypes.number.isRequired,
  lonEnd: PropTypes.number.isRequired,
  setLatStart: PropTypes.func.isRequired,
  setLatEnd: PropTypes.func.isRequired,
  setLonStart: PropTypes.func.isRequired,
  setLonEnd: PropTypes.func.isRequired,
};

export default MapBoundsSelector;
