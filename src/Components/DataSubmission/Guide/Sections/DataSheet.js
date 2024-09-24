import React from 'react';
import Typography from '@material-ui/core/Typography';
import { GuideLink } from '../Links';
import { sectionStyles } from '../guideStyles';
import DemoSheet from '../DemoSheet';
import DownloadSample from '../DownloadSample';
import DownloadTemplate from '../DownloadTemplate';
import { sampleDataSheet, sampleDataColumns } from '../demoSheetData';

const Content = () => {
  const cl = sectionStyles();

  return (
    <div className={cl.container}>
      <Typography>
        All data points are stored in the “Data” sheet. Each data point must have time and location information. The exact name and order of the time and location columns are shown in the table below. If a dataset does not have depth values (e.g., sea surface measurements), you may remove the <code>depth</code> column. If your dataset represents results of a Laboratory study (see <GuideLink hash="#dataset_make-column">dataset_make</GuideLink>) fill these fields with the time of study and the location of your laboratory. The columns <code>var<sub>1</sub>...var<sub>n</sub></code> represent the dataset variables (measurements). Please rename <code>var<sub>1</sub>...var<sub>n</sub></code> to names appropriate to your data. The format of <code>time</code>, <code>lat</code>, <code>lon</code>, and <code>depth</code> columns are described in the following sections.
      </Typography>

      <div className={cl.scrollWrapper}>
        <div className={cl.standoutBadgeNoOverlap}>Example Data Sheet</div>
        <DemoSheet columns={sampleDataColumns} source={sampleDataSheet} />
      </div>

      <DownloadSample />
      <DownloadTemplate introText="Download the Submission Template"/>
    </div>
  );
};

export default Content;
