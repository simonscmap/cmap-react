import { withStyles } from '@material-ui/core/styles';
import { Delete } from '@material-ui/icons';
import React from 'react';
import { connect } from 'react-redux';
import { closeChart } from '../../../../Redux/actions/visualization';
import { chartsCloseChartStyles } from '../chartStyles';
import ControlButtonTemplate from './ControlButtonTemplate';

const mapDispatchToCloseChartProps = {
  closeChart,
};

const CloseChartIcon = (props) => {
  const { chartIndex, closeChart } = props;

  return (
    <ControlButtonTemplate
      tooltipContent={'Close Chart'}
      onClick={() => closeChart(chartIndex)}
      icon={Delete}
    />
  );
};

export default connect(
  null,
  mapDispatchToCloseChartProps,
)(withStyles(chartsCloseChartStyles)(CloseChartIcon));
