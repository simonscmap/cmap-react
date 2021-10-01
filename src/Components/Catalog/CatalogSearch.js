// In order to have addressable searches, this component modifies the location querystring in response
// to user interaction. The search results component reads the query string and calls the API to search

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { withStyles } from '@material-ui/core';
import {
  Link,
  Typography,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  TextField,
  InputAdornment,
  Paper,
  Button,
  Grid,
} from '@material-ui/core';
import catalogIntro from './help/intro';
import { Search } from '@material-ui/icons';
import { debounce } from 'throttle-debounce';
import MultiCheckboxDropdown from '../UI/MultiCheckboxDropdown';
import queryString from 'query-string';
import colors from '../../enums/colors';
import Intro from '../Help/Intro';

const mapStateToProps = (state) => {
  let { submissionOptions, catalogLayoutNonce, hints } = state;
  return {
    submissionOptions,
    layoutNonce: catalogLayoutNonce,
    hints,
  };
};

const styles = (theme) => ({
  searchPaper: {
    padding: '14px 20px',
    maxHeight: 'calc(100vh - 200px)',
    overflow: 'auto',
  },
  resetButton: {
    textTransform: 'none',
    width: '160px',
    height: '37px',
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    marginTop: '12px',
  },
  searchPanelRow: {
    marginTop: '10px',
  },
  formControl: {
    width: '90%',
    marginBottom: '6px',
  },
  searchSectionHeader: {
    color: theme.palette.primary.main,
    textAlign: 'left',
    marginBottom: '8px',
  },
  showAdditionalFiltersWrapper: {
    textAlign: 'left',
    marginTop: '12px',
    width: '100%',
  },
});

const defaultState = {
  keywords: '',
  hasDepth: 'any',
  timeStart: '1900-01-01',
  timeEnd: new Date().toISOString().slice(0, 10),
  latStart: -90,
  latEnd: 90,
  lonStart: -180,
  lonEnd: 180,
  sensor: new Set(),
  make: new Set(),
  region: new Set(),
};
class CatalogSearch extends React.Component {
  locationSearch = this.props.location.search;

  constructor(props) {
    super(props);
    this.state = { ...defaultState, showAdditionalFilters: false };
  }

  componentDidMount = () => {
    this.RefreshByQuerystring();
  };

  componentDidUpdate = () => {
    if (this.locationSearch !== this.props.location.search) {
      this.locationSearch = this.props.location.search;
      this.RefreshByQuerystring();
    }
  };

  RefreshByQuerystring = () => {
    if (this.props.location.search) {
      let params = queryString.parse(this.props.location.search);

      ['region', 'sensor', 'make'].forEach(
        (s) =>
          (params[s] = typeof params[s] === 'string' ? [params[s]] : params[s]),
      );
      let newState = {
        ...params,
        sensor: new Set(params.sensor || []),
        region: new Set(params.region || []),
        make: new Set(params.make || []),
        keywords:
          typeof params.keywords === 'string'
            ? params.keywords
            : params.keywords.join(' '),
      };
      this.setState({ ...newState });
    } else {
      this.setState({ ...defaultState });
    }
  };

  handleToggleshowAdditionalFilters = () => {
    this.setState({
      showAdditionalFilters: !this.state.showAdditionalFilters,
    });
  };

  handleChangeSearchValue = (e) => {
    const target = e.target.name;
    const value = e.target.value;

    let newState = { ...this.state, [target]: value };

    this.setState(newState);

    let qstring = queryString.stringify({
      keywords: newState.keywords.split(' '),
      hasDepth: newState.hasDepth,
      timeStart: newState.timeStart,
      timeEnd: newState.timeEnd,
      latStart: newState.latStart,
      latEnd: newState.latEnd,
      lonStart: newState.lonStart,
      lonEnd: newState.lonEnd,
      sensor: Array.from(newState.sensor),
      region: Array.from(newState.region),
      make: Array.from(newState.make),
    });

    this.pushHistory(qstring);
  };

  handleClickCheckbox = (e, checked) => {
    let [column, value] = e.target.name.split('!!');
    let newSet = new Set(this.state[column]);

    if (checked) {
      newSet.add(value);
    } else {
      newSet.delete(value);
    }

    this.handleChangeSearchValue({ target: { name: column, value: newSet } });
  };

  handleResetSearch = () => {
    // TODO: unclear what the side effect may be for not including props
    this.setState({ ...defaultState });
    this.props.history.push('/catalog');
  };

  handleClearMultiSelect = (statePiece) => {
    this.handleChangeSearchValue({
      target: { name: statePiece, value: new Set() },
    });
  };

  pushHistory = debounce(1500, (qstring) => {
    this.props.history.push('/catalog?' + qstring);
  });

  /* refreshHints usese the intro.js api, which is only available via the ref,
   * to reposition the hint "beacons"; this is necessary when the layout may
   * have changed, a is the beacons are positioned absolutely */
  refreshHints = (hintsRef, currentNonce) => {
    // hintsRef returns null every other render
    if (hintsRef && this.state.previousNonce !== currentNonce) {
      // refresh hints location

      // TODO: this call into the refresh API seems to race against a rerender
      // of the tooltipLayer, causing a null pointer exception
      // hintsRef.introJs.refresh();

      // udpate component state with new nonce
      this.setState({
        previousNonce: currentNonce,
      });
    }
  };

  render = () => {
    const { classes, submissionOptions } = this.props;
    const {
      keywords,
      hasDepth,
      timeStart,
      timeEnd,
      latStart,
      latEnd,
      lonStart,
      lonEnd,
      make,
      sensor,
      region,
    } = this.state;

    return (
      <>
        <Intro config={catalogIntro} />

        <Paper elevation={4} className={classes.searchPaper}>
          <Grid container justify="center" alignItems="center">
            <Grid item xs={12}>
              <TextField
                autoFocus
                name="keywords"
                placeholder="Search"
                InputProps={{
                  startAdornment: (
                    <React.Fragment>
                      <InputAdornment position="start">
                        <Search style={{ color: colors.primary }} />
                      </InputAdornment>
                    </React.Fragment>
                  ),
                }}
                value={keywords}
                variant="outlined"
                onChange={this.handleChangeSearchValue}
                fullWidth
                id="catSearch"
              />

              <div id="catSearchOptions">
                <MultiCheckboxDropdown
                  options={submissionOptions.Make}
                  id={'make-control'}
                  selectedOptions={make}
                  handleClear={() => this.handleClearMultiSelect('make')}
                  parentStateKey={'make'}
                  handleClickCheckbox={this.handleClickCheckbox}
                  groupHeaderLabel="Makes"
                />

                <MultiCheckboxDropdown
                  options={submissionOptions.Sensor}
                  selectedOptions={sensor}
                  handleClear={() => this.handleClearMultiSelect('sensor')}
                  parentStateKey={'sensor'}
                  handleClickCheckbox={this.handleClickCheckbox}
                  groupHeaderLabel="Sensors"
                />

                <MultiCheckboxDropdown
                  options={submissionOptions.Region}
                  selectedOptions={region}
                  handleClear={() => this.handleClearMultiSelect('region')}
                  parentStateKey={'region'}
                  handleClickCheckbox={this.handleClickCheckbox}
                  groupHeaderLabel="Regions"
                />

                <div className={classes.showAdditionalFiltersWrapper}>
                  <Link
                    component="button"
                    onClick={this.handleToggleshowAdditionalFilters}
                    id="catSearchBySpaceTime"
                  >
                    {this.state.showAdditionalFilters
                      ? 'Hide Additional Filters'
                      : 'Show Additional Filters'}
                  </Link>
                </div>

                {this.state.showAdditionalFilters ? (
                  <>
                    <Grid
                      item
                      container
                      xs={12}
                      className={classes.searchPanelRow}
                    >
                      <Grid item xs={12}>
                        <Typography className={classes.searchSectionHeader}>
                          Temporal Coverage
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          name="timeStart"
                          className={classes.formControl}
                          id="date"
                          label="Start Date"
                          type="date"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          value={timeStart}
                          onChange={this.handleChangeSearchValue}
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <TextField
                          name="timeEnd"
                          className={classes.formControl}
                          id="date"
                          label="End Date"
                          type="date"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          value={timeEnd}
                          onChange={this.handleChangeSearchValue}
                        />
                      </Grid>
                    </Grid>

                    <Grid
                      item
                      container
                      xs={12}
                      className={classes.searchPanelRow}
                      style={{ marginTop: '14px' }}
                    >
                      <Grid item xs={12}>
                        <Typography
                          className={classes.searchSectionHeader}
                          style={{ marginBottom: 0 }}
                        >
                          Spatial Coverage
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <TextField
                          name="latStart"
                          className={classes.formControl}
                          label="Lat Start&deg;"
                          type="number"
                          inputProps={{
                            min: -90,
                            max: 90,
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          value={latStart}
                          onChange={this.handleChangeSearchValue}
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <TextField
                          name="latEnd"
                          className={classes.formControl}
                          label="Lat End&deg;"
                          type="number"
                          inputProps={{
                            min: -90,
                            max: 90,
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          value={latEnd}
                          onChange={this.handleChangeSearchValue}
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <TextField
                          name="lonStart"
                          className={classes.formControl}
                          label="Lon Start&deg;"
                          type="number"
                          inputProps={{
                            min: -180,
                            max: 180,
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          value={lonStart}
                          onChange={this.handleChangeSearchValue}
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <TextField
                          name="lonEnd"
                          className={classes.formControl}
                          label="Lon End&deg;"
                          type="number"
                          inputProps={{
                            min: -180,
                            max: 180,
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          value={lonEnd}
                          onChange={this.handleChangeSearchValue}
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <FormControl className={classes.formControl}>
                          <FormHelperText>Depth Levels</FormHelperText>
                          <Select
                            value={hasDepth}
                            onChange={this.handleChangeSearchValue}
                            name="hasDepth"
                          >
                            <MenuItem value="any">Any</MenuItem>
                            <MenuItem value="yes">Multiple Levels</MenuItem>
                            <MenuItem value="no">Surface Only</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  ''
                )}
              </div>
            </Grid>

            <Grid item xs={12} className={classes.searchPanelRow}>
              <Button
                variant="outlined"
                onClick={this.handleResetSearch}
                className={classes.resetButton}
                id="catSearchReset"
              >
                Reset Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </>
    );
  };
}

export default connect(mapStateToProps)(
  withStyles(styles)(withRouter(CatalogSearch)),
);
