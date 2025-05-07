import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { FocusManager, AccordionSection } from '../FocusMarkers';
import { sectionStyles } from '../guideStyles';
import { GuideLink } from '../Links';
// foci
const foci = {
  format: 'format',
  largeDataset: 'largeDataset',
  steps: 'steps',
  keywords: 'keywords',
  missingData: 'missingData',
  tz: 'tz',
  desc: 'desc',
  varnames: 'varnames',
  multipleCruises: 'multipleCruises',
  multipleRefs: 'multipleRefs',
  precheck: 'precheck',
  doiChange: 'doiChange',
  prelimData: 'prelimData',
  updatedData: 'updatedData',
  resubmission: 'resubmission',
  privateData: 'privateData',
};

const fociList = Object.keys(foci);
const isValidFocus = (id) => {
  return fociList.includes(id);
};

// Component
const Content = (props) => {
  const { focus, setFocus } = props;
  const cl = sectionStyles();

  let [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    toggleFocus(panel);
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

  const toggleFocus = toggle;

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
        name={foci.format}
        title={'In what format should I prepare my data?'}
      >
        <Typography>
          Your dataset should be formatted as an excel file consisting of three
          sheets. Each sheet must be formatted according to Simons CMAP
          requirements. To begin,{' '}
          <Link href="https://github.com/simonscmap/DBIngest/raw/master/template/datasetTemplate.xlsx">
            download a blank xlsx template
          </Link>{' '}
          and populate this template following the instructions in this guide.
        </Typography>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.largeDataset}
        title={
          'My dataset is larger than 150 MB. How should I prepare my data?'
        }
      >
        <Typography>
          All datasets must be prepared as excel files that align with CMAP
          formatting requirements. Files larger than 150 MB cannot be submitted
          via the submission tool. In these cases please contact us for
          assistance at simonscmap@uw.edu, as the details will depend on the
          specifics of your dataset.
        </Typography>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.steps}
        title={
          'What are the steps for adding a dataset to Simons CMAP? Who is responsible for each step?'
        }
      >
        <div className={cl.standoutBox}>
          <table>
            <thead>
              <tr>
                <th>Step</th>
                <th>Who is responsible</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Preparation</td>
                <td>Dataset owner</td>
              </tr>
              <tr>
                <td>Submission</td>
                <td>Dataset owner, using the CMAP submission tool</td>
              </tr>
              <tr>
                <td>Review</td>
                <td>Dataset owner and Simons CMAP team</td>
              </tr>
              <tr>
                <td>DOI</td>
                <td>Dataset owner</td>
              </tr>
              <tr>
                <td>Ingestion</td>
                <td>Simons CMAP team</td>
              </tr>
            </tbody>
          </table>
        </div>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.keywords}
        title={'What keywords should I include on the variable metadata sheet?'}
      >
        <Typography>
          Keywords are an important part of the Simons CMAP search function.
          Please include any keyword that should return a given variable if used
          in “search”. A minimal list of keyword categories can be found{' '}
          <Link href="https://simonscmap.dev/datasubmission/guide#data-structure-var_keywords">
            here
          </Link>
        </Typography>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.missingData}
        title={'How should I represent missing values on the data sheet?'}
      >
        <Typography>
          Cells with no data should be left blank. Please do not include fillers
          such as "NA", "nan", "missing value", "-999" etc.
        </Typography>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.tz}
        title={'Where should I note the time zone of the timestamp?'}
      >
        <Typography>
          The time zone should be specified in the time column on the data sheet
          using this format: <code>%Y-%m-%dT%H:%M:%S%z</code>. If a time zone is
          not explicitly specified it might be interpreted as UTC. It is also
          recommended that you include a sentence describing the timezone of the
          timestamp in the description (e.g. “The timestamp is in UTC”).
        </Typography>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.desc}
        title={'What should I include in the dataset description?'}
      >
        <Typography>
          The dataset description will be used to present your dataset to the
          CMAP users. It acts as entry documentation and should provide
          contextual information such as scientific goals, acquisition methods,
          etc. For more details see{' '}
          <Link href="https://simonscmap.dev/datasubmission/guide#data-structure-dataset_description">
            here
          </Link>
          .
        </Typography>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.varnames}
        title={
          'What should I watch for when selecting the dataset/variable names?'
        }
      >
        <Typography>
          Both dataset and variable long names must be shorter than 200
          characters, and title-cased. Dataset/Variable short names should not
          contain space, dash, or special characters such as{' '}
          <code>{'<'}, +, %</code>, or start with numbers. Both long and short
          names must not already exist in CMAP (check the catalog page). See
          more{' '}
          <Link href="https://simonscmap.dev/datasubmission/guide#data-structure-dataset_short_name">
            here
          </Link>{' '}
          and{' '}
          <Link href="https://simonscmap.dev/datasubmission/guide#data-structure-variable">
            here
          </Link>
          .
        </Typography>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.multipleCruises}
        title={'How do I list multiple cruises on the dataset metadata sheet?'}
      >
        <Typography>
          If your dataset includes data from multiple cruises please include all
          cruise names and nicknames in separate cells within the cruise column
          on the <code>data_meta_data</code> sheet.
        </Typography>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.multipleRefs}
        title={
          'How do I include multiple references on the dataset metadata sheet?'
        }
      >
        <Typography>
          If you would like to include multiple references please add each
          reference in a separate cell in the references column on the{' '}
          <code>data_meta_data</code> sheet.
        </Typography>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.precheck}
        title={
          'Can I check my dataset for alignment with Simons CMAP requirements before submission?'
        }
      >
        <Typography>
          Yes, you can use the Simons CMAP{' '}
          <GuideLink hash="validation-api">Validation API</GuideLink> to
          validate your dataset before submission. This is the same primary tool
          used by the Simons CMAP team when reviewing datasets.
        </Typography>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.doiChange}
        title={'What if my dataset has changed/updated after getting a DOI?'}
      >
        <Typography>
          The CMAP and DOI versions of your dataset must match. Please check
          with your DOI provider as most, including Zenodo, allow you to upload
          a new file version that receives a unique DOI. It is uncommon for DOI
          providers to remove files.
        </Typography>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.prelimData}
        title={'Can I submit a preliminary version of a dataset?'}
      >
        <Typography>
          Yes, preliminary datasets are welcome. The dataset description should
          include a summary of the dataset status, any caveats that should be
          considered, and when a dataset update is expected. Versioning can be
          tracked in the dataset_version column on the Dataset Metadata sheet.
        </Typography>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.updatedData}
        title={
          'How do I submit an updated version of a dataset already included in CMAP?'
        }
      >
        <Typography>
          The updated version should be submitted to CMAP as a new submission.
          This version must have a unique dataset_short_name, dataset_long_name
          and dataset_version. Please explain In the dataset_description that
          this is a subsequent version of a previous dataset. If the previous
          version requires removal contact{' '}
          <Link href="mailto:simonscmap@uw.edu">simonscmap@uw.edu</Link>.
        </Typography>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.resubmission}
        title={
          'How do I update a dataset that has been submitted and is in the review process?'
        }
      >
        <Typography>
          You can use the user dashboard to access, edit, and resubmit the most
          recent dataset version directly in the validation tool. Alternatively,
          before ingestion, you may replace the originally submitted dataset
          with a new version by going to submit data and selecting “update a
          submission already in progress”.
        </Typography>
      </AccordionSection>

      <AccordionSection
        state={state}
        name={foci.privateData}
        title={
          'Can I submit my dataset for inclusion in Simons CMAP, but prevent public access until my publication is released?'
        }
      >
        <Typography>
          Datasets cannot be made private-access only, all datasets ingested
          into Simons CMAP are publicly available. However, your dataset can be
          made obscure by using a random name and excluding it from the Simons
          CMAP catalog. Please contact us at{' '}
          <Link href="mailto:simonscmap@uw.edu">simonscmap@uw.edu</Link> for
          more information.
        </Typography>
      </AccordionSection>
    </FocusManager>
  );
};

export default Content;
