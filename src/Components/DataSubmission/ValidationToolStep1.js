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

// components
import { useNameChangeWarning } from './NameChangeWarning';

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
        These should be reviewed and corrected if necessary, but will not prevent you from submitting your dataset.
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
        {title}
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
      <CardHeader title={<CardTitle t={t} title={title} />} subheader={subheader}/>
      <CardContent>
        {detail && renderText(detail)}
        {body && renderBody(body)}
        {Component && <Component {...args} />}
      </CardContent>
    </Card>
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
    console.log ('step 1: detected change in auditReport prop', auditReport);
    if (!auditReport) {
      // changeStep (0);
      history.push('/datasubmission/validationtool')
    }
  }, [auditReport]);

  const goBack = () => {
    reset();
    changeStep(0);
  }

  const thereAreErrors = hasLength (safePath (['workbook', 'errors']) (auditReport));
  const thereAreWarnings = hasLength (safePath (['workbook', 'warnings']) (auditReport))
  const thereAreConfirmations = hasLength (safePath (['workbook', 'confirmations']) (auditReport))

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

  // name change warning
  const {
    isShortNameChange,
    isLongNameChange,
    nameCheckResult,
  } = useNameChangeWarning ();

  if (step !== 1) {
    return <React.Fragment />;
  }
  if (!auditReport) {
    return <React.Fragment />;
  }

  return (
    <div className={cl.workbookAuditWrapper}>
      <Typography variant={"h5"}>Workbook Validation</Typography>


      {/* name change warning */}
      <div className={cl.nameChangeWarning}>
        {isShortNameChange && <IssueCard
          t={'warning'}
          info={{
            title: 'Short Name Will Change',
            Component: () => {
              const cls = useStyles();
              return (
                <Typography variant="body1" className={cl.title}>
                  Short Name will change from <span className={cls.bright}>{nameCheckResult.originalShortName}</span> to <span className={cls.bright}>{nameCheckResult.shortName}</span>.
                </Typography>
              );
            }
          }}
          />}
        {isLongNameChange && <IssueCard
          t={'warning'}
          info={{
            title: 'Long Name Will Change',
            Component: () => {
              const cls = useStyles();
              return (
                <Typography variant="body1" className={cl.title}>
                  Long Name will change from <span className={cls.bright}>{nameCheckResult.originalLongName}</span> to <span className={cls.bright}>{nameCheckResult.longName}</span>.
                </Typography>
              );
            }
          }}
          />}
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

      {auditReport.workbook.warnings.map((e, i) => {
        if (typeof e === 'string') {
          return <IssueCard key={`warningCard-${i}`} t={'warning'} info={{ title: 'Warning', detail: e }} />
        } else {
          return <IssueCard key={`warningCard-${i}`} t={'warning'} info={e} />
        }
      })}



      <ConfirmationsAlert thereAreConfirmations={thereAreConfirmations} />

      {auditReport.workbook.confirmations.map((e, i) => {
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
