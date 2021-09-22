// Expandable list of checkboxes used in search components

import React from "react";

import {
  withStyles,
  Grid,
  FormGroup,
  Checkbox,
  Link,
  FormControlLabel,
} from "@material-ui/core";
import { ExpandMore, ChevronRight } from "@material-ui/icons";

import colors from "../../enums/colors";

const styles = (theme) => ({
  menuOpenIcon: {
    color: colors.primary,
    margin: "0 8px 0 4px",
  },

  formGroupWrapper: {
    textAlign: "left",
    paddingLeft: "20px",
  },

  multiSelectHeader: {
    fontSize: "13px",
    margin: "6px 0px 2px 0px",
  },

  formControlLabelRoot: {
    height: "30px",
  },

  formControlLabelLabel: {
    fontSize: "14px",
  },

  checkboxGroupHeader: {
    "&:hover": {
      backgroundColor: colors.greenHover,
    },

    cursor: "pointer",
    height: "38px",
    boxShadow: "0px 0px 0px 1px #242424",
    marginTop: "8px",
  },
});

//component expects to be wrapped in a grid
const MultiCheckboxDrowndown = (props) => {
  const {
    classes,
    id,
    selectedOptions, //set
    handleClear,
    options,
    parentStateKey,
    handleClickCheckbox,
    groupHeaderLabel,
  } = props;

  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Grid
        item
        xs={12}
        container
        alignItems="center"
        className={classes.checkboxGroupHeader}
        id={id || "no-id"}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ExpandMore className={classes.menuOpenIcon} />
        ) : (
          <ChevronRight className={classes.menuOpenIcon} />
        )}
        {groupHeaderLabel}
      </Grid>

      {open ? (
        <Grid item xs={12} className={classes.formGroupWrapper}>
          {selectedOptions.size ? (
            <Grid
              item
              container
              cs={12}
              justify="flex-start"
              className={classes.multiSelectHeader}
            >
              <span style={{ marginRight: "8px" }}>
                {selectedOptions.size} Selected{" "}
              </span>
              <Link component="button" onClick={handleClear}>
                Reset
              </Link>
            </Grid>
          ) : (
            ""
          )}

          <FormGroup>
            {options.map((e, i) => (
              <Grid item xs={12} key={i}>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      onChange={handleClickCheckbox}
                      className={classes.checkbox}
                      size="small"
                      name={parentStateKey + "!!" + e}
                      checked={selectedOptions.has(e)}
                    />
                  }
                  label={e}
                  classes={{
                    root: classes.formControlLabelRoot,
                    label: classes.formControlLabelLabel,
                  }}
                />
              </Grid>
            ))}
          </FormGroup>
        </Grid>
      ) : (
        ""
      )}
    </>
  );
};

export default withStyles(styles)(MultiCheckboxDrowndown);
