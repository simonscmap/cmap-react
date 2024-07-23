import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { sectionStyles } from '../guideStyles';

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Typography>
        Load your workbook into the <Link target="_blank" href="/datasubmission/validationtool">
                                      submission tool
                                    </Link> to begin validation. The tool will walk you through a
        step-by-step process to identify and resolve any potential data or
        format issues. Once the workbook has been validated it will be
        uploaded to a staging area to be reviewed by our data curation
        team. From this point you will be able to track the progress of your
        submission in the <Link href="/datasubmission/userdashboard">user dashboard</Link> as shown in{' '}
        <Link href="#body-fig-1">figure 1</Link>.
      </Typography>

      <figure>
        <a className={cl.anchor} id="body-fig-1"></a>
        <img
          style={{
            marginTop: '12px',
            maxWidth: '100%',
            border: '1px solid white',
          }}
          src="/images/cmap_user_dashboard_process_tracking.png"
          alt="User Dashboard Ingestion Process Tracker"
        />

        <figcaption>
          Figure 1. The progress of a dataset from Submission to
          Ingestion.
        </figcaption>
      </figure>


      <div className={cl.subHeader}></div>
    </div>
  );
};

export default Content;
