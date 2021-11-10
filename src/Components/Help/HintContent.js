import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core';
import '../../Stylesheets/hint-stylesheet.css';

const useStyles = makeStyles({
  hintWrapper: {
    padding: '.6em',
  },
});

const CatalogPageTitleHint = ({ children }) => {
  const theme = useTheme();
  const classes = useStyles(theme);
  return (
    <div className={`${classes.hintWrapper} hint-content-wrapper`}>
      {children}
    </div>
  );
};

export default CatalogPageTitleHint;
