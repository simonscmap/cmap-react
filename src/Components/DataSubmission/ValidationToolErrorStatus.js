import React from 'react';
import { useSelector } from 'react-redux';
import { Typography, Divider } from '@material-ui/core';
import { ErrorOutline } from '@material-ui/icons';
import { auditKeyToLabel } from './ValidationToolConstants';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  statusArea: {
    color: 'white',
  },
  errorOverview: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: '1em',
    alignItems: 'center',
    '& span': {
      display: 'inline-block',
      width: '200px',
      fontSize: '.9em',
    },
    '& p': {
      margin: 0,
    },
  },
}));

const errorOutlineStyle = {
  color: 'rgb(255, 0, 0)',
  margin: '0 2px -5px 0',
  fontSize: '1.4em',
};

const IssueSummary = (props) => {
  const cl = useStyles();
  const { step } = props;
  const auditReport = useSelector((state) => state.auditReport);
  const errorCount = auditReport && auditReport.errorCount;

  if (step < 1) {
    return <React.Fragment />;
  }

  if (!errorCount) {
    return '';
  }

  const noErrors =
    0 ===
    Object.keys(errorCount).reduce((acc, curr) => {
      const count = errorCount[curr] || 0;
      return acc + count;
    }, 0);

  if (noErrors) {
    return '';
  }

  const categories = [
    'workbook',
    'data',
    'dataset_meta_data',
    'vars_meta_data',
  ];

  return (
    <div className={cl.statusArea}>
      <Typography variant="h6">Issue Summary</Typography>
      <div>
        {categories.map((eKey, i) => {
          if (errorCount[eKey] === 0) {
            return '';
          }
          return (
            <div key={`_${eKey},${i}`} className={cl.errorOverview}>
              <span>{auditKeyToLabel[eKey]}:</span>
              <Typography variant="body2">
                <ErrorOutline style={errorOutlineStyle} />
                {errorCount[eKey]} errors
              </Typography>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IssueSummary;
