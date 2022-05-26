import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withStyles, Grid, Tooltip, Typography } from '@material-ui/core';
import { Info, ExpandMore, ChevronRight, Star } from '@material-ui/icons';
import { VariableSizeList } from 'react-window';
import Hint from '../Navigation/Help/Hint';
import ObservationDataGroupHint from './help/ObservationDataGroupHint';
import ModelDataGroupHint from './help/ModelDataGroupHint';
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

  headingWrapper: {
    position: 'relative',
    display: 'inline-block',
    marginRight: '3em',
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

const getHintVariant = (makeOption) => {
  if (makeOption === 'Observation') {
    return ObservationDataGroupHint;
  }
  if (makeOption === 'Model') {
    return ModelDataGroupHint;
  }
};

// Columns in the result list:

const DatasetTitleColumn = (props) => {
  const { classes, isOpen, name } = props;
  return (
    <Grid item xs={9} container alignItems="center">
      {isOpen ? (
        <ExpandMore className={classes.datasetOpenIcon} />
      ) : (
        <ChevronRight className={classes.datasetOpenIcon} />
      )}
      <span className={classes.searchOptionsMenuItemText}>{name}</span>
    </Grid>
  );
};

const VariableCountColumn = ({ count, classes }) => {
  return (
    <Tooltip
      title={`Dataset contains ${count} variables matching the search criteria`}
    >
      <Grid
        item
        xs={1}
        className={classes.memberCount}
        container
        alignItems="center"
        justifyContent="center"
      >
        {count}
      </Grid>
    </Tooltip>
  );
};

const FavoriteColumn = ({ options, index, cart }) => {
  return (
    <Grid item xs={1} container alignItems="center">
      {cart[options[index].Dataset_Name] && (
        <Tooltip title="This dataset is on your favorites list">
          <Star />
        </Tooltip>
      )}
    </Grid>
  );
};

const DatasetInfoColumn = (props) => {
  const { setDatasetSummaryID, datasetID, classes } = props;
  return (
    <Grid
      item
      xs={1}
      style={{ paddingLeft: '12px' }}
      container
      alignItems="center"
      className={'dataset-details-button'}
    >
      <Tooltip title="View Dataset Details">
        <Info
          className={classes.infoIcon}
          onClick={(event) => {
            event.stopPropagation();
            setDatasetSummaryID(datasetID);
          }}
        />
      </Tooltip>
    </Grid>
  );
};

// display search status, or results summary in Header
const Header = ({
  classes,
  vizSearchResultsLoadingState,
  make,
  options,
  fullCount,
}) => {
  const varCount = options.reduce((acc, cur) => acc + cur.variables.length, 0);
  const nonvisualizableDatasetCount = fullCount - options.length;
  const nonvisualizableString =
    nonvisualizableDatasetCount === 0
      ? ''
      : ` (${nonvisualizableDatasetCount} hidden)`;

  return (
    <Grid container>
      <Grid item xs={9}>
        <Typography
          id={`${make}-data-results-header`}
          className={classes.heading}
          component={'div'}
        >
          {vizSearchResultsLoadingState === states.inProgress ? (
            'Searching....'
          ) : varCount ? (
            <div className={classes.headingWrapper}>
              <Hint
                content={getHintVariant(make)}
                position={{ beacon: 'top-end', hint: 'bottom-end' }}
                styleOverride={{
                  beacon: { right: '-1.5em', top: '-.5em' },
                }}
              >
                <span>
                  {make} Data - Showing {options.length} datasets
                </span>
              </Hint>

              <Tooltip
                enterDelay={50}
                placement="top"
                title="Variables and datasets which are not flagged as visualizable are not shown on this list, but can be found on the catalog page."
              >
                <span>{nonvisualizableString}</span>
              </Tooltip>
            </div>
          ) : (
            `${make} Data - No variables found for current search parameters`
          )}
        </Typography>
      </Grid>

      <Grid item xs={3} container justify="flex-start" alignItems="center">
        <Typography
          id={`${make}-variable-count-label`}
          variant="caption"
          style={{ color: colors.primary, marginBottom: '-16px' }}
        >
          Variable Count
        </Typography>
      </Grid>
    </Grid>
  );
};

// One section of the product list corresponding to one make
const DataSearchResultGroup = (props) => {
  const {
    classes,
    options,
    vizSearchResultsLoadingState,
    handleSelectDataTarget,
    handleSetVariableDetailsID,
    setDatasetSummaryID,
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
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [options, listRef]);

  return (
    <div id={`${make}-results-wrapper`}>
      <Header
        options={options}
        make={make}
        classes={classes}
        vizSearchResultsLoadingState={vizSearchResultsLoadingState} // get this from redux redux
        fullCount={fullCount} // get this from redux
      />

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
          <div style={style} className={`list-entry`}>
            <Grid
              container
              className={classes.searchOption}
              onClick={() =>
                handleSetOpenClick(index === openIndex ? null : index)
              } // toggle entry based on whether it matches openIndex
            >
              <DatasetTitleColumn
                name={options[index].Dataset_Name}
                classes={classes}
                isOpen={openIndex === index}
              />

              <VariableCountColumn
                count={options[index].variables.length}
                classes={classes}
              />

              <DatasetInfoColumn
                setDatasetSummaryID={setDatasetSummaryID}
                datasetID={options[index].variables[0].Dataset_ID}
                classes={classes}
              />

              <FavoriteColumn options={options} index={index} cart={cart} />
            </Grid>

            {index === openIndex && ( // if this entry is expanded, render an entry for each matching variable
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
            )}
          </div>
        )}
      </VariableSizeList>
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(makeGroupStyles)(React.memo(DataSearchResultGroup)));
