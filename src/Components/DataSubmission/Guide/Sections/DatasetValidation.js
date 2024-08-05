import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { sectionStyles } from '../guideStyles';

import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { PiNumberCircleOne,  PiNumberCircleTwo, PiNumberCircleThree } from "react-icons/pi";
import { CustomAlert } from '../Alert';
import { FocusEnumerator } from '../FocusMarkers';
import { GuideLink } from '../Links';


// foci
const foci = {
};
const fociList = Object.keys (foci);
const isValidFocus = (id) => {
  return fociList.includes (id);
}

// component
const Content = (props) => {
  const cl = sectionStyles();
  const { focus, setFocus } = props;

  // state for accordion
  // panel names match the focus value
  let [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    toggleFocus (panel);
  };

  const toggleFocus = (id) => {
    console.log ('toggle', id);
    if (!id) {
      return;
    } else if (focus === id) {
      setFocus (undefined);
    } else if (isValidFocus (id)) {
      setFocus (id);
    }
  }

  useEffect (() => {
    if (focus && expanded !== focus && isValidFocus (focus)) {
      setExpanded (focus);
    }
  }, [focus]);

  return (
    <div className={cl.container}>
      <Typography>
        The Validation API checks that datasets align with CMAP requirements. You are welcome to use this tool to identify and address dataset issues before submission, accelerating the time from submission to the dataset availability in Simons CMAP. This is the same primary tool that the CMAP data curation team uses for dataset review.
      </Typography>
    </div>
  );
};

export default Content;
