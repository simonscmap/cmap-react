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
  validationApiDashboard: 'validationApiDashboard',
  autoRevision: 'autoRevision',
  issueReport: 'issueReport',
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

      <div className={cl.subHeader}>Validation API access:</div>

      <List>
        <ListItem>
          <GuideLink href="https://www.dropbox.com/scl/fi/mdye13twpolkzpdnstpr6/SimonsCMAP_QCAPI.py?rlkey=2000jd3k2jo2dkljugfvucda9&st=a7xvb3db&dl=0">
            A script to call the Validation API
          </GuideLink>
        </ListItem>
        <ListItem>
          <GuideLink
            href="https://cmapdatavalidation.com/try#/Pre%20Ingestion%20Checks/upload_file_excel__respType__post"
            >
            Validation API interactive interface
          </GuideLink>
        </ListItem>
        <ListItem>
          <GuideLink href="https://cmapdatavalidation.com/docs" >
            Validation API documentation
          </GuideLink>
        </ListItem>
      </List>

      <div className={cl.subHeader}>
        Validation API output:
      </div>

      <Typography>
        There are three important categories of output provided by the Validation API:
      </Typography>

      <Accordion expanded={expanded === foci.validationApiDashboard} onChange={handleChange (foci.validationApiDashboard)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} >
          <FocusEnumerator focus={focus} name={foci.validationApiDashboard}>
            <PiNumberCircleOne/>
          </FocusEnumerator>
          <span>A dashboard of plots and statistics for each dataset variable</span>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          This is in the &quot;viz.html&quot; file. If you see anything unexpected in this dashboard, please inspect your data for errors before submission to Simons CMAP.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === foci.autoRevision} onChange={handleChange (foci.autoRevision)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} >
          <FocusEnumerator focus={focus} name={foci.autoRevision}>
            <PiNumberCircleTwo/>
          </FocusEnumerator>
          <span>An automatically revised version of the dataset</span>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            This is contained in the file with the prefix “revised” followed by the dataset name. This file includes auto-generated revisions addressing dataset issues, such as adding missing keywords derived from dataset and variable metadata, for each variable.  We recommend that this revised dataset be used for submission, after review and further edits to address unresolved issues.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === foci.issueReport} onChange={handleChange (foci.issueReport)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} >
          <FocusEnumerator focus={focus} name={foci.issueReport}>
            <PiNumberCircleThree/>
          </FocusEnumerator>
            <span>Output files describing identified dataset issues</span>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Issues are named according to validation category. For example:
          </Typography>
          <ul>
            <li>

              If a variable is included in the <code>vars_meta_data</code> sheet, but is not present on the <code>data</code> sheet, the output file <code>cross_validate_data_vars.csv</code> will contain this error: <div className={cl.standoutBox} style={{ margin: '.5em 0'}}> “<span className={cl.inlineError}>number of variable columns in the data sheet do not match the number of variables in the vars_meta_data sheet.</span>”</div>
            </li>
            <li>
              If the keywords are the same for each variable you will receive an error in the output file <code>var_schema.csv</code> indicating a problem with <code>field_uniqueness</code> in the keyword column.
            </li>
            <li>
              If required keywords, such as the region name, are missing the output file <code>cross_validate_data_vars.csv</code> will contain an error indicating which keywords are missing for each variable.
            </li>
            <li>
              If the cruise name does not have an existing trajectory included in Simons CMAP, or the dataset temporal or spatial range does not match that of the cruise trajectory in CMAP, the <code>cruise</code> output file will contain errors describing the issue.
            </li>
          </ul>
        </AccordionDetails>
      </Accordion>

      <CustomAlert severity="info">
        If you receive output messages from the validation API that you have questions about, please see the data submission guide or contact the Simons CMAP data curation team at <GuideLink href="mailto:simonscmap@uw.edu">simonscmap@uw.edu</GuideLink>
      </CustomAlert>

      <div className={cl.subHeader}>
        Validation API tutorial:
      </div>

      <div className={cl.standoutBox} style={{ width: '780px',background: 'black' }}>
        <iframe
          src="https://player.vimeo.com/video/957212176"
          width="780"
          height="440"
          style={{ margin: '0 auto', border: 0 }}
        ></iframe>
      </div>


      <div className={cl.subHeader}>
        Validation API output tutorial:
      </div>

      <div className={cl.standoutBox} style={{ width: '780px', background: 'black' }}>
        <iframe
          src="https://player.vimeo.com/video/956780015"
          width="780"
          height="440"
          style={{ margin: '0 auto', border: 0 }}
        ></iframe>
      </div>

    </div>
  );
};

export default Content;
