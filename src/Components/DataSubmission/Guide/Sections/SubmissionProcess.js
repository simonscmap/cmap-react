import React, { useEffect, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { sectionStyles } from '../guideStyles';
import { BsFiletypeXlsx } from "react-icons/bs";
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { PiNumberCircleOne,  PiNumberCircleTwo, PiNumberCircleThree, PiNumberCircleFour,} from "react-icons/pi";
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { CustomAlert } from '../Alert';
import { FocusEnumerator } from '../FocusMarkers';
import { GuideLink } from '../Links';

// foci
const foci = {
  validation: 'validation',
  feedback: 'feedback',
  doi: 'doi',
  ingestion: 'ingestion',
  download: 'download',
};

const fociList = Object.keys (foci);
const isValidFocus = (id) => {
  return fociList.includes (id);
}

const Content = (props) => {
  const { focus, setFocus } = props;
  const cl = sectionStyles();

  // state for accordion
  // panel names match the focus value
  let [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    toggleFocus (panel);
  };

  const toggleFocus = (id) => {
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
          Begin the process by downloading and populating a&nbsp;
          <GuideLink href="https://github.com/simonscmap/DBIngest/raw/master/template/datasetTemplate.xlsx" download={true}>
            datasetTemplate.xlsx
          </GuideLink>
          &nbsp;Completed sample templates can be found in the&nbsp;
          <GuideLink hash="#resources">Resources</GuideLink> section. Details on the
          requirements and structure can be found in the&nbsp;
          <GuideLink hash="#data-structure">
            Data Structure
          </GuideLink> section.
        </Typography>

        <Link
          href="https://github.com/simonscmap/DBIngest/raw/master/template/datasetTemplate.xlsx"
          download="datasetTemplate.xlsx"
        >
          <CustomAlert
            icon={<BsFiletypeXlsx className={cl.icon} />}
            variant="outlined"
          >
            Start by downloading the submission template.
          </CustomAlert>

        </Link>

        <div className={cl.subHeader}>Steps:</div>


        <Accordion expanded={expanded === foci.validation} onChange={handleChange (foci.validation)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} >
            <FocusEnumerator focus={focus} name={foci.validation}>
              <PiNumberCircleOne/>
            </FocusEnumerator>
            <span>Validation</span>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Load your workbook into the <GuideLink href="/datasubmission/validationtool">Submission Tool</GuideLink> to begin validation. The tool will walk you through a
              step-by-step process to identify and resolve any potential data or
              format issues. Once the workbook has been validated it will be
              uploaded to a staging area to be reviewed by our data curation
              team. From this point you will be able to track the progress of your
              submission in the <GuideLink href="/datasubmission/userdashboard">User Dashboard</GuideLink>.
            </Typography>

        <CustomAlert severity="warning" variant="outlined">
          <Typography>
          Please note that xlsx workbooks over 150MB <em>cannot be processed</em> using the web submission tools. If
          you would like to submit a dataset that exceeds this limit please
          contact the data curation team at <GuideLink href="mailto:cmap-data-submission@uw.edu">cmap-data-submission@uw.edu</GuideLink>.
            </Typography>
        </CustomAlert>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === foci.feedback} onChange={handleChange (foci.feedback)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <FocusEnumerator focus={focus} name={foci.feedback}>
              <PiNumberCircleTwo/>
            </FocusEnumerator>
            <span>Feedback</span>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              After the data curation team has reviewed your dataset, any feedback will be sent through the <GuideLink hash="#user-dashboard">User Dashboard</GuideLink> and you will be notified via email.  If changes to your submission are requested, you can use the <GuideLink hash="#user-dashboard">User Dashboard <OpenInNewIcon /></GuideLink> to edit and resubmit directly in the validation tool.  Alternatively, before ingestion, you can replace the originally submitted dataset with a new version by going to Submit Data and selecting “update a submission already in progress”.
            </Typography>
            <Typography>

            </Typography>
          </AccordionDetails>
        </Accordion>


        <Accordion expanded={expanded === foci.doi} onChange={handleChange (foci.doi)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
             <FocusEnumerator focus={focus} name={foci.doi}>
                <PiNumberCircleThree/>
             </FocusEnumerator >
              <span>DOI</span>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Once your submission has been approved the data curation team will
              request a DOI for the data. Information on DOIs can be found in
              the <GuideLink hash="#faq-doi">DOI Help Section</GuideLink>. The DOI can be
              submitted using the messaging feature of the <GuideLink hash="#user-dashboard">User Dashboard</GuideLink>.
            </Typography>
          </AccordionDetails>
        </Accordion>


        <Accordion expanded={expanded === foci.ingestion} onChange={handleChange (foci.ingestion)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <FocusEnumerator focus={focus} name={foci.ingestion}>
              <PiNumberCircleFour/>
            </FocusEnumerator >
            <span>Ingestion</span>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Once a DOI has been submitted your data will be ingested into the
              CMAP database. After ingestion, you will be able to view your
              dataset in the <GuideLink href="/catalog" target="_blank">data catalog</GuideLink>
              , create plots and figures through the <GuideLink href="/visualization/charts"> CMAP web visualization tool        </GuideLink>, and access it through the CMAP API using any of the CMAP <GuideLink href="/documentation">software packages</GuideLink>.
            </Typography>
          </AccordionDetails>
        </Accordion>


      </div>
  );
};

export default Content;
