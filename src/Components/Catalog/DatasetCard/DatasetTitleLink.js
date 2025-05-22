import React from 'react';
import { makeStyles, Link } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import styles from './DatasetTitleLink.styles';
import PopperCopy from './ContentComponents/PopperCopy';

const useStyles = makeStyles(styles);

const DatasetTitleLink = (props) => {
  const { dataset, componentId = {} } = props;
  const { Long_Name, Short_Name } = dataset;
  const cl = useStyles();

  return (
    <div className={cl.linkContainer} {...componentId}>
      <PopperCopy
        text={Long_Name}
        label="dataset-title"
        contentStyle={{ width: '100%' }}
      >
        <Link
          component={RouterLink}
          to={`/catalog/datasets/${Short_Name}`}
          className={cl.titleLink}
        >
          {Long_Name}
        </Link>
      </PopperCopy>
    </div>
  );
};

export default DatasetTitleLink;
