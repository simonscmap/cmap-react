import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, MenuItem, Typography } from '@material-ui/core';
import useCompactRangeInputStyles from '../../hooks/useCompactRangeInputStyles';
import { dateToMonth, monthPairToDates, getMonthRangeMessage, CLIMATOLOGY_TOOLTIP_TEXT } from '../../utils/dateHelpers';
import ValidationMessages from '../../../components/ValidationMessages';
import InfoTooltip from '../../../components/InfoTooltip';
import zIndex from '../../../../enums/zIndex';

let MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const CompactMonthRangeInput = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) => {
  const classes = useCompactRangeInputStyles();

  let [startMonth, setStartMonth] = useState(() => dateToMonth(startDate));
  let [endMonth, setEndMonth] = useState(() => dateToMonth(endDate));

  useEffect(() => {
    setStartMonth(dateToMonth(startDate));
  }, [startDate]);

  useEffect(() => {
    setEndMonth(dateToMonth(endDate));
  }, [endDate]);

  let handleStartChange = (e) => {
    let newStart = Number(e.target.value);
    setStartMonth(newStart);
    let dates = monthPairToDates(newStart, endMonth);
    setStartDate(dates.startDate);
    setEndDate(dates.endDate);
  };

  let handleEndChange = (e) => {
    let newEnd = Number(e.target.value);
    setEndMonth(newEnd);
    let dates = monthPairToDates(startMonth, newEnd);
    setStartDate(dates.startDate);
    setEndDate(dates.endDate);
  };

  return (
    <Box className={classes.container}>
      <Typography variant="body2" className={classes.sectionTitle}>
        TEMPORAL BOUNDS
      </Typography>

      <Box className={classes.inputRow}>
        <Box className={classes.inputWrapper}>
          <TextField
            select
            size="small"
            variant="outlined"
            label="Start Month"
            value={startMonth}
            onChange={handleStartChange}
            className={classes.textField}
            InputLabelProps={{ shrink: true }}
            SelectProps={{ MenuProps: { style: { zIndex: zIndex.MODAL_LAYER_1_POPPER } } }}
          >
            {MONTHS.map(function (m) {
              return (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              );
            })}
          </TextField>
        </Box>
        <Box className={classes.inputWrapper}>
          <TextField
            select
            size="small"
            variant="outlined"
            label="End Month"
            value={endMonth}
            onChange={handleEndChange}
            className={classes.textField}
            InputLabelProps={{ shrink: true }}
            SelectProps={{ MenuProps: { style: { zIndex: zIndex.MODAL_LAYER_1_POPPER } } }}
          >
            {MONTHS.map(function (m) {
              return (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              );
            })}
          </TextField>
        </Box>
      </Box>
      <ValidationMessages
        messages={[
          { type: 'info', text: getMonthRangeMessage(startMonth, endMonth), suffix: React.createElement(InfoTooltip, { title: CLIMATOLOGY_TOOLTIP_TEXT }) },
        ]}
        maxMessages={1}
      />
    </Box>
  );
};

CompactMonthRangeInput.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  setStartDate: PropTypes.func.isRequired,
  setEndDate: PropTypes.func.isRequired,
};

export default CompactMonthRangeInput;
