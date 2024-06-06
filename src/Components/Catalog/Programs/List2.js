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
import { data, introText } from './programData';

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

/*~~~~~~~~~~~~  Spinner ~~~~~~~~~~~~~~~*/
const useSponsorsStyles = makeStyles ((theme) => ({
  container: {
    '& > div': {
      display: 'flex',
      flexDirection: 'row',
      gap: '1em',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    '& h6': {
      textTransform: 'uppercase',
      fontSize: '.9em',
      marginBottom: '10px',
      color: '#69FFF2',
    },
    '& img': {
      maxWidth: '150px',
    },
  },
}));

const logoMap = {
  'simons-foundation': 'simons-foundation-logo-white.png',
}

const Sponsors = (props) => {
  const { programData } = props;
  const cl = useSponsorsStyles();

  if (!programData || !Array.isArray(programData.sponsors)) {
    return '';
  }
  const { sponsors } = programData;

  return (
    <div className={cl.container}>
      <Typography variant="h6">{'Sponsors:'}</Typography>
      <div>
        {sponsors.map((s, i) => (
          <img src={`/images/${logoMap[s]}`} key={`logo-${i}`} alt={`${s} logo`} />))}
      </div>
    </div>
  );

}


/* [
 *   'name name',
 *   'fullName fullName',
 *   'description description',
 *   'sponsor sponsor',
 *   'link link',
 * ], */


/*~~~~~~~~~~~~  Row  ~~~~~~~~~~~~~~~*/
const useRowStyles = makeStyles((theme) => ({
  card: {
    width: '450px',
    height: '650px',
  },
  paperRoot: {
    overflow: 'hidden',
    height: '100%',
    '& h3 a': {
      fontFamily: 'Montserrat,sans-serif'
    },
    display: 'grid',
    gridTemplateColumns: '100%',
    gridTemplateRows: '45px 61px auto 100px 44px',
    columnGap: '1em',
    rowGap: '1em',
    gridTemplateAreas: `'name'
      'fullName'
      'description'
      'sponsor'
      'link'
    `,
  },
  name: {
    gridArea: 'name',
  },
  logo: {
    float: 'right',
    width: '150px',
    // height: '150px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 0 1em 1.5em',
    '& img': {
      objectFit: 'contain',
      maxWidth: '100%',
      maxHeight: '100%',
    }
  },
  fullName: {
    color: '#69FFF2', //theme.palette.secondary.light,
    gridArea: 'fullName',
    textTransform: 'capitalize',
    fontSize: '1.2em',
  },
  blurbContainer: {
    gridArea: 'description',
    textAlign: 'justify',
    overflowY: 'scroll',
    /* '& img': {
     *   float: 'left',
     *   maxWidth: '40%',
     *   maxHeight: '100px',
     *   margin: '0 10px 10px 0'
     * } */
  },
  sponsor: {
    gridArea: 'sponsor',
  },
  link: {
    gridArea: 'link',
    '& > div': {
      display: 'flex',
      flexDirection: 'row',
      gap: '.6em',
      alignItems: 'center',
      flexWrap: 'nowrap',
    },
    '& h6': {
      textTransform: 'uppercase',
      fontSize: '.9em',
      marginBottom: '5px',
      color: '#69FFF2',
    }
  },

}));

const ProgramCard = (props) => {
  const { program: name } = props;
  const cl = useRowStyles();

  const pData = data[name];

  return (
    <div className={cl.card}>
      <Paper className={cl.paperRoot} elevation="3">

         <Typography variant="h3" className={cl.name}>
           <Link component={RouterLink} to={`/catalog/programs/${name}`}>
            {name}
           </Link>
         </Typography>
         <Typography className={cl.fullName}>
            {pData.fullName}
         </Typography>
         <Typography className={cl.blurbContainer}>
           {pData && pData.logo && <div className={cl.logo}><img src={`/images/${pData.logo}`} /></div>}
           <span>{pData.blurb}</span>
         </Typography>
         <Sponsors programData={pData} />
         <div className={cl.link}>
           <Typography variant="h6">{'Program Website:'}</Typography>
           <div>
             <OpenInNewIcon color="primary" />
             <Typography noWrap={true}>
               <a href={pData.link} target="_blank" rel="noreferrer">{pData.link}</a>
             </Typography>
           </div>
         </div>
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
      background: 'rgba(0,0,0,0.3)'
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
  intro: {
    background: `radial-gradient(circle at 100% 100%, rgb(20,40,64) 0, rgb(20,40,64) 5px, transparent 5px) 0% 0%/8px 8px no-repeat,
            radial-gradient(circle at 0 100%, rgb(20,40,64) 0, rgb(20,40,64) 5px, transparent 5px) 100% 0%/8px 8px no-repeat,
            radial-gradient(circle at 100% 0, rgb(20,40,64) 0, rgb(20,40,64) 5px, transparent 5px) 0% 100%/8px 8px no-repeat,
            radial-gradient(circle at 0 0, rgb(20,40,64) 0, rgb(20,40,64) 5px, transparent 5px) 100% 100%/8px 8px no-repeat,
            linear-gradient(rgb(20,40,64), rgb(20,40,64)) 50% 50%/calc(100% - 6px) calc(100% - 16px) no-repeat,
            linear-gradient(rgb(20,40,64), rgb(20,40,64)) 50% 50%/calc(100% - 16px) calc(100% - 6px) no-repeat,
            linear-gradient(128deg, #69fff2 0%, #07274D 100%)`,
    borderRadius: '2px',
    padding: '75px 35px 0 35px',
    boxSizing: 'border-box',
    width: '450px',
    height: '685px',
    textAlign: 'justify',
    wordSpacing: '1px',
    lineHeight: '1.4em',
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
          <div className={cl.intro}>
            <Typography variant="h5">{introText}</Typography>
          </div>
          {programs.map((p) => p.name).sort().map((prog, i) => (
            <ProgramCard key={`program_card_${i}`} program={prog}  />
          ))}
        </div>
    );
  } else {
    return '';
  }
}

export default ProgramsList;
