// Cruise exploration component
import {
  Button,
  Checkbox,
  Chip,
  Grid,
  Icon,
  InputAdornment,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ChevronRight, Close, ExpandMore, Search, ZoomOutMap } from '@material-ui/icons';
import {GiWireframeGlobe} from 'react-icons/gi';
import { IoCalendarClearOutline } from 'react-icons/io5';
import { BsFillPersonFill, BsListNested } from 'react-icons/bs';
import { LuShip } from 'react-icons/lu';
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
import SearchAndFilter from './CruiseSelectorSearchAndFilter';
import ResultsList from './CruiseSelectorResultsList';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

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
  selectedSensors,
  search,
  groupBy
) => {


  let filteredCruises = [...cruises];
  // narrow by search text
  if (searchField) {
    filteredCruises = search.search(searchField);
  }
  // narrow by selected years
  if (selectedYears && selectedYears.size) {
    filteredCruises = filteredCruises.filter((e) => selectedYears.has(e.Year));
  }
  // narrow by selected chief scientists
  if (selectedChiefScientists && selectedChiefScientists.size) {
    filteredCruises = filteredCruises.filter((e) => selectedChiefScientists.has(e.Chief_Name));
  }
  // narrow by selected regions
  if (selectedRegions && selectedRegions.size) {
    filteredCruises = filteredCruises.filter((e) =>
      e.Regions.some((region) => selectedRegions.has(region)),
    );
  }
  // narrow by selected series
  if (selectedSeries && selectedSeries.size) {
    filteredCruises = filteredCruises.filter((e) => selectedSeries.has(e.Series));
  }
  // narrow by selected series
  if (selectedSensors && selectedSensors.size) {
    filteredCruises = filteredCruises.filter((e) =>
      e.Sensors.some((sensor) => selectedSensors.has(sensor)),
    );
  }

  // group by year
  let groupedCruises = filteredCruises.reduce((acc, cur) => {
    if (!Boolean(cur[groupBy]) || (Array.isArray(cur[groupBy]) && cur[groupBy].length === 0)) {
      if (!acc['Other']) {
        acc['Other'] = [];
      }
      acc['Other'].push(cur);
      return acc;
    }
    if (!acc[cur[groupBy]]) {
      acc[cur[groupBy]] = [];
    }
    // note: for regions, the value is an array;
    // javascript will convert it to a string when it is used as a key
    acc[cur[groupBy]].push(cur);
    return acc;
  }, {});


  groupedCruises = Object.keys(groupedCruises)
    .map((key) => ({ [groupBy]: key, cruises: groupedCruises[key] }))
    .sort((a, b) => {
      if (b[groupBy] === 'Other') {
        return -1;
      }
      return a[groupBy] < b[groupBy] ? 1 : -1;
    });

  if (groupBy !== 'Year') {
    groupedCruises = groupedCruises.reverse();
  }

  // move 'Other' to the bottom
  const otherIdx = groupedCruises.findIndex ((group) => group[groupBy] === 'Other');

  if (otherIdx > -1) {
    groupedCruises = groupedCruises.slice (0, otherIdx)
                                   .concat (groupedCruises.slice(otherIdx + 1))
                                   .concat (groupedCruises[otherIdx]);
  }

  console.log({
    cruisesLength: cruises.length,
    filteredLength: filteredCruises.length,
    searchField,
    search,
  });

  return { groupedCruises, cruises: filteredCruises };
};

const defaultSearchAndFilterState = {
  selectedYears: new Set(),
  selectedChiefScientists: new Set(),
  selectedRegions: new Set(),
  searchField: '',
  openGroup: null,
  selectedSeries: new Set(),
  selectedSensors: new Set(),
};

const defaultOptionSets = {
  Regions: new Set(),
  Year: new Set(),
  Chief_Name: new Set(),
  Series: new Set(),
  Sensors: new Set(),
};


const groupByOptions = ['Year', 'Chief_Name', 'Series', 'Regions', 'Ship_Name'];
const groupByLabels = ['Year', 'Chief Scientist', 'Series', 'Regions', 'Ship'];

const renderGroupTitle = (groupBy, groupTitle) => {
  if (groupBy === 'Regions') {
    return groupTitle.split(',').join(', ')
  } else {
    return groupTitle;
  }

}

const listRef = React.createRef();

class CruiseSelector extends Component {
  constructor(props) {
    super(props);

    if (props.trajectoryPointCounts === null) {
      // if trajectory counts are not in the store, dispatch a request to fetch them
      props.fetchTrajectoryPointCounts();
    }
    var search = new JsSearch.Search('ID');
    search.searchIndex = new JsSearch.UnorderedSearchIndex();
    search.addIndex('Nickname');
    search.addIndex('Name');
    search.addIndex('Chief_Name');
    search.addIndex('Keywords');
    search.addIndex('Sensors');

    try {
      if (props.cruiseList && props.cruiseList.length) {
        search.addDocuments(props.cruiseList);
      }
    } catch (e) {
      console.log(e);
      console.log('error', props.cruiseList);
    }
    // cruises, searchField, selectedYears, selectedChiefScientists, selectedRegions, search
    let { groupedCruises, cruises } =
      this.props.cruiseList && this.props.cruiseList.length
        ? searchFilterGroupCruises(
          this.props.cruiseList,
          '',          // search field
          new Set(),   // selectedYears
          new Set(),   // selectedChiefScientist
          new Set(),   // selectedRegions
          new Set(),   // selectedSeries
          new Set(),   // selectedSensors
          search,
          'Year', // group By
        )
        : { groupedCruises: [], cruises: [] };

    let optionSets = setsFromList(cruises, [
      'Chief_Name',
      'Year',
      'Regions',
      'Series',
      'Sensors',
    ]);

    this.state = {
      search,
      selected: [],
      pointCount: 0,
      searchMenuOpen: false,
      groupedCruises,
      cruises,
      optionSets,
      ...defaultSearchAndFilterState,
      groupBy: 'Year' // year, ship, chief, series,
    };

    // console.log ('state', this.state);
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

    console.log ('handleCruiseSelect', selection);
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

  handleDeselectAll = () => {
    this.setState({
      ...this.state,
      selected: [],
      pointCount: 0
    });
  }

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
      let { groupedCruises, cruises } = searchFilterGroupCruises(
        this.props.cruiseList,
        '',          // search field
        new Set(),   // selectedYears
        new Set(),   // selectedChiefScientist
        new Set(),   // selectedRegions
        new Set(),   // selectedSeries
        new Set(),   // selectedSensors
        this.state.search,
        this.state.groupBy, // groupBy
      );
      let optionSets = setsFromList(cruises, [
        'Chief_Name',
        'Year',
        'Regions',
        'Series',
        'Sensors',
      ]);

      this.setState({
        ...this.state,
        groupedCruises,
        cruises,
        optionSets,
      });
    }

    if (prevState.groupedCruises !== this.state.groupedCruises)
      listRef.current.resetAfterIndex(0);
  };

  handleChangeSearchValue = (e) => {
    // cruises, searchField, selectedYears, selectedChiefScientists, selectedRegions, search
    let { groupedCruises, cruises } = searchFilterGroupCruises(
      this.props.cruiseList,
      e.target.value,
      this.state.selectedYears,
      this.state.selectedChiefScientists,
      this.state.selectedRegions,
      this.state.selectedSeries,
      this.state.selectedSensors,
      this.state.search,
      this.state.groupBy, // groupBy
    );

    let newOptionSets = setsFromList(cruises, [
      'Chief_Name',
      'Year',
      'Regions',
      'Series',
      'Sensors',
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
      Sensors: this.state.selectedSensors.size
        ? oldOptionSets.Sensors
        : newOptionSets.Sensors,
    };

    this.setState({
      ...this.state,
      searchField: e.target.value,
      groupedCruises,
      cruises,
      optionSets,
    });
  };

  handleCloseSearch = () => {
    this.setState({ ...this.state, searchMenuOpen: false });
  };

  handleClearMultiSelect = (statePiece) => {
    let tempNewState = { ...this.state, [statePiece]: new Set() };
    let { groupedCruises, cruises } = searchFilterGroupCruises(
      this.props.cruiseList,
      tempNewState.searchField,
      tempNewState.selectedYears,
      tempNewState.selectedChiefScientists,
      tempNewState.selectedRegions,
      tempNewState.selectedSeries,
      tempNewState.selectedSensors,
      this.state.search,
      this.state.groupBy, // groupBy
    );

    let optionSets = setsFromList(cruises, [
      'Chief_Name',
      'Year',
      'Regions',
      'Series',
      'Sensors',
    ]);

    this.setState({
      ...tempNewState,
      groupedCruises,
      cruises,
      optionSets,
    });
  };

  handleResetSearch = () => {
    let tempNewState = { ...this.state, ...defaultSearchAndFilterState };

    let { groupedCruises, cruises } = searchFilterGroupCruises(
      this.props.cruiseList,
      tempNewState.searchField,
      tempNewState.selectedYears,
      tempNewState.selectedChiefScientists,
      tempNewState.selectedRegions,
      tempNewState.selectedSeries,
      tempNewState.selectedSensors,
      this.state.search,
      this.state.groupBy, // groupBy
    );

    let optionSets = setsFromList(cruises, [
      'Chief_Name',
      'Year',
      'Regions',
      'Series',
      'Sensors',
    ]);

    this.setState({
      ...tempNewState,
      groupedCruises,
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

    let { groupedCruises, cruises } = searchFilterGroupCruises(
      this.props.cruiseList,
      this.state.searchField,
      tempNewState.selectedYears,
      tempNewState.selectedChiefScientists,
      tempNewState.selectedRegions,
      tempNewState.selectedSeries,
      tempNewState.selectedSensors,
      this.state.search,
      this.state.groupBy, // groupBy
    );

    let newOptionSets = setsFromList(cruises, [
      'Chief_Name',
      'Year',
      'Regions',
      'Series',
      'Sensors',
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
      Sensors: tempNewState.selectedSensors.size
        ? oldOptionSets.Sensors
        : newOptionSets.Sensors,
    };

    this.setState({
      ...tempNewState,
      groupedCruises,
      cruises,
      optionSets,
    });
  };

  handleSetOpenGroup = (index, groupByValue) => {
    console.log ('handleSetOpenGroup', index, groupByValue);
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
      openGroup: this.state.openGroup === groupByValue ? null : groupByValue,
    });
  };

  findGroupAndOpen = (cruiseName) => {
    console.log ('findGroupAndOpen', cruiseName)
    const groupedCruises = this.state.groupedCruises;

    const groupKeys = groupedCruises.map((g) => g[this.state.groupBy]);



    const index = groupedCruises.findIndex ((group) => {
      if (group.cruises.find (({ Name }) => Name === cruiseName)) {
        return true;
      } else {
        return false;
      }
    });

    console.log ('found index', index, groupKeys[index], groupKeys);

    this.handleSetOpenGroup (index, groupKeys[index]);
  }

  handleGroupBySelection =  (event, newValue) => {
    const newSelection = groupByOptions[newValue];

    let { groupedCruises, cruises } = searchFilterGroupCruises(
      this.props.cruiseList,
      this.state.searchField,
      this.state.selectedYears,
      this.state.selectedChiefScientists,
      this.state.selectedRegions,
      this.state.selectedSeries,
      this.state.selectedSensors,
      this.state.search,
      newSelection
    );

    this.setState({
      ...this.state,
      groupBy: newSelection,
      groupedCruises,
      cruises,
    })
  }

  render() {
    const {
      searchField,
      searchMenuOpen,
      selectedYears,
      selectedChiefScientists,
      selectedRegions,
      selectedSeries,
      selectedSensors,
      openGroup,
      optionSets,
      groupedCruises,
      cruises,
    } = this.state;

    // create array of selected filters to generate chip indicators
    // mimic checkbox name so that the same method can be used to deselect via chip
    const selectedFilters = [];
    const sf = selectedFilters;
    Array.from(selectedYears).forEach((val) => sf.push('selectedYears!!' + val));
    Array.from(selectedChiefScientists).forEach((val) => sf.push('selectedChiefScientists!!' + val));
    Array.from(selectedRegions).forEach((val) => sf.push('selectedRegions!!' + val));
    Array.from(selectedSeries).forEach((val) => sf.push('selectedSeries!!' + val));
    Array.from(selectedSensors).forEach((val) => sf.push('selectedSensors!!' + val));

    const { classes, windowHeight } = this.props;

    return (
      <>
        <Paper
          className={classes.searchMenuPaper}
          style={searchMenuOpen ? {} : { display: 'none' }}
        >
          <div className={classes.listControls}>

            <Grid container>
              {/* Search and Filter: Left Column */}
              <Grid item xs={3}>
                <div className={classes.searchAndFilterWrapper}>
                  <TextField
                    fullWidth
                    name="searchTerms"
                    onChange={this.handleChangeSearchValue}
                    placeholder="Search"
                    value={this.state.searchField}
                    InputProps={{
                      classes: {
                        root: classes.inputRoot,
                      },
                      startAdornment: (
                        <React.Fragment>
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        </React.Fragment>
                      ),
                    }}
                    variant="outlined"
                  />
                  <CruiseSelectorSummary
                    cruises={this.state.cruises}
                    selected={this.state.selected}
                    handleTrajectoryRender={this.handleTrajectoryRender}
                    pointCount={this.state.pointCount}
                    openContainingGroup={this.findGroupAndOpen}
                    removeOne={this.handleCruiseSelect}
                    removeAll={this.handleDeselectAll}
                  />
                  <SearchAndFilter
                    searchField={searchField}
                    optionSets={optionSets}
                    selectedRegions={selectedRegions}
                    selectedYears={selectedYears}
                    selectedChiefScientists={selectedChiefScientists}
                    selectedSeries={selectedSeries}
                    selectedSensors={selectedSensors}
                    handleChangeSearchValue={this.handleChangeSearchValue}
                    handleClickCheckbox={this.handleClickCheckbox}
                    handleClearMultiSelect={this.handleClearMultiSelect}
                    handleResetSearch={this.handleResetSearch}
                  />

                </div>
              </Grid>

              <Grid item xs={9} className={classes.liftRightGridUp}>
                {/* tabs */}
                <Grid container>
                  <Grid item xs={1} className={classes.controlRowLabel} >
                    <Typography variant="body1" color="primary">Sort By:</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <Tabs
                      value={groupByOptions.indexOf(this.state.groupBy)}
                      onChange={this.handleGroupBySelection}
                      indicatorColor="primary"
                      textColor="primary"
                      scrollButtons={'auto'}
                      variant={'scrollable'}
                    >
                      <Tab icon={<IoCalendarClearOutline />} label={groupByLabels[0]} classes={{
                        wrapper: classes.tabWrapper
                      }} />
                      <Tab icon={<BsFillPersonFill />} label={groupByLabels[1]} classes={{
                        wrapper: classes.tabWrapper
                      }} />
                      <Tab icon={<BsListNested />} label={groupByLabels[2]} classes={{
                        wrapper: classes.tabWrapper
                      }} />
                      <Tab icon={<GiWireframeGlobe />} label={groupByLabels[3]} classes={{
                        wrapper: classes.tabWrapper
                      }} />
                      <Tab icon={<LuShip />} label={groupByLabels[4]} classes={{
                        wrapper: classes.tabWrapper
                      }} />
                    </Tabs>
                  </Grid>
                  <Grid item xs={2} className={classes.controlRowCloseBtn}>
                    <Button
                      startIcon={<Close style={{ fontSize: '22px' }} />}
                      onClick={this.handleCloseSearch}
                      className={classes.closeIcon}
                    >
                      Close Search
                    </Button>
                  </Grid>
      </Grid>

                {/* filter chips */}

                <Grid container className={classes.filterChipsGrid}>
                  <Grid item xs={1}>
                    {selectedFilters.length ?
                      (<div className={classes.controlRowLabel}>
                        <Typography variant="body1" color="primary">Filters: </Typography>
                      </div>)
                      : ''}
                  </Grid>
                  <Grid item xs={11}>
                    {selectedFilters.length ?
                      <div className={classes.filterChips}>
                        {selectedFilters.length ? selectedFilters.map((f, i) => {
                          const [, val] = f.split('!!');
                          return <Chip
                            key={`chip${i}`}
                            size="medium"
                            variant="outlined"
                            label={val}
                            onDelete={() => {
                              console.log('delete', f);
                              this.handleClickCheckbox({ target: { name: f } }, false)
                            }}
                            color="primary"
                          />;
                        }) : <Typography variant="body2">No active filters</Typography>}
                      </div>
                      : ''}
                  </Grid>

                </Grid>

                {/* results list */}

                <Grid item xs={12} style={{ paddingTop: '12px', border: '0px solid blue' }}>
                  <ResultsList
                    listRef={listRef}
                    groupedCruises={groupedCruises}
                    openGroup={openGroup}
                    groupBy={this.state.groupBy}
                    handleSetOpenGroup={this.handleSetOpenGroup}
                    selected={this.state.selected}
                    handleCruiseSelect={this.handleCruiseSelect}
                  />
                </Grid>

              </Grid>{/* end Grid9 */}
            </Grid>{/* end Grid container */}


          </div>
        </Paper>

        <div id="cruise-selector" className={classes.outerDiv}>
          {!searchMenuOpen &&
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
            </Paper>}
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
