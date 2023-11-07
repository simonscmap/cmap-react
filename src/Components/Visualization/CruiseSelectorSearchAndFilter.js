// Search and filter controls for Cruise Selector panel
import {
  Button,
  InputAdornment,
  TextField,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Search, } from '@material-ui/icons';
import React  from 'react';

import MultiCheckboxDropdown from '../UI/MultiCheckboxDropdown';
import styles from './cruiseSelectorStyles';

const useStyle = makeStyles (styles);

const SearchAndFilter = (props) => {
  const classes = useStyle();
  const {
    searchField,
    optionSets,
    selectedRegions,
    selectedYears,
    selectedChiefScientists,
    selectedSeries,
    selectedSensors,
    handleChangeSearchValue,
    handleClickCheckbox,
    handleClearMultiSelect,
    handleResetSearch,
  } = props;

  return (
    <div style={{}}>
      <TextField
        fullWidth
        name="searchTerms"
        onChange={handleChangeSearchValue}
        placeholder="Search"
        value={searchField}
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

      <MultiCheckboxDropdown
        options={Array.from(optionSets.Regions).sort()}
        selectedOptions={selectedRegions}
        handleClear={() =>
          handleClearMultiSelect('selectedRegions')
        }
        parentStateKey={'selectedRegions'}
        handleClickCheckbox={handleClickCheckbox}
        groupHeaderLabel="Region"
      />

      <MultiCheckboxDropdown
        options={Array.from(optionSets.Year).sort((a, b) =>
          a < b ? 1 : -1,
        )}
        selectedOptions={selectedYears}
        handleClear={() => handleClearMultiSelect('selectedYears')}
        parentStateKey={'selectedYears'}
        handleClickCheckbox={handleClickCheckbox}
        groupHeaderLabel="Year"
      />

      <MultiCheckboxDropdown
        options={Array.from(optionSets.Chief_Name).sort()}
        selectedOptions={selectedChiefScientists}
        handleClear={() =>
          handleClearMultiSelect('selectedChiefScientists')
        }
        parentStateKey={'selectedChiefScientists'}
        handleClickCheckbox={handleClickCheckbox}
        groupHeaderLabel="Chief Scientist"
      />

      <MultiCheckboxDropdown
        options={Array.from(optionSets.Series).sort()}
        selectedOptions={selectedSeries}
        handleClear={() =>
          handleClearMultiSelect('selectedSeries')
        }
        parentStateKey={'selectedSeries'}
        handleClickCheckbox={handleClickCheckbox}
        groupHeaderLabel="Cruise Series"
      />

      <MultiCheckboxDropdown
        options={Array.from(optionSets.Sensors).sort()}
        selectedOptions={selectedSensors}
        handleClear={() =>
          handleClearMultiSelect('selectedSensors')
        }
        parentStateKey={'selectedSensors'}
        handleClickCheckbox={handleClickCheckbox}
        groupHeaderLabel="Measurement Type"
      />

      <div className={classes.searchPanelRow}>
        <Button
          variant="outlined"
          onClick={handleResetSearch}
          className={classes.resetButton}
        >
          Reset Filters
        </Button>
      </div>

    </div>
  );
};

export default SearchAndFilter;
