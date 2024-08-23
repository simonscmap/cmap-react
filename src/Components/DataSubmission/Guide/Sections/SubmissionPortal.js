import React from 'react';
import Typography from '@material-ui/core/Typography';
import { sectionStyles } from '../guideStyles';
import { UserDashboardPanelDetails } from '../../UserDashboardPanelDetails';
import states from '../../../../enums/asyncRequestStates';
import { GuideLink } from '../Links';

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

const mockDataSubmissionComments = [
  [
    {
      Comment: "Hello! We received your submission. We're reviewing it now.",
      Comment_Date_Time: "2022-04-27T13:55:57.707Z",
      Commenter: "Admin",
      Data_Submission_ID: 0,
    },
    {
      Comment: "Everything looks good. Please follow the directions in the guide to secure a DOI for your data.",
      Comment_Date_Time: "2022-04-27T13:55:57.707Z",
      Commenter: "Admin",
      Data_Submission_ID: 0,
    },
    {
      Comment: "DOI sent!",
      Comment_Date_Time: "2022-04-27T13:55:57.707Z",
      Commenter: "User",
      Data_Submission_ID: 0,
    },
    {
      Comment: "Thank you, we're moving forward with ingesting the dataset into our system.",
      Comment_Date_Time: "2022-04-27T13:55:57.707Z",
      Commenter: "Admin",
      Data_Submission_ID: 0,
    },
  ]
];

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Typography>
        Upload your dataset using the <GuideLink target="_blank" href="/datasubmission/validationtool">Submission Portal</GuideLink> to submit it to Simons CMAP.  This tool identifies issues with dataset formatting and will guide you in resolving these issues before the dataset is submitted. After the dataset has been submitted our data curation team will review the dataset using both the Validation API and human-based checks.  Once your dataset is submitted you will use the <GuideLink target="_blank" href="/datasubmission/userdashboard">Data Submission Dashboard</GuideLink> to track submission progress and for related communication with the data curation team.
      </Typography>

      <div className={cl.subHeader}>
        Submission Tool Tutorial
      </div>

      <div className={cl.scrollWrapper}>
        <div className={cl.standoutBox} style={{ width: '780px', background: 'black' }}>
          <iframe
            src="https://player.vimeo.com/video/981629505"
            width="780"
            height="440"
            style={{ margin: '0 auto', border: '0' }}
          ></iframe>
        </div>
      </div>

      <div className={cl.subHeader}>
        Submission Dashboard
      </div>

      <Typography>
        In the <GuideLink href="/datasubmission/userdashboard">Data Submission Dashboard </GuideLink> you can track the ingestion process for any dataset that you have submitted, send messages to the data curation team, and download the most recently submitted version of the workbook. If the curation team requests additional changes to your submission you can use the dashboard to access, edit, and resubmit the dataset directly in the submission portal.
      </Typography>

      <div className={cl.scrollWrapper}>
        <div className={cl.standoutBadge}>Example Submission Dashboard</div>
        <div className={cl.standoutBox} style={{ background: 'rgba(0,0,0,0.2)', padding: '1em'}}>
          <UserDashboardPanelDetails
            submission={mockDataSubmission}
            submissionComments={mockDataSubmissionComments}
            retrieveSubmissionCommentHistory={() => null}
            addSubmissionComment={() => null}
            downloadMostRecentFile={() => null}
            submissionCommentHistoryRetrievalState={states.succeeded}
          />
        </div>
      </div>
    </div>
  );
};

export default Content;
