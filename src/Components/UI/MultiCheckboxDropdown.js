// Expandable list of checkboxes used in search components

import React, { useState, useEffect } from 'react';
import {
  withStyles,
  Grid,
  FormGroup,
  Checkbox,
  Link,
  FormControlLabel,
} from '@material-ui/core';
import { ExpandMore, ChevronRight } from '@material-ui/icons';
import colors from '../../enums/colors';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { pathNameToPageName } from '../../Utility/routing';
import initLogger from '../../Services/log-service';

const log = initLogger('MultiCheckDropdown.js');

const styles = (theme) => ({
  menuOpenIcon: {
    color: colors.primary,
    margin: '0 8px 0 4px',
  },
  formGroupWrapper: {
    textAlign: 'left',
    paddingLeft: '20px',
  },
  multiSelectHeader: {
    fontSize: '13px',
    margin: '6px 0px 2px 0px',
  },
  formControlLabelRoot: {
    height: '30px',
  },
  formControlLabelLabel: {
    fontSize: '14px',
  },
  checkboxGroupHeader: {
    '&:hover': {
      backgroundColor: colors.greenHover,
    },
    cursor: 'pointer',
    height: '38px',
    boxShadow: '0px 0px 0px 1px #242424',
    marginTop: '8px',
  },
  dropdownContentWrapper: {
    maxHeight: '500px',
    padding: '6px 0',
    overflowY: 'scroll',
    overflowX: 'hidden',
    scrollbarColor: '#9dd162 transparent',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '9dd162',
      borderRadius: '5px',
      border: 'none',
    },
  },
});

const DropDownHandle = ({ groupHeaderLabel, isOpen, classes, onClick, id }) => {
  return (
    <Grid
      item
      xs={12}
      container
      alignItems="center"
      className={classes.checkboxGroupHeader}
      id={id || 'no-id'}
      onClick={onClick}
    >
      {isOpen ? (
        <ExpandMore className={classes.menuOpenIcon} />
      ) : (
        <ChevronRight className={classes.menuOpenIcon} />
      )}
      {groupHeaderLabel}
    </Grid>
  );
};

const CollapsibleContent = ({
  classes,
  handleClear,
  handleClickCheckbox,
  options,
  parentStateKey,
  selectedOptions,
}) => {
  log.debug ('selectedOptions', { key: parentStateKey, selectedOptions });
  log.debug ('options', { key: parentStateKey,options });
  const countAndResize = (
    <Grid
      item
      container
      cs={12}
      justify="flex-start"
      className={classes.multiSelectHeader}
    >
      <span style={{ marginRight: '8px' }}>
        {selectedOptions.size} Selected{' '}
      </span>
      <Link component="button" onClick={handleClear}>
        Reset
      </Link>
    </Grid>
  );

  const makeOption = (label, index) => {
    return (
      <Grid item xs={12} key={index}>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              onChange={handleClickCheckbox}
              className={classes.checkbox}
              size="small"
              name={parentStateKey + '!!' + label}
              checked={selectedOptions.has(label)}
            />
          }
          label={label}
          classes={{
            root: classes.formControlLabelRoot,
            label: classes.formControlLabelLabel,
          }}
        />
      </Grid>
    );
  };

  return (
    <Grid item xs={12} className={classes.formGroupWrapper}>
      <div className={classes.dropdownContentWrapper}>
        {selectedOptions.size > 0 && countAndResize}
        <FormGroup>{options.map(makeOption)}</FormGroup>
      </div>
    </Grid>
  );
};

//component expects to be wrapped in a grid
const MultiCheckboxDrowndown = (props) => {
  const [open, setOpenState] = useState(false);
  const toggleOpenState = () => {
    setOpenState(!open);
  };

  // if user starts an intro tour, close the dropdown
  let { pathname } = useLocation();
  let pageName = pathNameToPageName(pathname);
  let intro = useSelector((state) => state.intros[pageName]);
  useEffect(() => {
    if (intro) {
      setOpenState(false);
    }
  }, [intro]);

  return (
    <React.Fragment>
      <DropDownHandle {...props} onClick={toggleOpenState} isOpen={open} />
      {open && <CollapsibleContent {...props} />}
    </React.Fragment>
  );
};

export default withStyles(styles)(MultiCheckboxDrowndown);
