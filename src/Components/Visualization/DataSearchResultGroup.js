import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withStyles, Grid, Tooltip, Typography } from '@material-ui/core';
import { Info, ExpandMore, ChevronRight, Star } from '@material-ui/icons';
import { VariableSizeList } from 'react-window';
import colors from '../../enums/colors';
import states from '../../enums/asyncRequestStates';

const makeGroupStyles = {
  searchOption: {
    '&:hover': {
      backgroundColor: colors.greenHover,
    },
    cursor: 'pointer',
    height: '38px',
    boxShadow: '0px 1px 1px 1px #242424',
    backgroundColor: 'rgba(0,0,0,.4)',
  },

  searchOptionsMenuItemText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: 'calc(100% - 36px)',
    textAlign: 'left',
  },

  heading: {
    textAlign: 'left',
    padding: '8px 6px',
    color: colors.primary,
    fontSize: '16px',
    marginTop: '5px',
    backgroundColor: 'rgba(0,0,0,.4)',
  },

  variableItem: {
    height: '32px',
    // paddingLeft: '48px',
    textAlign: 'left',
    fontSize: '14px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: colors.greenHover,
    },
  },

  variablesWrapper: {
    backgroundColor: 'rgba(0,0,0,.2)',
    paddingTop: '8px',
  },

  memberCount: {
    color: colors.primary,
    fontWeight: 'bold',
  },

  datasetOpenIcon: {
    color: colors.primary,
    margin: '0 8px 0 4px',
  },

  infoIcon: {
    color: colors.primary,
    cursor: 'pointer',
  },

  listHeader: {
    color: colors.primary,
    backgroundColor: 'rgba(0,0,0,.2)',
    textAlign: 'left',
  },

  variableName: {
    paddingLeft: '48px',
  },
};


const mapStateToProps = (state) => ({
  vizSearchResultsLoadingState: state.vizSearchResultsLoadingState,
  cart: state.cart,
});

const mapDispatchToProps = {};

// One section of the product list corresponding to one make
const DataSearchResultGroup = connect(
  mapStateToProps,
  mapDispatchToProps,
)(
  withStyles(makeGroupStyles)(
    React.memo((props) => {
      const {
        classes,
        options,
        vizSearchResultsLoadingState,
        handleSelectDataTarget,
        handleSetVariableDetailsID,
        setdatasetSummaryID,
        listRef,
        make,
        fullCount,
        cart,
      } = props;
      const [openIndex, setOpenIndex] = React.useState(null);

      const handleSetOpenClick = (i) => {
        if (listRef.current) {
          listRef.current.resetAfterIndex(0);

          // Make sure the group being opened is in view
          let currentOffset = listRef.current.state.scrollOffset;
          let targetOffset = i * 38;

          if (
            i !== null &&
            (targetOffset < currentOffset - 10 ||
              targetOffset > currentOffset + props.height - 20)
          ) {
            setTimeout(() => listRef.current.scrollToItem(i, 'start'), 10);
          }
        }
        setOpenIndex(i);
      };

      useEffect(() => {
        if (listRef.current) listRef.current.resetAfterIndex(0);
      }, [options]);

      const varCount = options.reduce(
        (acc, cur) => acc + cur.variables.length,
        0,
      );
      const nonvisualizableDatasetCount = fullCount - options.length;
      const nonvisualizableString =
        nonvisualizableDatasetCount === 0
          ? ''
          : ` (${nonvisualizableDatasetCount} hidden)`;

      return (
        <>
          <Grid container>
            <Grid item xs={9}>
              <Typography className={classes.heading}>
                {vizSearchResultsLoadingState === states.inProgress ? (
                  'Searching....'
                ) : varCount ? (
                  <React.Fragment>
                    <span>
                      {make} Data - Showing {options.length} datasets
                    </span>
                    <Tooltip
                      enterDelay={50}
                      placement="top"
                      title="Variables and datasets which are not flagged as visualizable are not shown on this list, but can be found on the catalog page."
                    >
                      <span>{nonvisualizableString}</span>
                    </Tooltip>
                  </React.Fragment>
                ) : (
                  `${make} Data - No variables found for current search parameters`
                )}
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
                Variable Count
              </Typography>
            </Grid>
          </Grid>

          <VariableSizeList
            ref={listRef}
            itemData={options}
            itemCount={options.length}
            height={props.height || 270}
            width="100%"
            estimatedItemSize={38}
            style={{ overflowY: 'scroll' }}
            itemSize={(i) =>
              openIndex === i ? options[i].variables.length * 32 + 38 + 8 : 38
            }
          >
            {({ index, style }) => (
              <div style={style}>
                <Grid
                  container
                  className={classes.searchOption}
                  onClick={() =>
                    index === openIndex
                      ? handleSetOpenClick(null)
                      : handleSetOpenClick(index)
                  }
                >
                  <Grid item xs={9} container alignItems="center">
                    {openIndex === index ? (
                      <ExpandMore className={classes.datasetOpenIcon} />
                    ) : (
                      <ChevronRight className={classes.datasetOpenIcon} />
                    )}
                    <span className={classes.searchOptionsMenuItemText}>
                      {options[index].Dataset_Name ||
                        options[index].Dataset_Name}
                    </span>
                  </Grid>

                  <Tooltip
                    title={`Dataset contains ${options[index].variables.length} variables matching the search criteria`}
                  >
                    <Grid
                      item
                      xs={1}
                      className={classes.memberCount}
                      container
                      alignItems="center"
                      justify="center"
                    >
                      {options[index].variables.length}
                    </Grid>
                  </Tooltip>

                  <Grid
                    item
                    xs={1}
                    style={{ paddingLeft: '12px' }}
                    container
                    alignItems="center"
                  >
                    <Tooltip title="View Dataset Details">
                      <Info
                        className={classes.infoIcon}
                        onClick={(event) => {
                          event.stopPropagation();
                          setdatasetSummaryID(
                            options[index].variables[0].Dataset_ID,
                          );
                        }}
                      />
                    </Tooltip>
                  </Grid>

                  <Grid item xs={1} container alignItems="center">
                    {cart[options[index].Dataset_Name] ? (
                      <Tooltip title="This dataset is on your favorites list">
                        <Star />
                      </Tooltip>
                    ) : (
                      ''
                    )}
                  </Grid>
                </Grid>

                {index === openIndex ? (
                  <Grid container className={classes.variablesWrapper}>
                    {options[index].variables.map((e, i) => (
                      <Grid
                        item
                        xs={12}
                        key={e.Long_Name}
                        className={classes.variableItem}
                        container
                        alignItems="center"
                        onClick={() => handleSelectDataTarget(e)}
                      >
                        <Grid item xs={10} className={classes.variableName}>
                          {e.Long_Name}
                        </Grid>
                        <Grid item xs={2}>
                          <Tooltip title="View Variable Details">
                            <Info
                              onClick={(event) => {
                                event.stopPropagation();
                                handleSetVariableDetailsID(e.ID);
                              }}
                              style={{ paddingLeft: '12px' }}
                              className={classes.infoIcon}
                            />
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
        </>
      );
    }),
  ),
);

export default DataSearchResultGroup;
