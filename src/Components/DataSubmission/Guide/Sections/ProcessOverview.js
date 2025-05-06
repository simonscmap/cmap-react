import React, { useEffect, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import { sectionStyles } from '../guideStyles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {
  PiNumberCircleOne,
  PiNumberCircleTwo,
  PiNumberCircleThree,
  PiNumberCircleFour,
  PiNumberCircleFive,
} from 'react-icons/pi';
import DownloadSample from '../DownloadSample';
import { CustomAlert } from '../Alert';
import { FocusManager, AccordionSection } from '../FocusMarkers';
import { GuideLink } from '../Links';

// foci
const foci = {
  preparation: 'preparation',
  validation: 'validation',
  feedback: 'feedback',
  doi: 'doi',
  ingestion: 'ingestion',
};

const fociList = Object.keys(foci);
const isValidFocus = (id) => {
  return fociList.includes(id);
};

const Content = (props) => {
  const { focus, setFocus } = props;
  const cl = sectionStyles();

  // state for accordion
  // panel names match the focus value
  let [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    toggle(panel);
  };

  const toggle = (id) => {
    if (!id) {
      return;
    } else if (focus === id) {
      setFocus(undefined, true);
    } else if (isValidFocus(id)) {
      setFocus(id);
    }
  };

  useEffect(() => {
    if (focus && expanded !== focus && isValidFocus(focus)) {
      setExpanded(focus);
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
      <AccordionSection
        state={state}
        name={foci.preparation}
        title={'Dataset Preparation'}
        markerType="enumerator"
        icon={<PiNumberCircleOne />}
      >
        <Typography>
          Begin the process by downloading and populating a&nbsp;
          <GuideLink
            href="https://github.com/simonscmap/DBIngest/raw/master/template/datasetTemplate.xlsx"
            download={true}
          >
            DatasetTemplate.xlsx
          </GuideLink>
          &nbsp; Details on the requirements and structure can be found in
          the&nbsp;
          <GuideLink hash="#dataset-preparation">Data Structure</GuideLink>{' '}
          section.
        </Typography>
        <DownloadSample />
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.validation}
        title={'Optional Pre-submission Validation'}
        markerType="enumerator"
        icon={<PiNumberCircleTwo />}
      >
        <Typography>
          Once you have prepared your dataset you have the option of using the{' '}
          <GuideLink hash="#validation-api">Validation API</GuideLink> to check
          that your dataset aligns with CMAP requirements. Using this tool
          enables you to identify and address dataset issues before submission,
          accelerating the rest of the process. To learn more, please visit the
          Validation API section of this guide.
        </Typography>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.feedback}
        title={'Submission & Review'}
        markerType="enumerator"
        icon={<PiNumberCircleThree />}
      >
        <Typography>
          When your dataset is ready, use the{' '}
          <GuideLink hash="#submission-portal">Submission Portal</GuideLink> to
          submit it to Simons CMAP. This tool will walk you through a
          step-by-step process to identify and resolve any data or format
          issues. During the final step, your dataset will be uploaded to a
          staging area to be reviewed by our data curation team.
        </Typography>

        <Typography>
          After the data curation team has reviewed your dataset, you will
          receive feedback along with a description of the next steps. If
          changes to your submission are requested, you can use the{' '}
          <GuideLink href="/datasubmission/userdashboard">
            Data Submission Dashboard
          </GuideLink>{' '}
          to edit and resubmit your dataset.
        </Typography>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.doi}
        title={'DOI'}
        markerType="enumerator"
        icon={<PiNumberCircleFour />}
      >
        <Typography>
          Once your submission has been approved the data curation team will
          request a DOI for the data. You can get the DOI yourself or we can
          help you with this step.
        </Typography>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.ingestion}
        title={'Ingestion'}
        markerType="enumerator"
        icon={<PiNumberCircleFive />}
      >
        <Typography>
          After we receive the DOI we will ingest your dataset into the CMAP
          database. After ingestion, you will be able to view your dataset in
          the{' '}
          <GuideLink href="/catalog" target="_blank">
            Data Catalog
          </GuideLink>
          , create plots and figures through the{' '}
          <GuideLink href="/visualization/charts">
            {' '}
            CMAP Web Visualization Tool
          </GuideLink>
          , and access it through the CMAP API using any of the CMAP{' '}
          <GuideLink href="/documentation">Software Packages</GuideLink>.
        </Typography>
      </AccordionSection>
    </FocusManager>
  );
};

export default Content;
