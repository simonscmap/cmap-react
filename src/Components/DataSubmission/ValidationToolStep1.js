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
} from '@material-ui/core';
import {
  ErrorOutline,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import states from '../../enums/asyncRequestStates';

// components
import { useNameChangeWarning } from './NameChangeWarning';
import Spinner from '../UI/Spinner';

// fns
import { safePath } from '../../Utility/objectUtils';
import renderBody from '../Home/News/renderBody';
import renderText from '../Home/News/renderText';

const hasLength = (maybeArray) => {
  if (Array.isArray(maybeArray)) {
    return maybeArray.length > 0;
  }
  return false;
}

const useStyles = makeStyles ((theme) => ({
  workbookAuditWrapper: {
    whiteSpace: 'pre-wrap',
    textAlign: 'left',
    color: 'white',
    '& > h5': {
      marginBottom: '1em',
    }
  },
  card: {
    margin: '1em 0 ',
    fontFamily: ['Lato', 'sans-serif'].join(','),
    '& .MuiCardHeader-root': {
      padding: '8px 8px 0 8px',
    },
    '& .MuiCardContent-root': {
      padding: '0 8px 8px 8px',
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
  confirmationIcon: {
    color: 'white',
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
  },
  bright: {
    color: '#69FFF2',
  },
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
        Please review the information below. You can update your workbook here in the next
      validation step, or you can edit your file on your computer and {' '}
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

      </Typography>
      </React.Fragment>
    );
  } else {
    return '';
  }
};

const ConfirmationsAlert = ({ thereAreConfirmations }) => {
  if (thereAreConfirmations) {
    return (
      <Typography>
        Please confirm the following changes.
      </Typography>
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
      <div className={(t === 'error' ? cl.errorIcon : t === 'warning' ? cl.warningIcon : cl.confirmationIcon )} >
        <ErrorOutline />
      </div>
      <div className={cl.issueSummary}>
        {renderText(title)}
      </div>
    </div>
  );
}

const IssueCard = (props) => {
  const { t, info } = props;
  const { title, subheader, detail, body, Component, args } = info;
  const cl = useStyles ();
  return (
    <Card className={cl.card} raised>
    <CardHeader
      title={<CardTitle t={t} title={title} />}
      subheader={subheader}
    />
      <CardContent>
        {detail && renderText(detail)}
        {body && renderBody(body)}
        {Component && <Component {...args} />}
      </CardContent>
    </Card>
  );
};

const ShortNameChangeWarning = (props) => {
  const TextComponent = () => {
    const { nameCheckResult } = useNameChangeWarning ();
    const cls = useStyles();
    return (
      <Typography variant="body1" className={cls.title}>Short Name will change from <span className={cls.bright}>{nameCheckResult.originalShortName}</span> to <span className={cls.bright}>{nameCheckResult.shortName}</span>.</Typography>
    );
  }

  return (
    <IssueCard
      t={'warning'}
      info={{
        title: 'Short Name Will Change',
        Component: TextComponent
      }}
    />
  )
};

const LongNameChangeWarning = (props) => {
  const { nameCheckResult } = useNameChangeWarning ();
  const TextComponent = () => {
    const cls = useStyles();
    return (
      <Typography variant="body1" className={cls.title}>Long Name will change from <span className={cls.bright}>{nameCheckResult.originalLongName}</span> to <span className={cls.bright}>{nameCheckResult.longName}</span>.</Typography>
    );
  }
  return (
    <IssueCard
      t={'warning'}
      info={{
        title: 'Long Name Will Change',
        Component: TextComponent,
      }}
    />
  );
};

const NameCheckFailedWarning = (props) => {
  const { nameCheckRespText } = useNameChangeWarning ();
  const TextComponent = () => {
    const cls = useStyles();
    return (
      <Typography variant="body1" className={cls.title}>We attempted to check the short and long names of the submission for conflicts with other datasets and other submissions, but the check failed {nameCheckRespText ? 'with the following reason: ' + nameCheckRespText : ''}.</Typography>
    );
  }
  return (
    <IssueCard
      t={'warning'}
      info={{
        title: 'Could Not Check For Name Conflicts',
        Component: TextComponent,
      }}
    />
  );
};

// COMPONENT
const Step1 = (props) => {
  const cl = useStyles();
  const subType = useSelector ((state) => state.submissionType);
  const checkName = useSelector ((state) => state.checkSubmissionNameResult);
  const auditReport = useSelector ((state) => state.auditReport);
  const { step, changeStep, reset } = props;
  const history = useHistory();

  useEffect(() => {
    if (!auditReport) {
      // changeStep (0);
      history.push('/datasubmission/submission-portal')
    }
  }, [auditReport]);

  const goBack = () => {
    reset();
    changeStep(0);
  }

  // name change warning
  const {
    isShortNameChange,
    isLongNameChange,
    nameCheckResult,
    nameCheckStatus,
  } = useNameChangeWarning ();

  const thereAreErrors = hasLength (safePath (['workbook', 'errors']) (auditReport));
  const thereAreWarnings = hasLength (safePath (['workbook', 'warnings']) (auditReport))
  const thereAreConfirmations = hasLength (safePath (['workbook', 'confirmations']) (auditReport))
  const thereAreFirstOrderWarnings = hasLength (safePath (['workbook', 'first']) (auditReport))
  const nameCheckFailed = nameCheckStatus === states.failed;

  // keep errors updated
  let [errors, setErrors] = useState([]);

  useEffect(() => {
    let eArr= [];

    if (thereAreErrors) {
      const auditWorkbookErrors = safePath (['workbook', 'errors']) (auditReport) ;
      if (auditWorkbookErrors) {
        eArr = eArr.concat(...auditWorkbookErrors);
      }
    }
    setErrors(eArr);
  }, [subType, checkName, auditReport]);


  if (step !== 1) {
    return <React.Fragment />;
  }

  if (nameCheckStatus === states.inProgress) {
    return (
      <Spinner message={'Checking availability of dataset names...'} />
    );
  }

  if (!auditReport) {
    return <Spinner message={'Performing workbook audit...'} />;
  }

  if (!thereAreFirstOrderWarnings && !thereAreErrors && !thereAreWarnings && !thereAreConfirmations && !nameCheckFailed) {
    return (<div className={cl.workbookAuditWrapper}>
      <Typography variant={"h5"}>Workbook Validation</Typography>
      <Typography variant="body1">
      {'There are no errors or warnings with the workbook. Click "next" to proceed with worksheet validation.'}
      {/*
          - no orphaned cells
          - no conflicts with dataset name
          - time values are correctly formatted
          - all worksheets are present and populated
          - required columns are present and no columns have duplicates
          - variable names all match data columns and no undefined data columns
          - all data columns have values and are not empty
          - depth consistently has a value or is empty
          - no radian values detected for lat/lon
          - no non-unique space/time rows
          - user defined variables have consistent value type
          - no columns with identical values for every row
          - no dulicate (identical) rows
          - no outlier values
          - no non-unique variable names
        */}
      </Typography>
    </div>);
    // changeStep (2); // don't automatically advance to next step
  }

  return (
    <div className={cl.workbookAuditWrapper}>
      <Typography variant={"h5"}>Workbook Validation</Typography>

      {thereAreFirstOrderWarnings &&
        <div>
          {auditReport.workbook.first.map((def, i) => (<IssueCard t='warning' info={def} key={`key${i}`} /> ))}
        </div>
      }

      {nameCheckStatus === states.failed && <NameCheckFailedWarning />}

      {/* name change warning */}
      <div className={cl.nameChangeWarning}>
        {isShortNameChange && <ShortNameChangeWarning />}
        {isLongNameChange && <LongNameChangeWarning />}
      </div>


      {/* workbook errors */}

      <ErrorAlert thereAreErrors={thereAreErrors} goBack={goBack}/>

      {errors.map((e, i) => {
        if (typeof e === 'string') {
          return <IssueCard key={`errorCard-${i}`} t={'error'} info={{ title: 'Error', detail: e }} />
        } else {
          return <IssueCard key={`errorCard-${i}`} t={'error'} info={e} />
        }
      })}

      {/* workbook warnings */}

      <WarningsAlert thereAreWarnings={thereAreWarnings} />

      {auditReport && auditReport.workbook && auditReport.workbook.warnings && auditReport.workbook.warnings.map((e, i) => {
        if (typeof e === 'string') {
          return <IssueCard key={`warningCard-${i}`} t={'warning'} info={{ title: 'Warning', detail: e }} />
        } else {
          return <IssueCard key={`warningCard-${i}`} t={'warning'} info={e} />
        }
      })}

      <ConfirmationsAlert thereAreConfirmations={thereAreConfirmations} />

      {auditReport && auditReport.workbook && auditReport.workbook.confirmations && auditReport.workbook.confirmations.map((e, i) => {
        if (typeof e === 'string') {
          return <IssueCard key={`confirmation-${i}`} t={'confirmation'} info={{ title: 'Please Confirm', detail: e }} />
        } else {
          return <IssueCard key={`confirmation-${i}`} t={'confirmation'} info={e} />
        }
      })}
    </div>
  );
};

export default Step1;
