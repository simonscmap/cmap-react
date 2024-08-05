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
import { FocusEnumerator, FocusManager, AccordionSection } from '../FocusMarkers';
import { GuideLink } from '../Links';
import { UserDashboardStepper } from '../../UserDashboardPanelDetails';

const mockDataSubmission = {
  DOI_Accepted_Date_Time: null,
  Dataset: "My_Dataset_Short_Name",
  Dataset_Long_Name: "My Dataset Long Name",
  Ingestion_Date_Time: "2023-03-13T13:18:34.013Z",
  Phase: "Complete",
  QC1_Completion_Date_Time: null,
  QC2_Completion_Date_Time: null,
  Start_Date_Time: "2022-04-26T19:06:39.450Z",
  Submission_ID: 0,
  phaseId: 6,
};

// foci
const foci = {
  preparation: 'preparation',
  validation: 'validation',
  feedback: 'feedback',
  doi: 'doi',
  ingestion: 'ingestion',
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
    toggle (panel);
  };

  const toggle = (id) => {
    if (!id) {
      return;
    } else if (focus === id) {
      setFocus (undefined, true);
    } else if (isValidFocus (id)) {
      setFocus (id);
    }
  }

  useEffect (() => {
    if (focus && expanded !== focus && isValidFocus (focus)) {
      setExpanded (focus);
    }
  }, [focus]);

  const state = {
    focus,
    expanded,
    handleChange,
    toggle,
  };

  return (
    <FocusManager focus={focus} className={cl.container}>

      <UserDashboardStepper activeStep={4} submission={mockDataSubmission} />

      <div className={cl.subHeader}>Steps:</div>

      <AccordionSection
        state={state}
        name={foci.preparation}
        title={'Preparation'}
      >
        <Typography>
          Begin the process by downloading and populating a&nbsp;
          <GuideLink href="https://github.com/simonscmap/DBIngest/raw/master/template/datasetTemplate.xlsx" download={true}>
            datasetTemplate.xlsx
          </GuideLink>
          &nbsp;Completed sample templates can be found in the&nbsp;
          <GuideLink hash="#resources">Resources</GuideLink> section. Details on the
          requirements and structure can be found in the&nbsp;
          <GuideLink hash="#dataset-preparation">
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
      </AccordionSection>


      <AccordionSection
        state={state}
        name={foci.validation}
        title={'Validation and Submission'}
      >

        <div class={cl.accordionSubHeader}>Pre-submission: Validation API (optional)</div>
        <Typography>
          Once you have prepared your dataset you have the option of using the validation API to check that your dataset aligns with CMAP requirements. Using this tool enables you to identify and address dataset issues before submission, acceleration the rest of the process. To learn more, please visit the Validation API section of this guide.
        </Typography>

        <div class={cl.accordionSubHeader}>Submission Tool</div>

        <Typography>
          Load your workbook into the <GuideLink href="/datasubmission/validationtool">Submission Tool</GuideLink> to begin validation. The tool will walk you through a step-by-step process to identify and resolve any potential data or format issues. Once the workbook has been validated it will be uploaded to a staging area to be reviewed by our data curation team. From this point you will be able to track the progress of your submission in the <GuideLink href="/datasubmission/userdashboard">User Dashboard</GuideLink>.
        </Typography>
      </AccordionSection>


      <AccordionSection
        state={state}
        name={foci.feedback}
        title={'Feedback'}
      >
        <Typography>
          After the data curation team has reviewed your dataset, any feedback will be sent through the <GuideLink hash="#user-dashboard">User Dashboard</GuideLink> and you will be notified via email.  If changes to your submission are requested, you can use the <GuideLink hash="#user-dashboard">User Dashboard <OpenInNewIcon /></GuideLink> to edit and resubmit directly in the validation tool.  Alternatively, before ingestion, you can replace the originally submitted dataset with a new version by going to Submit Data and selecting “update a submission already in progress”.
        </Typography>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.doi}
        title={'DOI'}
      >
        <Typography>
          Once your submission has been approved the data curation team will request a DOI for the data. Information on DOIs can be found in the <GuideLink hash="#faq-doi">DOI Help Section</GuideLink>. The DOI can be submitted using the messaging feature of the <GuideLink hash="#user-dashboard">User Dashboard</GuideLink>.
        </Typography>
      </AccordionSection>


      <AccordionSection
        state={state}
        name={foci.ingestion}
        title={'Ingestion'}
      >
        <Typography>
          Once a DOI has been submitted your data will be ingested into the CMAP database. After ingestion, you will be able to view your dataset in the <GuideLink href="/catalog" target="_blank">data catalog</GuideLink>, create plots and figures through the <GuideLink href="/visualization/charts"> CMAP web visualization tool </GuideLink>, and access it through the CMAP API using any of the CMAP <GuideLink href="/documentation">software packages</GuideLink>.
        </Typography>
      </AccordionSection>
    </FocusManager>
  );
};

export default Content;
