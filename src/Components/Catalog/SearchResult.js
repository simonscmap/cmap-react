// An individual result from catalog search

import React from 'react';
import { connect } from 'react-redux';
import {
  withStyles,
  Grid,
  Typography,
  Paper,
  Tooltip,
  Link,
  Button,
} from '@material-ui/core';
import { Info, ErrorOutline } from '@material-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import CartAddOrRemove from './CartAddOrRemove';
import { setShowCart } from '../../Redux/actions/ui';
import colors from '../../enums/colors';
import Hint from '../Help/Hint';
import AddToFavorites from '../Catalog/help/addToFavoritesHint';

const mapStateToProps = (state, ownProps) => ({
  cart: state.cart,
});

const mapDispatchToProps = {
  setShowCart,
};

const styles = (theme) => ({
  resultWrapper: {
    padding: '4px 12px',
    height: '200px',
  },

  image: {
    maxWidth: '15vw',
    height: '170px',
    marginTop: '12px',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },

  gridRow: {
    marginBottom: '8px',
    textAlign: 'left',
  },

  longName: {
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '1.15rem',
    display: 'block',
    margin: '6px 0',
    color: colors.primary,
  },

  resultPaper: {
    marginTop: '22px',
  },

  denseText: {
    fontSize: '.9rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  moreInfoButton: {
    textTransform: 'none',
    color: theme.palette.primary.main,
    paddingLeft: '4px',
  },

  cartButtonClass: {
    textTransform: 'none',
    color: theme.palette.primary.main,
    paddingLeft: '4px',
    marginLeft: '16px',
  },

  warningIcon: {
    color: '#e3e61a',
    marginLeft: '14px',
    marginBottom: '-7px',
    fontSize: '1.45rem',
  },
});

const SearchResult = (props) => {
  const { classes, cart, dataset, index } = props;
  const {
    // Dataset_ID,
    Data_Source,
    Depth_Max,
    Icon_URL,
    Long_Name,
    Process_Level,
    Sensors,
    Short_Name,
    Temporal_Resolution,
    Time_Max,
    Time_Min,
    Visualize,
    Spatial_Resolution,
  } = dataset;

  const AddToCartButton = ({ dataset }) => {
    return (
      <CartAddOrRemove
        dataset={dataset}
        cartButtonClass={classes.cartButtonClass}
      />
    );
  };
  const AddToCart = ({ dataset }) => {
    return index !== 0 ? (
      <AddToCartButton dataset={dataset} />
    ) : (
      <Hint
        content={AddToFavorites}
        styleOverride={{ wrapper: { display: 'inline-block' } }}
        position={{ beacon: 'right-start', hint: 'bottom-end' }}
        size={'small'}
      >
        <AddToCartButton dataset={dataset} />
      </Hint>
    );
  };

  return (
    <Paper className={classes.resultPaper} elevation={4}>
      <Grid container className={classes.resultWrapper}>
        <Grid item xs={12} md={8} className={classes.gridRow}>
          <Tooltip title={Long_Name} enterDelay={400} placement="top">
            <Link
              component={RouterLink}
              to={`/catalog/datasets/${Short_Name}`}
              className={classes.longName}
              onClick={() => props.setShowCart(false)}
            >
              {Long_Name}
            </Link>
          </Tooltip>

          <Typography className={classes.denseText}>
            {Process_Level} Data from {Data_Source}
          </Typography>

          <Typography className={classes.denseText}>
            Sensor{Sensors.length > 1 ? 's' : ''}: {Sensors.join(', ')}
          </Typography>

          <Typography className={classes.denseText}>
            Temporal Resolution: {Temporal_Resolution}
          </Typography>

          <Typography className={classes.denseText}>
            Temporal Coverage:{' '}
            {Time_Min && Time_Max
              ? ` ${Time_Min.slice(0, 10)} to ${Time_Max.slice(0, 10)}`
              : 'NA'}
          </Typography>

          <Typography className={classes.denseText}>
            Spatial Resolution: {Spatial_Resolution}
          </Typography>

          <Typography className={classes.denseText}>
            {Depth_Max ? 'Multiple Depth Levels' : 'Surface Level Data'}
          </Typography>

          <Button
            variant="text"
            color="primary"
            className={classes.moreInfoButton}
            startIcon={<Info />}
            component={RouterLink}
            to={`/catalog/datasets/${Short_Name}`}
            onClick={() => props.setShowCart(false)}
          >
            More Info
          </Button>

          <AddToCart dataset={dataset} />

          {!Visualize && cart[Long_Name] ? (
            <Tooltip
              title="This dataset contains no visualizable variables, and will not appear on the visualization page."
              placement="top"
            >
              <ErrorOutline className={classes.warningIcon} />
            </Tooltip>
          ) : (
            ''
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <img src={Icon_URL} alt={Short_Name} className={classes.image} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(SearchResult));
