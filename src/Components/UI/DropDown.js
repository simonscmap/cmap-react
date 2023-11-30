import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  Grid,
  FormGroup,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@material-ui/core';
import { ExpandMore, ChevronRight } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  dropDownGroup: { },
  icons: {
    color: theme.palette.primary.main,
  },
  handle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: `${theme.palette.primary.main}5e`,
    },
    cursor: 'pointer',
    height: '38px',
    // boxShadow: '0px 0px 0px 1px #242424',
  },
  labelExtras: {
    marginLeft: '1em'
  },
  content: {
    maxWidth: '200px'
  }
}));

const ExpandCloseIcon = ({ open }) => {
  const cl = useStyles();
  if (!open) {
    return <ChevronRight className={cl.icons} />
  } else {
    return <ExpandMore className={cl.icons} />
  }
};

const ContentContainer = ({ children, open, maxContentWidth }) => {
  const cl = useStyles();
  if (!open) {
    return '';
  } else {
    return (
      <div className={cl.content}>
        {children}
      </div>
    );
  }
}

export const DropDownContainer = (props) => {
  const {
    children,
    label,
    borderStyle,
    labelExtras,
  } = props;
  const cl = useStyles();
  const [isOpen, setOpen] = useState (false);
  return (
    <div className={cl.dropDownGroup}>
      <div
        className={cl.handle}
        onClick={() => setOpen(!isOpen)}
        style={{ boxShadow: borderStyle || '0px 0px 0px 1px #242424' }}>
        <ExpandCloseIcon open={isOpen} />
          <span>{label}</span>
          <div className={cl.labelExtras}>
            {labelExtras ? labelExtras : ''}
          </div>

      </div>
      <ContentContainer open={isOpen}>
        {children}
      </ContentContainer>
    </div>
  );
};


/* Checkboxes */

const useCheckboxStyles = makeStyles((theme) => ({
  formGroupWrapper: {
    textAlign: 'left',
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
  dropdownContentWrapper: {
    padding: '0',
    overflowY: 'scroll',
    overflowX: 'hidden',
    scrollbarColor: `${theme.palette.primary.main} transparent`,
    '&::-webkit-scrollbar': {
      width: '12px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary.main,
      borderRadius: '5px',
      border: 'none',
    },
  },
}));

export const CheckboxSet = (props) => {
  const {
    handleClickCheckbox,
    selected = [],
    options = [],
    groupPrefix = '',
    maxHeight = 165,
  } = props;

  const classes = useCheckboxStyles ();
  // make a singel checkbox

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
              name={groupPrefix + '!!' + label}
              checked={selected.has(label)}
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

  const noOptions = (
    <Typography variant="body2">{}</Typography>
  );

  // create a set of checkboxes
  return (
    <Grid item xs={12} className={classes.formGroupWrapper}>
      <div className={classes.dropdownContentWrapper} style={{ maxHeight: `${maxHeight}px` }}>
        <FormGroup>{options.length > 0 ? options.map(makeOption) : noOptions}</FormGroup>
      </div>
    </Grid>
  );
};

export const SelectSet = () => {

};
