import React from 'react';
import Link from '@material-ui/core/Link';
import { CustomAlert } from './Alert';
import { sectionStyles } from './guideStyles';
import { GuideLink } from './Links';
import { BsFiletypeXlsx } from 'react-icons/bs';

export const DownloadTemplateLink = ({ text }) => <GuideLink href="https://github.com/simonscmap/DBIngest/raw/master/template/datasetTemplate.xlsx"
                                          download="datasetTemplate.xlsx"
                                                  >{ text ? text : 'Submission Template'}</GuideLink>

const DownloadTemplate = (props) => {
  const cl = sectionStyles ();
  const { introText } = props;
  return (
    <Link href="https://www.dropbox.com/scl/fi/vhxf8wfw5sdejq83gk1im/DatasetTemplate.xlsx?rlkey=g9ch6e4hajxqtz31mksopyh8e&st=tck3k25d&dl=0"
          download="DatasetTemplate.xlsx"
    >
      <CustomAlert
        icon={<BsFiletypeXlsx className={cl.icon} />}
        variant="outlined"
      >
        { introText ? introText : 'Start by downloading the submission template.' }
      </CustomAlert>
    </Link>
  );
}

export default DownloadTemplate;
