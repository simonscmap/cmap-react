// Cruise exploration component

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import * as JsSearch from 'js-search';
import { VariableSizeList } from 'react-window';

import { withStyles } from '@material-ui/core/styles';
import { Search, ZoomOutMap } from '@material-ui/icons';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Link,
  Icon,
  Tooltip,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Paper,
  Button,
} from '@material-ui/core';
import { Close, ExpandMore, ChevronRight } from '@material-ui/icons';

import {
  cruiseListRequestSend,
  cruiseTrajectoryRequestSend,
  cruiseTrajectoryClear,
} from '../../Redux/actions/visualization';

import MultiCheckboxDropdown from '../UI/MultiCheckboxDropdown';

import colors from '../../enums/colors';
import setsFromList from '../../Utility/setsFromList';

const mapStateToProps = (state, ownProps) => ({
  cruiseList: state.cruiseList,
  getCruiseListState: state.getCruiseListState,
  windowHeight: state.windowHeight,
});

const mapDispatchToProps = {
  cruiseListRequestSend,
  cruiseTrajectoryRequestSend,
  cruiseTrajectoryClear,
};

const esriFonts =
  '"Avenir Next W00","Helvetica Neue",Helvetica,Arial,sans-serif';
const esriFontColor = 'white';

const styles = (theme) => ({
  outerDiv: {
    padding: '12px',
    maxWidth: '360px',
    backgroundColor: 'transparent',
    color: esriFontColor,
    borderRadius: '4px',
    boxShadow: '2px',
    backdropFilter: 'blur(2px)',
    transform: 'translateY(35px)',
    marginTop: '24px',
    position: 'fixed',
    left: 0,
    top: 140,
  },

  cruiseInfo: {
    color: esriFontColor,
    fontFamily: esriFonts,
    margin: '12px auto 0 auto',
  },

  cruiseInfoCell: {
    color: esriFontColor,
    fontFamily: esriFonts,
    borderStyle: 'none',
  },

  linkWrapper: {
    padding: '12px',
    fontSize: '14px',
  },

  searchMenuPaper: {
    position: 'fixed',
    top: 120,
    bottom: 60,
    left: 0,
    width: '98vw',
    height: 'auto',
    zIndex: 1500,
    backgroundColor: 'rgba(0,0,0,.6)',
    backdropFilter: 'blur(5px)',
  },

  closeIcon: {
    float: 'right',
    cursor: 'pointer',
    color: colors.primary,
    textTransform: 'none',
    fontSize: '15px',
  },

  inputRoot: {
    border: `1px solid ${colors.primary}`,
  },

  openSearchButtonPaper: {
    backgroundColor: colors.backgroundGray,
    boxShadow: '1px 1px 1px 1px #242424',
  },

  openSearchButton: {
    textTransform: 'none',
    color: colors.primary,
    fontSize: '15px',
    padding: '6px 42px',
  },

  resetButton: {
    textTransform: 'none',
    width: '160px',
    height: '37px',
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    marginTop: '12px',
  },

  yearHeader: {
    backgroundColor: 'rgba(0, 0, 0, .7)',
    height: '36px',
    fontSize: '17px',
    display: 'flex',
    alignItems: 'center',
    justifyCOntent: 'center',
  },

  searchOption: {
    '&:hover': {
      backgroundColor: colors.greenHover,
    },

    cursor: 'pointer',
    height: '38px',
    boxShadow: '0px 1px 1px 1px #242424',
    backgroundColor: 'rgba(0,0,0,.4)',
  },

  memberCount: {
    color: colors.primary,
    fontWeight: 'bold',
  },

  variablesWrapper: {
    backgroundColor: 'rgba(0,0,0,.2)',
    paddingTop: '6px',
  },

  variableItem: {
    height: '32px',
    textAlign: 'left',
    fontSize: '14px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: colors.greenHover,
    },
  },

  cruiseName: {
    width: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  heading: {
    textAlign: 'left',
    padding: '8px 6px',
    color: colors.primary,
    fontSize: '16px',
    marginTop: '5px',
    backgroundColor: 'rgba(0,0,0,.4)',
  },

  cruiseYearHeader: {
    textAlign: 'left',
    fontSize: '9px',
    color: colors.primary,
  },
});

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
    if (!acc[cur.Year]) acc[cur.Year] = [];
    acc[cur.Year].push(cur);
    return acc;
  }, {});

  cruisesGroupedByYear = Object.keys(cruisesGroupedByYear)
    .map((key) => ({ year: key, cruises: cruisesGroupedByYear[key] }))
    .sort((a, b) => (a.year < b.year ? 1 : -1));

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
    if (selection) {
      this.props.cruiseTrajectoryRequestSend(selection.ID);
    }

    this.setState({
      ...this.state,
      selectedCruise: selection,
      searchMenuOpen: false,
    });
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
                  justify="flex-start"
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
                itemSize={(i) =>
                  openYearGroup === cruisesGroupedByYear[i].year
                    ? cruisesGroupedByYear[i].cruises.length * 32 + 38 + 4 + 10
                    : 38
                }
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
                          justify="center"
                        >
                          {cruisesGroupedByYear[index].cruises.length}
                        </Grid>
                      </Tooltip>
                    </Grid>

                    {cruisesGroupedByYear[index].year === openYearGroup ? (
                      <Grid container className={classes.variablesWrapper}>
                        <Grid item container alignItems="center">
                          <Grid item xs={1}>
                            {' '}
                          </Grid>

                          <Grid
                            item
                            xs={2}
                            className={classes.cruiseYearHeader}
                          >
                            Official Designation
                          </Grid>

                          <Grid
                            item
                            xs={8}
                            className={classes.cruiseYearHeader}
                          >
                            Nickname
                          </Grid>
                        </Grid>

                        {cruisesGroupedByYear[index].cruises.map((e, i) => (
                          <Grid
                            item
                            xs={12}
                            key={e.Name}
                            className={classes.variableItem}
                            container
                            alignItems="center"
                            onClick={() => this.handleCruiseSelect(e)}
                          >
                            <Grid item xs={1}></Grid>

                            <Grid item xs={2} className={classes.cruiseName}>
                              {e.Name}
                            </Grid>

                            <Tooltip title={e.Nickname} enterDelay={300}>
                              <Grid item xs={8} className={classes.cruiseName}>
                                {e.Nickname}
                              </Grid>
                            </Tooltip>
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
      </>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(CruiseSelector));
