import { Grid, Slider, TextField, Typography } from '@material-ui/core';
import React from 'react';
import styles from './styles/subsetControlStyles';
import logInit from '../../Services/log-service';
import { emptyStringOrNumber } from './dateHelpers';

const log = logInit('LongitudeSubsetControl').addContext({
  src: 'shared/filtering/LongitudeSubsetControl',
});

const LongitudeControl = (props) => {
  let { lonMin, lonMax, subsetState, setLonStart, setLonEnd } = props;
  let { lonStart, lonEnd } = subsetState;

  // handler for the slider
  let handleSlider = (e, value) => {
    let [start, end] = value;
    log.debug('handleSlider', { e: e.target.value, value });
    setLonStart(start);
    setLonEnd(end);
  };

  let handleSetStart = (e) => {
    log.debug('handleSetStart', { value: e.target.value });
    let newLonStart = emptyStringOrNumber(e.target.value);
    setLonStart(newLonStart);
  };

  let handleSetEnd = (e) => {
    log.debug('handleSetEnd', { value: e.target.value });
    let newLonEnd = emptyStringOrNumber(e.target.value);
    setLonEnd(newLonEnd);
  };

  let title = 'Longitude[\xB0]'; // Longitude[{'\xB0'}]

  return (
    <React.Fragment>
      <Grid container style={styles.formGrid}>
        <Grid item xs={12} md={4}>
          <Typography style={styles.formLabel}>{title}</Typography>
        </Grid>

        <Grid item xs={6} md={4}>
          <TextField
            label="Start"
            type="number"
            inputProps={{
              step: 0.1,
              min: Math.floor(lonMin * 10) / 10,
              max: Math.ceil(lonMax * 10) / 10,
              className: styles.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            value={lonStart}
            onChange={handleSetStart}
          />
        </Grid>

        <Grid item xs={6} md={4}>
          <TextField
            label="End"
            type="number"
            inputProps={{
              step: 0.1,
              min: Math.floor(lonMin * 10) / 10,
              max: Math.ceil(lonMax * 10) / 10,
              className: styles.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            value={lonEnd}
            onChange={handleSetEnd}
          />
        </Grid>
      </Grid>

      <Slider
        min={Math.floor(lonMin * 10) / 10}
        max={Math.ceil(lonMax * 10) / 10}
        step={0.1}
        value={[
          typeof lonStart === 'number' ? lonStart : -90,
          typeof lonEnd === 'number' ? lonEnd : 90,
        ]}
        onChange={handleSlider}
        classes={{
          valueLabel: styles.sliderValueLabel,
          thumb: styles.sliderThumb,
          markLabel: styles.markLabel,
        }}
        style={styles.slider}
        disabled={lonMin === lonMax}
        marks={[
          {
            value: Math.floor(lonMin * 10) / 10,
            label: `${Math.floor(lonMin * 10) / 10}`,
          },
          {
            value: Math.ceil(lonMax * 10) / 10,
            label: `${Math.ceil(lonMax * 10) / 10}`,
          },
        ]}
      />
    </React.Fragment>
  );
};

export default LongitudeControl;
