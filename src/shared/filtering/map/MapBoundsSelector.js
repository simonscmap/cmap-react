import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useMapBoundsSelector from './useMapBoundsSelector';
import MapToolbar from './MapToolbar';
import colors from '../../../enums/colors';

const MAP_SIZE = 530;
const MAP_WKID = 3857;
const SPATIAL_REFERENCE = { wkid: MAP_WKID };

const mapWidth = MAP_SIZE;
const mapHeight = MAP_SIZE;

const useStyles = makeStyles((theme) => ({
  mapWrapper: {
    position: 'relative',
    width: mapWidth,
    height: mapHeight,
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
    width: mapWidth,
    height: mapHeight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: 4,
    border: '1px solid ' + theme.palette.divider,
  },
  errorContainer: {
    width: mapWidth,
    height: mapHeight,
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
  toolbarOrientation,
}) => {
  let classes = useStyles();
  let mapContainerRef = useRef(null);
  let initRef = useRef(false);

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
    spatialReference: SPATIAL_REFERENCE,
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
    <Box className={classes.mapWrapper}>
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
