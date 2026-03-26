import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useMapBoundsSelector from './useMapBoundsSelector';
import MapToolbar from './MapToolbar';
import { MAP_ASPECT_RATIO } from './mapConfig';
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
  onBoundsChange,
  onBoundsPreview,
  toolbarOrientation,
  redrawRef,
  responsive,
}) => {
  let classes = useStyles();
  let mapContainerRef = useRef(null);
  let initRef = useRef(false);
  let measureRef = useRef(null);
  let [measuredWidth, setMeasuredWidth] = useState(null);

  useEffect(function () {
    if (!responsive) return;
    let el = measureRef.current;
    if (!el) return;
    let observer = new ResizeObserver(function (entries) {
      let width = Math.floor(entries[0].contentRect.width);
      if (width > 0) {
        setMeasuredWidth(width);
      }
    });
    observer.observe(el);
    return function () { observer.disconnect(); };
  }, [responsive]);

  let effectiveWidth = responsive && measuredWidth !== null ? Math.min(measuredWidth, mapWidth) : mapWidth;
  let effectiveHeight = Math.round(effectiveWidth / MAP_ASPECT_RATIO);

  let {
    loading,
    error,
    mode,
    atMinZoom,
    initializeView,
    setMode,
    zoomIn,
    zoomOut,
    redrawGraphic,
  } = useMapBoundsSelector({
    latStart,
    latEnd,
    lonStart,
    lonEnd,
    setLatStart,
    setLatEnd,
    setLonStart,
    setLonEnd,
    onBoundsChange,
    onBoundsPreview,
  });

  if (redrawRef) {
    redrawRef.current = redrawGraphic;
  }

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

  let sizeStyle = { width: effectiveWidth, height: effectiveHeight };

  let content;
  if (loading) {
    content = (
      <Box className={classes.loadingContainer} style={sizeStyle}>
        <CircularProgress size={40} />
      </Box>
    );
  } else if (error) {
    content = (
      <Box className={classes.errorContainer} style={sizeStyle}>
        <Typography color="error">
          Failed to load map: {error.message}
        </Typography>
      </Box>
    );
  } else {
    content = (
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
  }

  if (!responsive) {
    return content;
  }

  return (
    <Box ref={measureRef} style={{ width: '100%', maxWidth: mapWidth }}>
      {measuredWidth !== null ? content : null}
    </Box>
  );
};

MapBoundsSelector.propTypes = {
  mapWidth: PropTypes.number.isRequired,
  latStart: PropTypes.number.isRequired,
  latEnd: PropTypes.number.isRequired,
  lonStart: PropTypes.number.isRequired,
  lonEnd: PropTypes.number.isRequired,
  setLatStart: PropTypes.func,
  setLatEnd: PropTypes.func,
  setLonStart: PropTypes.func,
  setLonEnd: PropTypes.func,
  onBoundsChange: PropTypes.func,
  onBoundsPreview: PropTypes.func,
  toolbarOrientation: PropTypes.oneOf(['vertical', 'horizontal']),
  redrawRef: PropTypes.object,
  responsive: PropTypes.bool,
};

MapBoundsSelector.defaultProps = {
  toolbarOrientation: 'vertical',
  responsive: false,
};

export default MapBoundsSelector;
