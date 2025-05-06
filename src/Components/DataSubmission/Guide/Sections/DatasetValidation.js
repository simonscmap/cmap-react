import React, { useState, useEffect } from 'react';
import { RxDotFilled } from 'react-icons/rx';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { sectionStyles } from '../guideStyles';
import { GuideLink } from '../Links';

// foci
const foci = {};
const fociList = Object.keys(foci);
const isValidFocus = (id) => {
  return fociList.includes(id);
};

// component
const Content = (props) => {
  const cl = sectionStyles();
  const { focus, setFocus } = props;

  // state for accordion
  // panel names match the focus value
  let [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    toggleFocus(panel);
  };

  const toggleFocus = (id) => {
    console.log('toggle', id);
    if (!id) {
      return;
    } else if (focus === id) {
      setFocus(undefined);
    } else if (isValidFocus(id)) {
      setFocus(id);
    }
  };

  useEffect(() => {
    if (focus && expanded !== focus && isValidFocus(focus)) {
      setExpanded(focus);
    }
  }, [focus]);

  return (
    <div className={cl.container}>
      <Typography>
        Dataset validation occurs throughout the dataset submission process:
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon>
            <RxDotFilled />
          </ListItemIcon>
          <ListItemText>
            Pre-submission, the{' '}
            <GuideLink hash="#validation-api">CMAP Validation API</GuideLink> is
            available for users to use to check and update their own datasets.
            Use of the CMAP Validation API prior to dataset submission expedites
            the dataset submission and review process. Use of this tool before
            dataset submission is optional.
          </ListItemText>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <RxDotFilled />
          </ListItemIcon>
          <ListItemText>
            During submission, the{' '}
            <GuideLink hash="#submission-portal">Submission Portal</GuideLink>{' '}
            is used to submit datasets to Simons CMAP. This tool checks the
            dataset and walks users through a series of steps to resolve any
            data or formatting issues.
          </ListItemText>
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <RxDotFilled />
          </ListItemIcon>
          <ListItemText>
            Post-submission, the{' '}
            <GuideLink hash="#validation-api">CMAP Validation API</GuideLink> is
            the primary tool used by the CMAP data curation team for reviewing
            datasets. Datasets also undergo human-based quality checks.
          </ListItemText>
        </ListItem>
      </List>
    </div>
  );
};

export default Content;
