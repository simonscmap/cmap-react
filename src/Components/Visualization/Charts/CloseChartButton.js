import { IconButton } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Delete } from '@material-ui/icons';
import React from 'react';
import { connect } from 'react-redux';
import { closeChart } from '../../../Redux/actions/visualization';
import { chartsCloseChartStyles } from './chartStyles';

const mapDispatchToCloseChartProps = {
  closeChart,
};

const CloseChartIcon = (props) => {
  const { chartIndex, classes, closeChart } = props;

  return (
    <React.Fragment>
      <IconButton
        className={classes.closeChartIcon}
        color="inherit"
        onClick={() => closeChart(chartIndex)}
        disableFocusRipple
        disableRipple
      >
        <Delete />
      </IconButton>
    </React.Fragment>
  );
};

export default connect(
  null,
  mapDispatchToCloseChartProps,
)(withStyles(chartsCloseChartStyles)(CloseChartIcon));
