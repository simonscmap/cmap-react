import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Meta } from './DataSheetSections';
import { sectionStyles } from '../guideStyles';
import { GuideLink } from '../Links';
import DownloadSample from '../DownloadSample';

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Meta
        meta={{
          required: true,
          format: 'Any',
          units: 'Any (specify in the variable sheet)',
          constraints: ['None'],
          example: 'extracted_chl_a',
        }}
      />

      <Typography>
        These columns represent the dataset variables (measurements). Please
        rename them as appropriate for your data. Note that these names should
        be identical to the names defined as{' '}
        <GuideLink hash="#var_short_name-column">var_short_name</GuideLink>
        &nbsp;in the{' '}
        <GuideLink hash="#variable-metadata-sheet">
          Variable Metadata
        </GuideLink>{' '}
        sheet. Please do not include units in these columns; units are recorded
        in the Variable Metadata sheet. Leave a given cell empty for those
        instances when data was not taken and a value is missing. Do not replace
        the missing data with arbitrary values such as 99999, 0, “UNKNOWN”, etc.
        If you wish to flag specific column values, please add relevant flag
        columns with descriptions of flag values in the{' '}
        {"Variable Metadata Sheet's"} <code>comment</code> column.
      </Typography>
      <DownloadSample text="You may download and refer to following examples of completed submisions:" />
    </div>
  );
};

export default Content;
