import React from 'react';
import { Link, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  datasetLink: {
    color: '#69fff2',
    textDecoration: 'underline',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    display: 'inline',
    '&:hover': {
      color: '#8bc34a',
    },
  },
}));

/**
 * DatasetNameLink - A reusable component for displaying dataset short names as clickable links
 *
 * @param {string} datasetShortName - The dataset short name (used for URL construction)
 * @param {string} [displayText] - Optional display text (defaults to datasetShortName)
 * @param {string} [className] - Optional custom className for the Link
 * @param {object} [typographyProps] - Optional props to pass to Typography component
 * @returns {JSX.Element} - A link that opens the dataset page in a new tab
 */
const DatasetNameLink = ({
  datasetShortName,
  displayText,
  className,
  typographyProps = {},
}) => {
  const classes = useStyles();

  if (!datasetShortName) {
    return <Typography {...typographyProps}>N/A</Typography>;
  }

  const text = displayText || datasetShortName;
  const url = `/catalog/datasets/${datasetShortName}`;

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className || classes.datasetLink}
    >
      <Typography {...typographyProps}>{text}</Typography>
    </Link>
  );
};

export default DatasetNameLink;
