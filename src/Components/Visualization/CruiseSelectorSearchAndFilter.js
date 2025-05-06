// Search and filter controls for Cruise Selector panel
import { Button, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

import MultiCheckboxDropdown from '../UI/MultiCheckboxDropdown';
import styles from './cruiseSelectorStyles';

const useStyle = makeStyles(styles);

const SearchAndFilter = (props) => {
  const classes = useStyle();
  const {
    optionSets,
    selectedRegions,
    selectedYears,
    selectedChiefScientists,
    selectedSeries,
    selectedSensors,
    handleClickCheckbox,
    handleClearMultiSelect,
    handleResetSearch,
  } = props;

  return (
    <div>
      <Typography className={classes.filtersHeader} variant="h6" component="p">
        Filters
      </Typography>
      <MultiCheckboxDropdown
        options={Array.from(optionSets.Regions).sort()}
        selectedOptions={selectedRegions}
        handleClear={() => handleClearMultiSelect('selectedRegions')}
        parentStateKey={'selectedRegions'}
        handleClickCheckbox={handleClickCheckbox}
        groupHeaderLabel="Region"
      />

      <MultiCheckboxDropdown
        options={Array.from(optionSets.Year).sort((a, b) => (a < b ? 1 : -1))}
        selectedOptions={selectedYears}
        handleClear={() => handleClearMultiSelect('selectedYears')}
        parentStateKey={'selectedYears'}
        handleClickCheckbox={handleClickCheckbox}
        groupHeaderLabel="Year"
      />

      <MultiCheckboxDropdown
        options={Array.from(optionSets.Chief_Name).sort()}
        selectedOptions={selectedChiefScientists}
        handleClear={() => handleClearMultiSelect('selectedChiefScientists')}
        parentStateKey={'selectedChiefScientists'}
        handleClickCheckbox={handleClickCheckbox}
        groupHeaderLabel="Chief Scientist"
      />

      <MultiCheckboxDropdown
        options={Array.from(optionSets.Series).sort()}
        selectedOptions={selectedSeries}
        handleClear={() => handleClearMultiSelect('selectedSeries')}
        parentStateKey={'selectedSeries'}
        handleClickCheckbox={handleClickCheckbox}
        groupHeaderLabel="Cruise Series"
      />

      <MultiCheckboxDropdown
        options={Array.from(optionSets.Sensors).sort()}
        selectedOptions={selectedSensors}
        handleClear={() => handleClearMultiSelect('selectedSensors')}
        parentStateKey={'selectedSensors'}
        handleClickCheckbox={handleClickCheckbox}
        groupHeaderLabel="Measurement Type"
      />

      <div className={classes.buttonWrapper}>
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
