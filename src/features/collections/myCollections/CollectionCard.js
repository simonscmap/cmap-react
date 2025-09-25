import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  Button,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Storage as DatasetIcon } from '@material-ui/icons';
import colors from '../../../enums/colors';
import MetadataRow from './MetadataRow';

const useStyles = makeStyles((theme) => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${colors.secondary}`,
    '&:hover': {
      boxShadow: theme.shadows[4],
    },
  },
  cardContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing(1),
  },
  cardActions: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    justifyContent: 'flex-end',
    gap: theme.spacing(0.5),
    marginTop: 'auto',
  },
  editButton: {
    color: '#9e9e9e',
    border: '2px solid #9e9e9e',
    '&:hover': {
      border: '2px solid #9e9e9e',
      backgroundColor: 'rgba(158, 158, 158, 0.1)',
    },
    borderRadius: '20px',
    boxSizing: 'border-box',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: 1,
    textTransform: 'none',
    minWidth: 'auto',
    width: 'fit-content',
    height: '28px',
  },
  downloadButton: {
    color: colors.primary,
    border: `2px solid ${colors.primary}`,
    '&:hover': {
      border: `2px solid ${colors.primary}`,
      backgroundColor: colors.greenHover,
    },
    borderRadius: '20px',
    boxSizing: 'border-box',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: 1,
    textTransform: 'none',
    minWidth: 'auto',
    width: 'fit-content',
    height: '28px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
    flexWrap: 'wrap',
  },
  title: {
    fontWeight: 400,
    lineHeight: 1.3,
    flexGrow: 1,
    minWidth: 0,
    fontSize: '1.4em',
    color: 'rgb(105, 255, 242)',
  },
  statusChips: {
    display: 'flex',
    gap: theme.spacing(0.5),
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  publicChip: {
    backgroundColor: colors.primary,
    color: 'white',
    fontSize: '0.7rem',
    height: 22,
  },
  privateChip: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    fontSize: '0.7rem',
    height: 22,
  },
  warningChip: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
    fontSize: '0.7rem',
    height: 22,
  },
}));

const CollectionCard = ({ collection }) => {
  const classes = useStyles();

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit collection:', collection.id);
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log('Download collection:', collection.id);
  };

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Box className={classes.titleRow}>
          <Typography variant="h5" className={classes.title}>
            {collection.name}
          </Typography>
          <Box className={classes.statusChips}>
            <Chip
              label={collection.isPublic ? 'PUBLIC' : 'PRIVATE'}
              size="small"
              className={
                collection.isPublic ? classes.publicChip : classes.privateChip
              }
            />
            {collection.hasInvalidDatasets && (
              <Chip
                label="Contains inactive datasets"
                size="small"
                className={classes.warningChip}
              />
            )}
          </Box>
        </Box>

        {collection.description && (
          <Typography
            variant="body2"
            paragraph
            style={{ color: 'white', fontSize: '1rem' }}
          >
            {collection.description}
          </Typography>
        )}

        <MetadataRow
          label="Dataset Count"
          value={collection.datasetIds?.length || 0}
          isCount={true}
        />
        <MetadataRow
          label="Last Modified"
          value={formatDateTime(collection.lastModified)}
        />
      </CardContent>

      <CardActions className={classes.cardActions}>
        <Button
          size="medium"
          variant="outlined"
          className={classes.editButton}
          onClick={handleEdit}
        >
          Edit
        </Button>
        <Button
          size="medium"
          variant="outlined"
          className={classes.downloadButton}
          onClick={handleDownload}
        >
          Download
        </Button>
      </CardActions>
    </Card>
  );
};

export default CollectionCard;
