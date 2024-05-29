import React, { useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import {  makeStyles, Link } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import Paper from '@material-ui/core/Paper';
import { safePath } from '../../../Utility/objectUtils';
import states from '../../../enums/asyncRequestStates';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProgramsSend,
} from '../../../Redux/actions/catalog';
import Spinner from '../../UI/Spinner';
import { Link as RouterLink } from 'react-router-dom';
import { data } from './programData';

/*~~~~~~~~~~~~  Spinner ~~~~~~~~~~~~~~~*/

const useSpinnerStyles = makeStyles ((theme) => ({
  spinnerWrapper: {
    textAlign: 'center',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
}));

const SpinnerWrapper = (props) => {
  const { message } = props;
  const cl = useSpinnerStyles();
  return (
    <div className={cl.spinnerWrapper}>
      <Spinner message={message} />
    </div>
  );
};

/*~~~~~~~~~~~~  Row  ~~~~~~~~~~~~~~~*/
const useRowStyles = makeStyles({
  card: {
    width: '450px',
    height: '500px',

  },
  paperRoot: {
    overflow: 'hidden',
    '& h3 a': {
      fontFamily: 'Montserrat,sans-serif'
    }
  },
  blurbContainer: {
    textAlign: 'justify',
    // overflowY: 'scroll',
    '& img': {
      float: 'left',
      maxWidth: '50%',
    }
  }
});

const ProgramCard = (props) => {
  const { program } = props;
  const cl = useRowStyles();

  const pData = data[program.name];

  return (
    <div className={cl.card}>
      <Paper className={cl.paperRoot} elevation="3">
         <Typography variant="h3">
           <Link component={RouterLink} to={`/catalog/programs/${program.name}`}>
            {program.name}
           </Link>
         </Typography>
         <Typography className={cl.blurbContainer}>
           {pData && pData.logo && <img src={`/images/${pData.logo}`} />}
           <span>{pData.blurb}</span>
         </Typography>
         <Typography>
           <a href={pData.link} target="_blank" rel="noreferrer">{pData.link}</a>
           <OpenInNewIcon color="primary" />
         </Typography>
      </Paper>
    </div>
  );
}

/*~~~~~~~~~~~~~~ List ~~~~~~~~~~~~~~~~~~~~*/
const useStyles = makeStyles (() => ({
  wrapper: {
    marginTop: '10px',
    marginRight: '10px',
    marginBottom: '12px',
    display: 'flex',
    gap: '1em',
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: '2em',
    marginBottom: '200px',
    '& .MuiPaper-root': {
      padding: '1em',
      height: '100%',
      background: 'rgba(0,0,0,0.2)'
    },
  },
  root: { // table header

  },
  container_: {
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    backdropFilter: 'blur(20px)',
    height: 'calc(100% - 65px)',
    maxHeight: '500px',
  },
}));


const ProgramsList = () => {
  const cl = useStyles();
  const dispatch = useDispatch();

  const programs = useSelector (safePath (['programs']));
  const reqStatus = useSelector (safePath (['programsRequestStatus']));

  useEffect (() => {
    if (reqStatus === states.notTried) {
      dispatch (fetchProgramsSend());
    }
  }, []);

  if (!programs && reqStatus === states.inProgress) {
    return <SpinnerWrapper message={'Fetching Programs'} />
  } else if (programs && reqStatus === states.succeeded) {
    return (
        <div className={cl.container}>
          {programs.map((prog, i) => (
            <ProgramCard key={`program_card_${i}`} program={prog}  />
          ))}
        </div>
    );
  } else {
    return '';
  }
}

export default ProgramsList;
