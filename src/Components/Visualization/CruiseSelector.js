// Cruise exploration component
import {
  Button,
  Checkbox,
  Grid,
  Icon,
  InputAdornment,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ChevronRight, Close, ExpandMore, Search, ZoomOutMap } from '@material-ui/icons';
import * as JsSearch from 'js-search';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { VariableSizeList } from 'react-window';
import {
  cruiseListRequestSend,
  cruiseTrajectoryClear,
  cruiseTrajectoryRequestSend,
  fetchTrajectoryPointCounts,
} from '../../Redux/actions/visualization';
import setsFromList from '../../Utility/setsFromList';
import colors from '../../enums/colors';
import MultiCheckboxDropdown from '../UI/MultiCheckboxDropdown';
import styles from './cruiseSelectorStyles';
import CruiseSelectorSummary from './CruiseSelectorSummary';
import CruiseTrajectoryLegend from './CruiseTrajectoryLegend';


const mapStateToProps = (state, ownProps) => ({
  cruiseList: state.cruiseList,
  getCruiseListState: state.getCruiseListState,
  windowHeight: state.windowHeight,
  trajectoryPointCounts: state.trajectoryPointCounts,
});

const mapDispatchToProps = {
  fetchTrajectoryPointCounts,
  cruiseListRequestSend,
  cruiseTrajectoryRequestSend,
  cruiseTrajectoryClear,
};

const searchFilterGroupCruises = (
  cruises,
  searchField,
  selectedYears,
  selectedChiefScientists,
  selectedRegions,
  selectedSeries,
  search,
) => {
  cruises = [...cruises];
  if (searchField) cruises = search.search(searchField);
  if (selectedYears && selectedYears.size)
    cruises = cruises.filter((e) => selectedYears.has(e.Year));
  if (selectedChiefScientists && selectedChiefScientists.size)
    cruises = cruises.filter((e) => selectedChiefScientists.has(e.Chief_Name));
  if (selectedRegions && selectedRegions.size)
    cruises = cruises.filter((e) =>
      e.Regions.some((region) => selectedRegions.has(region)),
    );
  if (selectedSeries && selectedSeries.size)
    cruises = cruises.filter((e) => selectedSeries.has(e.Series));

  let cruisesGroupedByYear = cruises.reduce((acc, cur) => {
    if (cur.Year === null) {
      if (!acc['NA']) {
        acc['NA'] = [];
      }
      acc['NA'].push(cur);
      return acc;
    }
    if (!acc[cur.Year]) {
      acc[cur.Year] = [];
    }
    acc[cur.Year].push(cur);
    return acc;
  }, {});

  cruisesGroupedByYear = Object.keys(cruisesGroupedByYear)
    .map((key) => ({ year: key, cruises: cruisesGroupedByYear[key] }))
    .sort((a, b) => {
      if (b.year === 'NA') {
        return -1;
      }
      return a.year < b.year ? 1 : -1;
    });

  return { cruisesGroupedByYear, cruises };
};

const defaultSearchAndFilterState = {
  selectedYears: new Set(),
  selectedChiefScientists: new Set(),
  selectedRegions: new Set(),
  searchField: '',
  openYearGroup: null,
  selectedSeries: new Set(),
};

const defaultOptionSets = {
  Regions: new Set(),
  Year: new Set(),
  Chief_Name: new Set(),
  Series: new Set(),
};

const listRef = React.createRef();

class CruiseSelector extends Component {
  constructor(props) {
    super(props);

    if (this.props.trajectoryPointCounts === null) {
      // if trajectory counts are not in the store, dispatch a request to fetch them
      this.props.fetchTrajectoryPointCounts();
    }
    var search = new JsSearch.Search('ID');
    search.searchIndex = new JsSearch.UnorderedSearchIndex();
    search.addIndex('Nickname');
    search.addIndex('Name');
    search.addIndex('Chief_Name');
    search.addIndex('Keywords');

    try {
      if (props.cruiseList && props.cruiseList.length) {
        search.addDocuments(props.cruiseList);
      }
    } catch (e) {
      console.log(e);
      console.log(props.cruiseList);
    }
    // cruises, searchField, selectedYears, selectedChiefScientists, selectedRegions, search
    let { cruisesGroupedByYear, cruises } =
      this.props.cruiseList && this.props.cruiseList.length
        ? searchFilterGroupCruises(
            props.cruiseList,
            '',
            new Set(),
            new Set(),
            new Set(),
            new Set(),
            search,
          )
        : { cruisesGroupedByYear: [], cruises: [] };

    let optionSets = setsFromList(cruises, [
      'Chief_Name',
      'Year',
      'Regions',
      'Series',
    ]);

    this.state = {
      search,
      selectedCruise: null,
      selected: [],
      pointCount: 0,
      searchMenuOpen: false,
      cruisesGroupedByYear,
      cruises,
      optionSets,
      ...defaultSearchAndFilterState,
    };
  }

  componentDidMount = () => {
    this.props.handleShowGlobe();
    if (!this.props.cruiseList || !this.props.cruiseList.length)
      this.props.cruiseListRequestSend();
  };

  componentWillUnmount = () => {
    this.props.cruiseTrajectoryClear();
  };

  handleCruiseSelect = (selection) => {
    // trajectory point counds (from redux; fetched when component loads)
    const counts = this.props.trajectoryPointCounts || {};
    const getPointCount = (list) => list
      .map((name) => this.state.cruises.find(c => c.Name === name))
      .reduce((acc, curr) => {
        return acc + (counts[curr.ID] || 0)
      }, 0);

    // add selected cruise to list, or if already preset remove it
    if (this.state.selected.includes(selection.Name)) {
      const newSelectedList = this.state.selected.filter(name => name !== selection.Name);
      this.setState({
        ...this.state,
        selected: newSelectedList,
        pointCount: getPointCount(newSelectedList)
      });
    } else {
      const newSelectedList = [...this.state.selected, selection.Name];
      this.setState({
        ...this.state,
        selected: newSelectedList,
        pointCount: getPointCount (newSelectedList)
      });
    }
  };

  handleTrajectoryRender = () => {
    const ids = this.state.cruises.filter (({ Name }) => {
      return this.state.selected.includes (Name);
    }).map (({ ID }) => ID );

    // fetch selected cruise trajectories; once they are on the store, they will render
    this.props.cruiseTrajectoryRequestSend(ids);
    // close the cruise selector
    this.setState({
      ...this.state,
      searchMenuOpen: false,
    })
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (
      !(prevProps.cruiseList && prevProps.cruiseList.length) &&
      this.props.cruiseList &&
      this.props.cruiseList.length
    ) {
      this.state.search.addDocuments(this.props.cruiseList);
      let { cruisesGroupedByYear, cruises } = searchFilterGroupCruises(
        this.props.cruiseList,
        '',
        new Set(),
        new Set(),
        new Set(),
        new Set(),
        this.state.search,
      );
      let optionSets = setsFromList(cruises, [
        'Chief_Name',
        'Year',
        'Regions',
        'Series',
      ]);

      this.setState({
        ...this.state,
        cruisesGroupedByYear,
        cruises,
        optionSets,
      });
    }

    if (prevState.cruisesGroupedByYear !== this.state.cruisesGroupedByYear)
      listRef.current.resetAfterIndex(0);
  };

  handleChangeSearchValue = (e) => {
    // cruises, searchField, selectedYears, selectedChiefScientists, selectedRegions, search
    let { cruisesGroupedByYear, cruises } = searchFilterGroupCruises(
      this.props.cruiseList,
      e.target.value,
      this.state.selectedYears,
      this.state.selectedChiefScientists,
      this.state.selectedRegions,
      this.state.selectedSeries,
      this.state.search,
    );

    let newOptionSets = setsFromList(cruises, [
      'Chief_Name',
      'Year',
      'Regions',
      'Series',
    ]);
    let oldOptionSets = { ...this.state.optionSets };

    let optionSets = {
      Chief_Name: this.state.selectedChiefScientists.size
        ? oldOptionSets.Chief_Name
        : newOptionSets.Chief_Name,
      Year: this.state.selectedYears.size
        ? oldOptionSets.Year
        : newOptionSets.Year,
      Regions: this.state.selectedRegions.size
        ? oldOptionSets.Regions
        : newOptionSets.Regions,
      Series: this.state.selectedSeries.size
        ? oldOptionSets.Series
        : newOptionSets.Series,
    };

    this.setState({
      ...this.state,
      searchField: e.target.value,
      cruisesGroupedByYear,
      cruises,
      optionSets,
    });
  };

  handleCloseSearch = () => {
    this.setState({ ...this.state, searchMenuOpen: false });
  };

  handleClearMultiSelect = (statePiece) => {
    let tempNewState = { ...this.state, [statePiece]: new Set() };
    let { cruisesGroupedByYear, cruises } = searchFilterGroupCruises(
      this.props.cruiseList,
      tempNewState.searchField,
      tempNewState.selectedYears,
      tempNewState.selectedChiefScientists,
      tempNewState.selectedRegions,
      tempNewState.selectedSeries,
      this.state.search,
    );

    let optionSets = setsFromList(cruises, [
      'Chief_Name',
      'Year',
      'Regions',
      'Series',
    ]);

    this.setState({
      ...tempNewState,
      cruisesGroupedByYear,
      cruises,
      optionSets,
    });
  };

  handleResetSearch = () => {
    let tempNewState = { ...this.state, ...defaultSearchAndFilterState };

    let { cruisesGroupedByYear, cruises } = searchFilterGroupCruises(
      this.props.cruiseList,
      tempNewState.searchField,
      tempNewState.selectedYears,
      tempNewState.selectedChiefScientists,
      tempNewState.selectedRegions,
      tempNewState.selectedSeries,
      this.state.search,
    );

    let optionSets = setsFromList(cruises, [
      'Chief_Name',
      'Year',
      'Regions',
      'Series',
    ]);

    this.setState({
      ...tempNewState,
      cruisesGroupedByYear,
      cruises,
      optionSets,
    });
  };

  // handle search checkbox event
  handleClickCheckbox = (e, checked) => {
    let [column, value] = e.target.name.split('!!');
    let newSet = new Set(this.state[column]);

    checked ? newSet.add(value) : newSet.delete(value);

    let tempNewState = { ...this.state, [column]: newSet };

    let { cruisesGroupedByYear, cruises } = searchFilterGroupCruises(
      this.props.cruiseList,
      e.target.value,
      tempNewState.selectedYears,
      tempNewState.selectedChiefScientists,
      tempNewState.selectedRegions,
      tempNewState.selectedSeries,
      this.state.search,
    );

    let newOptionSets = setsFromList(cruises, [
      'Chief_Name',
      'Year',
      'Regions',
      'Series',
    ]);
    let oldOptionSets = { ...this.state.optionSets };

    let optionSets = {
      Chief_Name: tempNewState.selectedChiefScientists.size
        ? oldOptionSets.Chief_Name
        : newOptionSets.Chief_Name,
      Year: tempNewState.selectedYears.size
        ? oldOptionSets.Year
        : newOptionSets.Year,
      Regions: tempNewState.selectedRegions.size
        ? oldOptionSets.Regions
        : newOptionSets.Regions,
      Series: tempNewState.selectedSeries.size
        ? oldOptionSets.Series
        : newOptionSets.Series,
    };

    this.setState({
      ...tempNewState,
      cruisesGroupedByYear,
      cruises,
      optionSets,
    });
  };

  handleSetopenYearGroup = (index, year) => {
    if (listRef.current) {
      // Make sure the group being opened is in view
      let listHeight = this.props.windowHeight - 249;
      let currentOffset = listRef.current.state.scrollOffset;
      let targetOffset = index * 38;

      if (
        index !== null &&
        (targetOffset < currentOffset - 10 ||
          targetOffset > currentOffset + listHeight - 20)
      ) {
        setTimeout(() => listRef.current.scrollToItem(index, 'start'), 10);
      }

      listRef.current.resetAfterIndex(0);
    }

    this.setState({
      ...this.state,
      openYearGroup: this.state.openYearGroup === year ? null : year,
    });
  };

  render() {
    const {
      searchField,
      selectedCruise,
      searchMenuOpen,
      selectedYears,
      selectedChiefScientists,
      selectedRegions,
      selectedSeries,
      openYearGroup,
      optionSets,
      cruisesGroupedByYear,
      cruises,
    } = this.state;

    const { classes, windowHeight } = this.props;

    return (
      <>
        <Paper
          className={classes.searchMenuPaper}
          style={searchMenuOpen ? {} : { display: 'none' }}
        >
          <Grid container>
            <Grid item xs={12}>
              <Typography style={{ display: 'inline-block' }}>
                Search and filter using the controls on the left. Select a
                cruise from the list on the right.
              </Typography>

              <Button
                startIcon={<Close style={{ fontSize: '22px' }} />}
                onClick={this.handleCloseSearch}
                className={classes.closeIcon}
              >
                Close
              </Button>
            </Grid>

            <Grid
              item
              xs={4}
              style={{
                overflowY: 'auto',
                maxHeight: windowHeight - 204,
                padding: '16px',
                backgroundColor: 'rgba(0,0,0,.4)',
              }}
            >
              <TextField
                fullWidth
                name="searchTerms"
                onChange={this.handleChangeSearchValue}
                placeholder="Search"
                value={searchField}
                InputProps={{
                  classes: {
                    root: classes.inputRoot,
                  },
                  startAdornment: (
                    <React.Fragment>
                      <InputAdornment position="start">
                        <Search style={{ color: colors.primary }} />
                      </InputAdornment>
                    </React.Fragment>
                  ),
                }}
                variant="outlined"
              />

              <MultiCheckboxDropdown
                options={Array.from(optionSets.Regions).sort()}
                selectedOptions={selectedRegions}
                handleClear={() =>
                  this.handleClearMultiSelect('selectedRegions')
                }
                parentStateKey={'selectedRegions'}
                handleClickCheckbox={this.handleClickCheckbox}
                groupHeaderLabel="Region"
              />

              <MultiCheckboxDropdown
                options={Array.from(optionSets.Year).sort((a, b) =>
                  a < b ? 1 : -1,
                )}
                selectedOptions={selectedYears}
                handleClear={() => this.handleClearMultiSelect('selectedYears')}
                parentStateKey={'selectedYears'}
                handleClickCheckbox={this.handleClickCheckbox}
                groupHeaderLabel="Year"
              />

              <MultiCheckboxDropdown
                options={Array.from(optionSets.Chief_Name).sort()}
                selectedOptions={selectedChiefScientists}
                handleClear={() =>
                  this.handleClearMultiSelect('selectedChiefScientists')
                }
                parentStateKey={'selectedChiefScientists'}
                handleClickCheckbox={this.handleClickCheckbox}
                groupHeaderLabel="Chief Scientist"
              />

              <MultiCheckboxDropdown
                options={Array.from(optionSets.Series).sort()}
                selectedOptions={selectedSeries}
                handleClear={() =>
                  this.handleClearMultiSelect('selectedSeries')
                }
                parentStateKey={'selectedSeries'}
                handleClickCheckbox={this.handleClickCheckbox}
                groupHeaderLabel="Cruise Series"
              />

              <Grid item xs={12} className={classes.searchPanelRow}>
                <Button
                  variant="outlined"
                  onClick={this.handleResetSearch}
                  className={classes.resetButton}
                >
                  Reset Filters
                </Button>
              </Grid>
              <Grid item xs={12} >
                <CruiseSelectorSummary
                  cruises={this.state.cruises}
                  selected={this.state.selected}
                  handleTrajectoryRender={this.handleTrajectoryRender}
                  pointCount={this.state.pointCount}
                />
              </Grid>
            </Grid>

            <Grid item xs={8} style={{ paddingTop: '12px' }}>
              <Grid container>
                <Grid item xs={9}>
                  <Typography className={classes.heading}>
                    Showing {cruises.length} cruises (grouped by year)
                  </Typography>
                </Grid>

                <Grid
                  item
                  xs={3}
                  container
                  justifyContent="flex-start"
                  alignItems="center"
                >
                  <Typography
                    variant="caption"
                    style={{ color: colors.primary, marginBottom: '-16px' }}
                  >
                    Cruise Count
                  </Typography>
                </Grid>
              </Grid>

              <VariableSizeList
                ref={listRef}
                itemData={cruisesGroupedByYear}
                itemCount={cruisesGroupedByYear.length}
                height={windowHeight - 249}
                width="100%"
                estimatedItemSize={38}
                style={{ overflowY: 'scroll' }}
                itemSize={(i) => {
                  // line height 38px '.variableItem'
                  //
                  return openYearGroup === cruisesGroupedByYear[i].year
                    ? cruisesGroupedByYear[i].cruises.length * 38 + 38 + 4 + 10 + 20
                    : 38
                }}
              >
                {({ index, style }) => (
                  <div style={style}>
                    <Grid
                      container
                      className={classes.searchOption}
                      onClick={() =>
                        this.handleSetopenYearGroup(
                          index,
                          cruisesGroupedByYear[index].year,
                        )
                      }
                    >
                      <Grid item xs={2} container alignItems="center">
                        {openYearGroup === cruisesGroupedByYear[index].year ? (
                          <ExpandMore className={classes.datasetOpenIcon} />
                        ) : (
                          <ChevronRight className={classes.datasetOpenIcon} />
                        )}
                        <span className={classes.searchOptionsMenuItemText}>
                          {cruisesGroupedByYear[index].year}
                        </span>
                      </Grid>

                      <Grid item xs={7}></Grid>

                      <Tooltip
                        title={`${cruisesGroupedByYear[index].cruises.length} cruises from this year match the search criteria`}
                      >
                        <Grid
                          item
                          xs={1}
                          className={classes.memberCount}
                          container
                          alignItems="center"
                          justifyContent="center"
                        >
                          {cruisesGroupedByYear[index].cruises.length}
                        </Grid>
                      </Tooltip>
                    </Grid>

                    {cruisesGroupedByYear[index].year === openYearGroup ? (
                      <Grid container className={classes.variablesWrapper}>
                        <Grid item container alignItems="center">
                          <Grid item xs={1} className={classes.cruiseYearHeader}>
                            Select
                          </Grid>
                          <Grid item xs={2} className={classes.cruiseYearHeader}>
                            Official Designation
                          </Grid>
                          <Grid item xs={8} className={classes.cruiseYearHeader}>
                            Nickname
                          </Grid>
                        </Grid>

                        {cruisesGroupedByYear[index].cruises.map((cruise, i) => (
                          <Grid item xs={12} key={cruise.Name} className={classes.variableItem} container alignItems="center">
                            <Grid item xs={1}>
                              <div className={classes.checkBoxWrapper}>
                                <Checkbox checked={this.state.selected.includes(cruise.Name)} onClick={() => this.handleCruiseSelect(cruise)} />
                              </div>
                            </Grid>
                            <Grid item xs={2} className={classes.cruiseName}>
                              {cruise.Name}
                            </Grid>
                            <Grid item xs={8} className={classes.cruiseName}>
                              <Tooltip title={cruise.Nickname} enterDelay={200}>
                                <span>{cruise.Nickname}</span>
                              </Tooltip>
                            </Grid>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      ''
                    )}
                  </div>
                )}
              </VariableSizeList>
            </Grid>
          </Grid>
        </Paper>

        <div id="cruise-selector" className={classes.outerDiv}>
          <Paper className={classes.openSearchButtonPaper}>
            <Button
              startIcon={<Search />}
              className={classes.openSearchButton}
              onClick={() =>
                this.setState({ ...this.state, searchMenuOpen: true })
              }
            >
              Search Cruises
            </Button>
          </Paper>

          {selectedCruise && (
            <>
              <Table size="small" className={classes.cruiseInfo}>
                <TableBody>
                  <TableRow>
                    <TableCell className={classes.cruiseInfoCell}>
                      Cruise:
                    </TableCell>
                    <TableCell className={classes.cruiseInfoCell}>
                      {selectedCruise.Name}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className={classes.cruiseInfoCell}>
                      Nickname:
                    </TableCell>
                    <TableCell className={classes.cruiseInfoCell}>
                      {selectedCruise.Nickname}
                    </TableCell>
                  </TableRow>

                  {selectedCruise.Start_Time && (
                    <TableRow>
                      <TableCell className={classes.cruiseInfoCell}>
                        Start Date:
                      </TableCell>
                      <TableCell className={classes.cruiseInfoCell}>
                        {selectedCruise.Start_Time.slice(0, 10)}
                      </TableCell>
                    </TableRow>
                  )}

                  {selectedCruise.End_Time && (
                    <TableRow>
                      <TableCell className={classes.cruiseInfoCell}>
                        End Date:
                      </TableCell>
                      <TableCell className={classes.cruiseInfoCell}>
                        {selectedCruise.End_Time.slice(0, 10)}
                      </TableCell>
                    </TableRow>
                  )}

                  {selectedCruise.Chief_Name && (
                    <TableRow>
                      <TableCell className={classes.cruiseInfoCell}>
                        Chief Scientist:
                      </TableCell>
                      <TableCell className={classes.cruiseInfoCell}>
                        {selectedCruise.Chief_Name}
                      </TableCell>
                    </TableRow>
                  )}

                  {selectedCruise.Ship_Name && (
                    <TableRow>
                      <TableCell className={classes.cruiseInfoCell}>
                        Ship:
                      </TableCell>
                      <TableCell className={classes.cruiseInfoCell}>
                        {selectedCruise.Ship_Name}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className={classes.linkWrapper}>
                <Link
                  component={RouterLink}
                  to={`/catalog/cruises/${selectedCruise.Name}`}
                  target="_blank"
                >
                  Open Cruise Catalog Page
                </Link>
              </div>
            </>
          )}
        </div>
        <CruiseTrajectoryLegend />
      </>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(CruiseSelector));
