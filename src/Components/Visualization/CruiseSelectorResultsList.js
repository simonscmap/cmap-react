import {
  Checkbox,
  Grid,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {ChevronRight, ExpandMore} from '@material-ui/icons';
import React from 'react';
import { VariableSizeList } from 'react-window';
import { useSelector } from 'react-redux';
import styles from './cruiseSelectorStyles';

const useStyle = makeStyles (styles);

const renderGroupTitle = (groupBy, groupTitle) => {
  if (groupBy === 'Regions') {
    return groupTitle.split(',').join(', ')
  } else {
    return groupTitle;
  }
}

const TRAJECTORY_POINTS_LIMIT = 70000;

const Results = (props) => {
  const {
    listRef,
    groupedCruises,
    openGroup,
    groupBy,
    handleSetOpenGroup,
    selected,
    pointCount,
    handleCruiseSelect,
  } = props;

  const windowHeight = useSelector((state) => state.windowHeight);
  const classes = useStyle();

  const selectedOverLimit = (selected.length > 1 && pointCount > TRAJECTORY_POINTS_LIMIT);
  const selectionDisabled = selectedOverLimit;

  return (
    <VariableSizeList
      ref={listRef}
      itemData={groupedCruises}
      itemCount={groupedCruises.length}
      height={windowHeight - 325} // old value: - 249
      width="100%"
      estimatedItemSize={38}
      style={{ overflowY: 'scroll' }}
      itemSize={(i) => {
        // line height 38px '.variableItem'
        //
        return openGroup === groupedCruises[i][groupBy]
          ? groupedCruises[i].cruises.length * 38 + 38 + 4 + 10 + 40
          : 38
      }}
    >
      {({ index, style }) => (
        <div style={style}>
          <Grid
            container
            className={classes.searchOption}
            onClick={() => handleSetOpenGroup(
              index,
              groupedCruises[index][groupBy],
            )
            }
          >
            <Grid item xs={10} container alignItems="center" className={'group-by-label'}>
              {openGroup === groupedCruises[index][groupBy] ? (
                <ExpandMore className={classes.datasetOpenIcon} />
              ) : (
                <ChevronRight className={classes.datasetOpenIcon} />
              )}
              <Typography noWrap={true} className={classes.groupedByValue}>
                { groupedCruises[index][groupBy]
                  ? renderGroupTitle(groupBy, groupedCruises[index][groupBy])
                  : 'Other'}
              </Typography>
            </Grid>
            <Grid item xs={2}
              className={classes.memberCount}
              container
              alignItems="center"
              justifyContent="flex-end">
              {groupedCruises[index].cruises.length} Cruises
            </Grid>
          </Grid>

          {groupedCruises[index][groupBy] === openGroup ? (
            <Grid container className={classes.variablesWrapper}>
              <Grid item container alignItems="center">
                <Grid item xs={1} className={classes.cruiseItemRowHeader}>
                  Select
                </Grid>
                <Grid item xs={1} className={classes.cruiseItemRowHeader}>
                  Official Designation
                </Grid>
                <Grid item xs={2} className={classes.cruiseItemRowHeader}>
                  Nickname
                </Grid>
                <Grid item xs={1} className={classes.cruiseItemRowHeader}>
                  Ship Name
                </Grid>
                <Grid item xs={1} className={classes.cruiseItemRowHeader}>
                  Year
                </Grid>
                <Grid item xs={2} className={classes.cruiseItemRowHeader}>
                  Chief Scientist
                </Grid>
                <Grid item xs={2} className={classes.cruiseItemRowHeader}>
                  Series
                </Grid>
                <Grid item xs={2} className={classes.cruiseItemRowHeader}>
                  Measurment Types
                </Grid>
              </Grid>

              {groupedCruises[index].cruises.map((cruise) => (
                <Grid container item xs={12} key={cruise.Name} className={classes.variableItem} alignItems="center">
                  <Grid item xs={1}>
                    <div className={classes.checkBoxWrapper}>
                      <Checkbox
                        disabled={selected && !selected.includes(cruise.Name) && selectionDisabled}
                        className={classes.cruiseCheckbox}
                        checked={selected && selected.includes(cruise.Name)}
                        onClick={() => handleCruiseSelect(cruise)} />
                    </div>
                  </Grid>
                  <Grid item xs={1} className={classes.cruiseItemRow}>
                    <a href={`/catalog/cruises/${cruise.Name}`} target='_blank' rel="noreferrer">{cruise.Name}</a>
                  </Grid>
                  <Grid item xs={2} className={classes.cruiseItemRow}>
                    <Tooltip title={cruise.Nickname} enterDelay={200}>
                      <span>{cruise.Nickname}</span>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={1} className={classes.cruiseItemRow}>
                    {cruise.Ship_Name}
                  </Grid>
                  <Grid item xs={1} className={classes.cruiseItemRow}>
                    {cruise.Year}
                  </Grid>
                  <Grid item xs={2} className={classes.cruiseItemRow}>
                    {cruise.Chief_Name}
                  </Grid>
                  <Grid item xs={2} className={classes.cruiseItemRow}>
                    {cruise.Series}
                  </Grid>
                  <Grid item xs={2} className={classes.cruiseItemRow}>
                    <Tooltip title={cruise.Sensors.join(', ')} enterDelay={200}>
                      <Typography noWrap={true}>{cruise.Sensors.join(', ')}</Typography>
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
  );
}

export default Results;
