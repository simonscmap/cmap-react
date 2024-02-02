// Step 1: Workbook validaition contents
// Note: state is kept it parent ValidationTool.js

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { useHistory } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Link,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import {
  ErrorOutline,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

// fns
import { safePath } from '../../Utility/objectUtils';
import renderBody from '../Home/News/renderBody';
import renderText from '../Home/News/renderText';
import messages from './Messages';

const hasLength = (maybeArray) => {
  if (Array.isArray(maybeArray)) {
    return maybeArray.length > 0;
  }
  return false;
}


// TODO react router dom: useLocation + useEffect + location.search + location

const useStyles = makeStyles ((theme) => ({
  workbookAuditWrapper: {
    // padding: '12px',
    whiteSpace: 'pre-wrap',
    textAlign: 'left',
    color: 'white',
    '& > h5': {
      marginBottom: '1em',
    }
  },
  card: {
    // width: 'calc(100% - 4em)',
    margin: '1em 0 ',
    fontFamily: ['Lato', 'sans-serif'].join(','),
    '& .MuiCardHeader-root': {
      padding: '8px',
    },
    '& .MuiCardContent-root': {
      padding: '8px',
      marginLeft: '50px' // indent text to match title
    },
    '& em': {
      fontWeight: 'bold',
      fontStyle: 'normal',
      color: '#69FFF2', // theme.palette.secondary.main,
    }
  },
  cardTitleWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: '.6em',
    alignItems: 'center',
  },
  errorIcon: {
    color: 'rgb(255, 0, 0)',
    paddingTop: '8px',
    '& > svg': {
      fontSize: '1.5em',
    }
  },
  warningIcon: {
    color: 'rgb(255, 255, 0)',
    paddingTop: '8px',
    '& > svg': {
      fontSize: '1.5em',
    }
  },
  issueSummary: {
    color: 'white',
  },
  link: {
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.secondary.dark,
    }
  }

}));

const warningOutlineStyle = {
  color: 'rgb(255, 255, 0)',
  margin: '0 2px -5px 0',
  fontSize: '1.4em',
};

const ErrorAlert = ({ thereAreErrors, goBack }) => {
  const cl = useStyles();
  if (thereAreErrors) {
    return (
      <Typography>
        One or more parts of your submission did not match CMAP requirements.
        Please review the information below, update your workbook, and {' '}
         <Link onClick={goBack} className={cl.link}>upload it again</Link>.
       </Typography>
    );
  } else {
    return '';
  }
};

const WarningsAlert = ({ thereAreWarnings }) => {
  if (thereAreWarnings) {
    return (
      <React.Fragment>
      <Typography>
        We found some potential issues with your submission and have flagged them below as warnings with a yellow icon
        {' '}
        <ErrorOutline style={warningOutlineStyle} />. {' '}
        These should be reviewed and corrected if necessary, but will not prevent you from submitting your dataset.
      </Typography>
      </React.Fragment>
    );
  } else {
    return '';
  }
};

const CardTitle = (props) => {
  const { t, title } = props;
  const cl = useStyles ();
  return (
    <div className={cl.cardTitleWrapper}>
      <div className={(t === 'error' ? cl.errorIcon : cl.warningIcon)} >
        <ErrorOutline />
      </div>
      <div className={cl.issueSummary}>
        {title}
      </div>
    </div>
  );
}

const IssueCard = (props) => {
  const { t, info } = props;
  const { title, subheader, detail, body } = info;
  const cl = useStyles ();
  return (
    <Card className={cl.card} raised>
      <CardHeader title={<CardTitle t={t} title={title} />} subheader={subheader}/>
      <CardContent>
        {detail && renderText(detail)}
        {body && renderBody(body)}
      </CardContent>
    </Card>
  );
};

// COMPONENT
const Step1 = (props) => {
  const cl = useStyles();
  const subType = useSelector ((state) => state.submissionType);
  const { step, auditReport, checkName, changeStep } = props;
  const history = useHistory();

  useEffect(() => {
    if (!auditReport) {
      changeStep (0);
      history.push('/datasubmission/validationtool')
    }
  }, [auditReport]);



  const goBack = () => changeStep(0);

  const thereAreErrors = hasLength (safePath (['workbook', 'errors']) (auditReport))
                      || (checkName && !checkName.nameIsNotTaken);
  const thereAreWarnings = hasLength (safePath (['workbook', 'warnings']) (auditReport))

  let [errors, setErrors] = useState([]);

  useEffect(() => {
    let eArr= [];

    if (thereAreErrors) {
      const auditWorkbookErrors = safePath (['workbook', 'errors']) (auditReport) ;
      if (auditWorkbookErrors) {
        eArr = eArr.concat(...auditWorkbookErrors);
      }
    }
    if (checkName && !checkName.nameIsNotTaken && subType === 'new') {
      eArr.push({
        title: 'Dataset name is not available',
        detail: messages.nameIsTaken (checkName, 'name'),
      });
    }
    setErrors(eArr);
  }, [subType, checkName, auditReport]);


  if (step !== 1) {
    return <React.Fragment />;
  }
  if (!auditReport) {
    return <React.Fragment />;
  }

  return (
    <div className={cl.workbookAuditWrapper}>
      <Typography variant={"h5"}>Workbook Validation</Typography>

      <ErrorAlert thereAreErrors={thereAreErrors} goBack={goBack}/>

      {/* workbook errors */}
      {errors.map((e, i) => {
        if (typeof e === 'string') {
          return <IssueCard key={`errorCard-${i}`} t={'error'} info={{ title: 'Error', detail: e }} />
        } else {
          return <IssueCard key={`errorCard-${i}`} t={'error'} info={e} />
        }
      })}


      <WarningsAlert thereAreWarnings={thereAreWarnings} />
      {/* workbook warnings */}
      {auditReport.workbook.warnings.map((e, i) => {
        if (typeof e === 'string') {
          return <IssueCard key={`warningCard-${i}`} t={'warning'} info={{ title: 'Warning', detail: e }} />
        } else {
          return <IssueCard key={`warningCard-${i}`} t={'warning'} info={e} />
        }
      })}
    </div>
  );
};

export default Step1;
