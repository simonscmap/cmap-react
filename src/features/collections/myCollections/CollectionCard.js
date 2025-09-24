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
  Warning as WarningIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Storage as DatasetIcon,
  CloudDownload as CloudDownloadIcon,
  Edit as EditIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
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
    gap: theme.spacing(1),
    marginTop: 'auto',
  },
  editButton: {
    color: theme.palette.secondary.main,
    border: `2px solid ${theme.palette.secondary.main}`,
    '&:hover': {
      border: `2px solid ${theme.palette.secondary.main}`,
      backgroundColor: 'rgba(34, 163, 185, 0.1)',
    },
    borderRadius: '36px',
    boxSizing: 'border-box',
    padding: '6px 16px',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: 'unset',
    textTransform: 'none',
    minWidth: '100px',
    '& span': {
      whiteSpace: 'nowrap',
    },
  },
  downloadButton: {
    color: theme.palette.primary.main,
    border: `2px solid ${theme.palette.primary.main}`,
    '&:hover': {
      border: `2px solid ${theme.palette.primary.main}`,
      backgroundColor: 'rgba(157, 209, 98, 0.1)',
    },
    borderRadius: '36px',
    boxSizing: 'border-box',
    padding: '6px 16px',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: 'unset',
    textTransform: 'none',
    minWidth: '100px',
    '& span': {
      whiteSpace: 'nowrap',
    },
  },
  titleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
    flexWrap: 'wrap',
  },
  title: {
    fontWeight: 600,
    lineHeight: 1.3,
    flexGrow: 1,
    minWidth: 0,
    fontSize: '1.4em',
  },
  statusChips: {
    display: 'flex',
    gap: theme.spacing(0.5),
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  publicChip: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
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
  metadataRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
  },
  metadataIcon: {
    fontSize: 16,
    color: theme.palette.text.secondary,
  },
  metadataText: {
    fontSize: '1rem',
    color: theme.palette.text.secondary,
  },
  buttonTextSpacer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: '8px',
    alignItems: 'center',
  },
}));

const CollectionCard = ({ collection }) => {
  const classes = useStyles();

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30)
      return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
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
          <Typography variant="body2" color="textSecondary" paragraph>
            {collection.description}
          </Typography>
        )}

        <Box className={classes.metadataRow}>
          <DatasetIcon className={classes.metadataIcon} />
          <Typography className={classes.metadataText}>
            {collection.datasetIds?.length || 0} datasets
          </Typography>
        </Box>

        <Box className={classes.metadataRow}>
          <Typography className={classes.metadataText}>
            Modified: {formatTimeAgo(collection.lastModified)}
          </Typography>
        </Box>
      </CardContent>

      <CardActions className={classes.cardActions}>
        <Button
          size="medium"
          variant="outlined"
          className={classes.editButton}
          onClick={handleEdit}
        >
          <div className={classes.buttonTextSpacer}>
            <EditIcon fontSize="small" />
            <span>Edit</span>
          </div>
        </Button>
        <Button
          size="medium"
          variant="outlined"
          className={classes.downloadButton}
          onClick={handleDownload}
        >
          <div className={classes.buttonTextSpacer}>
            <CloudDownloadIcon fontSize="small" />
            <span>Download</span>
          </div>
        </Button>
      </CardActions>
    </Card>
  );
};

export default CollectionCard;
