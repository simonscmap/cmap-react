import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useMapBoundsSelector from './useMapBoundsSelector';
import MapToolbar from './MapToolbar';
import colors from '../../../enums/colors';

const useStyles = makeStyles((theme) => ({
  mapWrapper: {
    position: 'relative',
    overflow: 'hidden',
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
    backgroundColor: colors.darkBlue,
  },
  toolbarOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 1,
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: 4,
    border: '1px solid ' + theme.palette.divider,
  },
  errorContainer: {
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
  mapWidth,
  latStart,
  latEnd,
  lonStart,
  lonEnd,
  setLatStart,
  setLatEnd,
  setLonStart,
  setLonEnd,
  toolbarOrientation,
}) => {
  let classes = useStyles();
  let mapContainerRef = useRef(null);
  let initRef = useRef(false);
  let mapHeight = Math.round(mapWidth / 2);

  let {
    loading,
    error,
    mode,
    atMinZoom,
    initializeView,
    setMode,
    zoomIn,
    zoomOut,
  } = useMapBoundsSelector({
    latStart,
    latEnd,
    lonStart,
    lonEnd,
    setLatStart,
    setLatEnd,
    setLonStart,
    setLonEnd,
  });

  let cleanupRef = useRef(null);

  useEffect(() => {
    if (!loading && !error && mapContainerRef.current && !initRef.current) {
      initRef.current = true;
      cleanupRef.current = initializeView(mapContainerRef.current);
    }
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [loading, error, initializeView]);

  let sizeStyle = { width: mapWidth, height: mapHeight };

  if (loading) {
    return (
      <Box className={classes.loadingContainer} style={sizeStyle}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={classes.errorContainer} style={sizeStyle}>
        <Typography color="error">
          Failed to load map: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.mapWrapper} style={sizeStyle}>
      <Box ref={mapContainerRef} className={classes.mapContainer} />
      <Box className={classes.toolbarOverlay}>
        <MapToolbar
          orientation={toolbarOrientation}
          mode={mode}
          onModeChange={setMode}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          zoomOutDisabled={atMinZoom}
        />
      </Box>
    </Box>
  );
};

MapBoundsSelector.propTypes = {
  mapWidth: PropTypes.number.isRequired,
  latStart: PropTypes.number.isRequired,
  latEnd: PropTypes.number.isRequired,
  lonStart: PropTypes.number.isRequired,
  lonEnd: PropTypes.number.isRequired,
  setLatStart: PropTypes.func.isRequired,
  setLatEnd: PropTypes.func.isRequired,
  setLonStart: PropTypes.func.isRequired,
  setLonEnd: PropTypes.func.isRequired,
  toolbarOrientation: PropTypes.oneOf(['vertical', 'horizontal']),
};

MapBoundsSelector.defaultProps = {
  toolbarOrientation: 'vertical',
};

export default MapBoundsSelector;
