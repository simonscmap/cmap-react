import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  tabs: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
  },
}));

const TabNavigation = ({ currentTab, tabs, onChange }) => {
  const classes = useStyles();

  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  return (
    <Tabs
      value={currentTab}
      onChange={handleChange}
      className={classes.tabs}
      indicatorColor="primary"
      textColor="primary"
    >
      {tabs.map((tab) => (
        <Tab key={tab.key} label={tab.label} value={tab.key} />
      ))}
    </Tabs>
  );
};

export default TabNavigation;