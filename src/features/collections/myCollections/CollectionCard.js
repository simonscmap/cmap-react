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
import {
  Storage as DatasetIcon,
  Warning as WarningIcon,
} from '@material-ui/icons';
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
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginTop: 'auto',
  },
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing(0.5),
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
    alignItems: 'center',
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
    backgroundColor: '#c8e6c9',
    color: '#2e7d32',
    fontSize: '0.62rem',
    height: 20,
    fontWeight: 400,
    borderRadius: '6px',
  },
  privateChip: {
    backgroundColor: '#ffcdd2',
    color: '#c62828',
    fontSize: '0.62rem',
    height: 20,
    fontWeight: 400,
    borderRadius: '6px',
  },
  warningSection: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  warningText: {
    color: colors.errorYellow,
    fontSize: '0.75rem',
  },
  warningIcon: {
    color: colors.errorYellow,
    fontSize: '1rem',
  },
}));

const CollectionCard = ({ collection }) => {
  const classes = useStyles();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE'); // YYYY-MM-DD format
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('sv-SE'); // YYYY-MM-DD format
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dateStr}, ${timeStr}`;
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
          value={collection.datasetCount || 0}
          isCount={true}
        />
        <MetadataRow
          label="Last Modified"
          value={formatDateTime(collection.modifiedDate)}
        />
      </CardContent>

      <CardActions className={classes.cardActions}>
        <Box>
          {collection.hasInvalidDatasets && (
            <Box className={classes.warningSection}>
              <WarningIcon className={classes.warningIcon} />
              <Typography className={classes.warningText}>
                Contains inactive datasets
              </Typography>
            </Box>
          )}
        </Box>
        <Box className={classes.buttonGroup}>
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
        </Box>
      </CardActions>
    </Card>
  );
};

export default CollectionCard;
