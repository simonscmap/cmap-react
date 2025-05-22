import React from 'react';
import { makeStyles, Link } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import styles from './DatasetTitleLink.styles';
import CopyButton from '../../UI/CopyButton';

const useStyles = makeStyles(styles);

const DatasetTitleLink = (props) => {
  const { dataset, componentId = {} } = props;
  const { Long_Name, Short_Name } = dataset;
  const cl = useStyles();

  return (
    <div className={cl.linkContainer} {...componentId}>
      <span className={cl.inlineCopy}>
        <Link
          component={RouterLink}
          to={`/catalog/datasets/${Short_Name}`}
          className={cl.titleLink}
        >
          {Long_Name}
        </Link>
        <CopyButton text={Long_Name} />
      </span>
    </div>
  );
};

export default DatasetTitleLink;
