import React from 'react';
import Typography from '@material-ui/core/Typography';
import { UserDashboardPanelDetails } from '../../UserDashboardPanelDetails';
import states from '../../../../enums/asyncRequestStates';
import { GuideLink } from '../Links';
import { sectionStyles } from '../guideStyles';

const mockDataSubmission = {
  DOI_Accepted_Date_Time: null,
  Dataset: 'My_Dataset_Short_Name',
  Dataset_Long_Name: 'My Dataset Long Name',
  Ingestion_Date_Time: '2023-03-13T13:18:34.013Z',
  Phase: 'Complete',
  QC1_Completion_Date_Time: null,
  QC2_Completion_Date_Time: null,
  Start_Date_Time: '2022-04-26T19:06:39.450Z',
  Submission_ID: 0,
  phaseId: 6,
};

const mockDataSubmissionComments = [
  [
    {
      Comment: "Hello! We received your submission. We're reviewing it now.",
      Comment_Date_Time: '2022-04-27T13:55:57.707Z',
      Commenter: 'Admin',
      Data_Submission_ID: 0,
    },
    {
      Comment:
        'Everything looks good. Please follow the directions in the guide to secure a DOI for your data.',
      Comment_Date_Time: '2022-04-27T13:55:57.707Z',
      Commenter: 'Admin',
      Data_Submission_ID: 0,
    },
    {
      Comment: 'DOI sent!',
      Comment_Date_Time: '2022-04-27T13:55:57.707Z',
      Commenter: 'User',
      Data_Submission_ID: 0,
    },
    {
      Comment:
        "Thank you, we're moving forward with ingesting the dataset into our system.",
      Comment_Date_Time: '2022-04-27T13:55:57.707Z',
      Commenter: 'Admin',
      Data_Submission_ID: 0,
    },
  ],
];

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Typography>
        In the{' '}
        <GuideLink href="/datasubmission/userdashboard">
          User Dashboard{' '}
        </GuideLink>{' '}
        you can track the ingestion process for any dataset that you have
        submitted, send messages to the data curation team, and download the
        most recently submitted version of the workbook. If the curation team
        requests additional changes to your submission you can use the{' '}
        <GuideLink href="/datasubmission/userdashboard">
          User Dashboard{' '}
        </GuideLink>{' '}
        to access, edit, and resubmit the dataset directly in the validation
        tool.
      </Typography>
      <div className={cl.scrollWrapper}>
        <div className={cl.standoutBadge}>Example Submission Dashboard</div>
        <div
          className={cl.standoutBox}
          style={{ background: 'rgba(0,0,0,0.2)', padding: '1em' }}
        >
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
