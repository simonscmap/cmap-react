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
import { CustomAlert } from '../Alert';
import { FocusEnumerator } from '../FocusMarkers';

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
          <Link
            href="https://github.com/simonscmap/DBIngest/raw/master/template/datasetTemplate.xlsx"
            download="datasetTemplate.xlsx"
          >
            blank xlsx template.
          </Link>
          &nbsp;Completed sample templates can be found in the&nbsp;
          <Link href="#resources">resources section</Link>. Details on the
          requirements and structure can be found in the&nbsp;
          <Link href="#data-structure">Data Structure</Link> section.
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
              Load your workbook into the <Link target="_blank" href="/datasubmission/validationtool">submission tool</Link> to begin validation. The tool will walk you through a
              step-by-step process to identify and resolve any potential data or
              format issues. Once the workbook has been validated it will be
              uploaded to a staging area to be reviewed by our data curation
              team. From this point you will be able to track the progress of your
              submission in the <Link href="/datasubmission/userdashboard">user dashboard</Link>.
            </Typography>

        <CustomAlert severity="warning" variant="outlined">
          <Typography>
          Please note that xlsx workbooks over 150MB <em>cannot be processed</em> using the web submission tools. If
          you would like to submit a dataset that exceeds this limit please
          contact the data curation team at <a href="mailto:cmap-data-submission@uw.edu">cmap-data-submission@uw.edu</a>.
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
              The data curation team may have suggestions for additional changes to the workbook.
            </Typography>
            <Typography>
              Any feedback will be sent through the <Link href="#user-dashboard">user dashboard</Link>, and you will be notified via email.
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
              the <Link href="#faq-doi">DOI Help Section</Link>. The DOI can be
              submitted using the messaging feature of the <Link href="#user-dashboard">user dashboard</Link>.
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
              dataset in the <Link href="/catalog" target="_blank">data catalog</Link>
              , create plots and figures through the <Link href="/visualization/charts" target="_blank"> CMAP web visualization tool        </Link>, and access it through the CMAP API using any of the CMAP <Link href="/documentation" target="_blank">software packages</Link>.
            </Typography>
          </AccordionDetails>
        </Accordion>


      </div>
  );
};

export default Content;
