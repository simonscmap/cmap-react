// Select viz type and create viz button
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tooltip,
} from '@material-ui/core';
import MUISelect from '@material-ui/core/Select';
import vizSubTypes from '../../../enums/visualizationSubTypes';
import colors from '../../../enums/colors';
import Hint from '../../Navigation/Help/Hint';
import SelectChartTypeHint from '../help/SelectChartTypeHint';
import CreateVisualizationHint from '../help/CreateVisualizationHint';

const styles = (theme) => ({
  vizTypeSelectFormControl: {
    marginTop: '10px',
    width: '100%',
    '&:disabled': {
      // backgroundColor: 'transparent',
      color: theme.palette.primary.light,

    },
    '& svg': {
      color: theme.palette.primary.light,
      '&.Mui-disabled': {
        color: theme.palette.primary.light,
      }
    }
  },
  vizTypeMenu: {
    // backgroundColor: colors.backgroundGray,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(3px)',
  },
  vizTypeMenuItem: {
    '&:hover': { backgroundColor: colors.greenHover },
  },
  visualizeButton: {
    marginTop: '10px',
    textTransform: 'none',
    height: '56px',
    width: '100%',
    borderRadius: '5px',
    // backgroundColor: colors.backgroundGray,
    background: theme.palette.primary.main,
    // color: theme.palette.primary.main,
    color: 'black',
    fontVariant: 'normal',
    '&:disabled': {
      color: '#333',
      backgroundColor: 'transparent',
    },
    '&:hover': {
      backgroundColor: colors.greenHover,
      color: 'white',
    },
  },
  vizButtonTooltip: {
    color: 'yellow',
  },
});

const ChartControl = (props) => {
  const {
    classes,
    overrideDisabledStyle,
    heatmapMessage,
    contourMessage,
    sectionMapMessage,
    histogramMessage,
    timeSeriesMessage,
    depthProfileMessage,
    sparseMapMessage,
    visualizeButtonTooltip,
    disableVisualizeMessage,
    selectedVizType,
    handleChangeInputValue,
    handleVisualize,
    disabled,
  } = props;

  return (
    <React.Fragment>
      <Grid container>
        <Grid item xs={12}>
          <Hint
            content={SelectChartTypeHint}
            position={{ beacon: 'right', hint: 'bottom-end' }}
            size={'medium'}
          >
            <FormControl
              variant="outlined"
              className={classes.vizTypeSelectFormControl}
            >
              <InputLabel
                shrink
                htmlFor="vizSelector"
              >
                Select Chart Type
              </InputLabel>
              <MUISelect
                disabled={disabled}
                className={classes.vizTypeSelectFormControl}
                style={overrideDisabledStyle}
                value={selectedVizType}
                variant="filled"
                onChange={handleChangeInputValue}
                inputProps={{
                  name: 'selectedVizType',
                  id: 'vizSelector',
                  variant: 'filled',
                }}
                MenuProps={{
                  MenuListProps: {
                    className: classes.vizTypeMenu,
                  },
                }}
              >
                {!heatmapMessage && (
                  <MenuItem
                    className={classes.vizTypeMenuItem}
                    value={vizSubTypes.heatmap}
                    title={heatmapMessage}
                  >
                    Heatmap
                  </MenuItem>
                )}
                {!contourMessage && (
                  <MenuItem
                    className={classes.vizTypeMenuItem}
                    value={vizSubTypes.contourMap}
                  >
                    Contour Heatmap
                  </MenuItem>
                )}
                {!sectionMapMessage && (
                  <MenuItem
                    className={classes.vizTypeMenuItem}
                    value={vizSubTypes.sectionMap}
                  >
                    Section Map
                  </MenuItem>
                )}
                {!sectionMapMessage && (
                  <MenuItem
                    className={classes.vizTypeMenuItem}
                    value={vizSubTypes.contourSectionMap}
                  >
                    Contour Section Map
                  </MenuItem>
                )}
                {!histogramMessage && (
                  <MenuItem
                    className={classes.vizTypeMenuItem}
                    value={vizSubTypes.histogram}
                  >
                    Histogram
                  </MenuItem>
                )}
                {!timeSeriesMessage && (
                  <MenuItem
                    className={classes.vizTypeMenuItem}
                    value={vizSubTypes.timeSeries}
                  >
                    Time Series
                  </MenuItem>
                )}
                {!depthProfileMessage && (
                  <MenuItem
                    className={classes.vizTypeMenuItem}
                    value={vizSubTypes.depthProfile}
                  >
                    Depth Profile
                  </MenuItem>
                )}
                {!sparseMapMessage && (
                  <MenuItem
                    className={classes.vizTypeMenuItem}
                    value={vizSubTypes.sparse}
                  >
                    Time and Space Plots
                  </MenuItem>
                )}
              </MUISelect>
            </FormControl>
          </Hint>
        </Grid>

        <Hint
          content={CreateVisualizationHint}
          position={{ beacon: 'bottom', hint: 'bottom-end' }}
          size={'medium'}
          styleOverride={{ wrapper: { width: '100%' } }}
        >
          <Tooltip
            placement="right"
            title={visualizeButtonTooltip}
            className={classes.vizButtonTooltip}
          >
            <Grid item xs={12} style={{ width: '100%' }}>
              <Button
                className={classes.visualizeButton}
                variant="contained"
                onClick={() => handleVisualize()}
                disabled={
                  Boolean(disableVisualizeMessage) ||
                  !selectedVizType ||
                  disabled
                }
                fullwidth="true"
              >
                Create Visualization
              </Button>
            </Grid>
          </Tooltip>
        </Hint>
      </Grid>
    </React.Fragment>
  );
};

export default withStyles(styles)(ChartControl);
