import React from 'react';
import { Tabs, Tab, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import InfoTooltip from '../../../../shared/components/InfoTooltip';

const useStyles = makeStyles((theme) => ({
  tabs: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
  },
  tabWithInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
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
        <Tab
          key={tab.key}
          value={tab.key}
          label={
            tab.key === 'raw' ? (
              <div className={classes.tabWithInfo}>
                <span>{tab.label}</span>
                <InfoTooltip
                  title="These files are the original files uploaded prior to processing into the CMAP database"
                  fontSize="small"
                />
              </div>
            ) : tab.key === 'main' ? (
              <div className={classes.tabWithInfo}>
                <span>{tab.label}</span>
                <InfoTooltip
                  title="These files are processed by CMAP to be ingested into the CMAP database"
                  fontSize="small"
                />
              </div>
            ) : (
              tab.label
            )
          }
        />
      ))}
    </Tabs>
  );
};

export default TabNavigation;
