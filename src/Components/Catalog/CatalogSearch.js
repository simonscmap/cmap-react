// In order to have addressable searches, this component modifies the location querystring in response
// to user interaction. The search results component reads the query string and calls the API to search

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { withStyles } from '@material-ui/core';
import {
  Chip,
  Grid,
  InputAdornment,
  makeStyles,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import { Search } from '@material-ui/icons';
import FilterListIcon from '@material-ui/icons/FilterList';
import { debounce } from 'throttle-debounce';
import queryString from 'query-string';
import colors from '../../enums/colors';
import Hint from '../Navigation/Help/Hint';
import SearchHint from './help/keywordSearchHint';
import CatalogPageTitleHint from './help/pageTitleHint';
import SortingControls from './SortingControls';
import initLogger from '../../Services/log-service';
import styles from './searchPanelStyles';
// New Drop Down
import { CheckboxSet } from '../UI/DropDown';
import { TemporalCoverageOptions } from './TemporalCoverageOptions';
import { SpatialCoverageOptions } from './SpatialCoverageOptions';

const log = initLogger('CatalogSearch.js');

const mapStateToProps = (state) => {
  let { submissionOptions, hints } = state;
  return {
    submissionOptions,
    hints,
  };
};

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
  dataFeatures: new Set(),
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
    // log.debug ('RefreshByQueryString', { params: queryString.parse(this.props.location.search) });
    if (this.props.location.search) {
      // "params" are selected filters
      let params = queryString.parse(this.props.location.search);

      // convert string values to array values
      ['region', 'sensor', 'make', 'dataFeatures'].forEach((filterKey) => {
        params[filterKey] =
          typeof params[filterKey] === 'string'
            ? [params[filterKey]]
            : params[filterKey];
      });
      let newState = {
        ...params,
        sensor: new Set(params.sensor || []),
        region: new Set(params.region || []),
        make: new Set(params.make || []),
        dataFeatures: new Set(params.dataFeatures || []),
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
    this.props.setIsExpanded(!this.state.showAdditionalFilters);
    this.setState({
      showAdditionalFilters: !this.state.showAdditionalFilters,
    });
  };

  handleChangeSearchValue = (e) => {
    const target = e.target.name;
    const value = e.target.value;

    let newState = { ...this.state, [target]: value };

    // log.debug ('handleChangeSearchValue', { target, value });

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
      dataFeatures: Array.from(newState.dataFeatures),
    });

    // log.debug ('push history', { qstring });

    // update the browser url
    this.pushHistory(qstring);
  };

  handleClickCheckbox = (e, checked) => {
    let [column, value] = e.target.name.split('!!');
    log.debug('handleClickCheckbox', {
      column,
      value,
      targetName: e.target.name,
    });
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

  // TODO :(
  pushHistory = debounce(1500, (qstring) => {
    this.props.history.push('/catalog?' + qstring);
  });

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
      dataFeatures,
    } = this.state;

    // log.debug ('state', { dataFeatures, submissionOptions });

    const setToChips = (key) => (s) =>
      Array.from(s).map((val, i) => (
        <Chip
          key={`chip${i}`}
          size="medium"
          variant="outlined"
          label={val}
          onDelete={() => {
            this.handleClickCheckbox(
              { target: { name: `${key}!!${val}` } },
              false,
            );
          }}
          color="primary"
        />
      ));

    const chips = setToChips('make')(make)
      .concat(setToChips('sensor')(sensor))
      .concat(setToChips('region')(region))
      .concat(setToChips('dataFeatures')(dataFeatures));

    return (
      <div className={classes.divWrapper}>
        <Paper elevation={4} className={classes.searchPaper}>
          <Grid container justifyContent="center" alignItems="center">
            <Grid item xs={12}>
              <div className={classes.searchContainer}>
                <div className={classes.searchTextInputContainer}>
                  <Hint
                    content={SearchHint}
                    position={{ beacon: 'right', hint: 'bottom-end' }}
                    size={'large'}
                    styleOverride={{}}
                  >
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
                      className={classes.root}
                    />
                  </Hint>
                </div>
                <Tooltip
                  title={
                    this.state.showAdditionalFilters
                      ? 'Collapse Filter Controls'
                      : 'Show Filter Controls'
                  }
                >
                  <ToggleButton
                    value="check"
                    id="additional-filters-button"
                    selected={this.state.showAdditionalFilters}
                    onChange={this.handleToggleshowAdditionalFilters}
                    classes={{ root: classes.filtersRoot }}
                  >
                    <FilterListIcon />
                  </ToggleButton>
                </Tooltip>
                <SortingControls />
                {chips}
              </div>

              {this.state.showAdditionalFilters && (
                <div className={classes.scrollingOptionsContainer}>
                  <div
                    className={classes.searchOptionsContainer}
                    id="catSearchOptions"
                  >
                    <FilterCard title={'Data Features'}>
                      <CheckboxSet
                        options={submissionOptions.DataFeatures}
                        selected={dataFeatures}
                        groupPrefix={'dataFeatures'}
                        handleClickCheckbox={this.handleClickCheckbox}
                      />
                    </FilterCard>

                    <FilterCard title={'Makes'}>
                      <CheckboxSet
                        options={submissionOptions.Make}
                        selected={make}
                        groupPrefix={'make'}
                        handleClickCheckbox={this.handleClickCheckbox}
                      />
                    </FilterCard>

                    <FilterCard title={'Sensors'}>
                      <CheckboxSet
                        options={submissionOptions.Sensor}
                        selected={sensor}
                        groupPrefix={'sensor'}
                        handleClickCheckbox={this.handleClickCheckbox}
                      />
                    </FilterCard>

                    <FilterCard title={'Regions'}>
                      <CheckboxSet
                        options={submissionOptions.Region}
                        selected={region}
                        groupPrefix={'region'}
                        handleClickCheckbox={this.handleClickCheckbox}
                      />
                    </FilterCard>

                    <FilterCard title={'Temporal Coverage'}>
                      <TemporalCoverageOptions
                        timeStart={timeStart}
                        timeEnd={timeEnd}
                        handleChangeSearchValue={this.handleChangeSearchValue}
                      />
                    </FilterCard>

                    <FilterCard title={'Spatial Coverage'}>
                      <SpatialCoverageOptions
                        latStart={latStart}
                        latEnd={latEnd}
                        lonStart={lonStart}
                        lonEnd={lonEnd}
                        hasDepth={hasDepth}
                        handleChangeSearchValue={this.handleChangeSearchValue}
                      />
                    </FilterCard>
                  </div>
                </div>
              )}
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  };
}

export default connect(mapStateToProps)(
  withStyles(styles)(withRouter(CatalogSearch)),
);

/* Filter Card */
const useFilterCardStyles = makeStyles((theme) => ({
  container: {
    minWidth: '200px',
    maxWidth: '300px',
  },
  title: {
    fontSize: '1.1em',
    textAlign: 'left',
    marginBottom: '6px',
  },
  titleContainer: {
    borderBottom: `1px solid ${theme.palette.secondary.dark}`,
    marginBottom: '.5em',
  },
  content: {
    maxWidth: '300px',
  },
}));

const FilterCard = (props) => {
  const cl = useFilterCardStyles();
  const { children, title } = props;
  return (
    <div className={cl.container}>
      <div className={cl.titleContainer}>
        <Typography className={cl.title}>{title}</Typography>
      </div>
      <div className={cl.content}>{children}</div>
    </div>
  );
};
