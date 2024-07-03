import React, { useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import {  makeStyles, Link } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { safePath } from '../../../Utility/objectUtils';
import states from '../../../enums/asyncRequestStates';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProgramsSend,
} from '../../../Redux/actions/catalog';
import Spinner from '../../UI/Spinner';
import { Link as RouterLink } from 'react-router-dom';
import { intro, matchProgram } from './programData';

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
      justifyContent: 'center',
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
    height: '545px',
  },
  paperRoot: {
    overflow: 'hidden',
    height: '100%',
    boxSizing: 'border-box',
    '& h3 a': {
      fontFamily: 'Montserrat,sans-serif'
    },
    display: 'grid',
    gridTemplateColumns: '100%',
    gridTemplateRows: '45px 61px auto 40px',
    columnGap: '1em',
    rowGap: '1em',
    gridTemplateAreas: `'name'
      'fullName'
      'description'
      'footer'
    `,
  },
  name: {
    gridArea: 'name',
  },
  logo: {
    float: 'right',
    width: '150px',
    height: '150px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 0 0 13px',
    '& img': {
      objectFit: 'contain',
      width: '90%',
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
    hyphens: 'auto',
  },
  sponsor: {
    gridArea: 'sponsor',
  },
  footer: {
    width: '100%',
    gridArea: 'footer',
  },
  link: {
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

  const pData = matchProgram (name);

  return (
    <div className={cl.card}>
      <Paper className={cl.paperRoot} elevation={3}>
         <Typography variant="h3" className={cl.name}>
           <Link component={RouterLink} to={`/catalog/programs/${name}`}>
            {name}
           </Link>
         </Typography>
         <Typography className={cl.fullName}>
            {pData.fullName}
         </Typography>
         <div className={cl.blurbContainer}>
           {pData && pData.logo && <div className={cl.logo}><img src={`/images/${pData.logo}`} /></div>}
           <Typography>{pData.blurb}</Typography>
         </div>
         <div className={cl.footer}>
           <Grid container>
             <Grid item xs={7}>
               <div className={cl.link}>
                 <div>
                   <OpenInNewIcon color="primary" />
                   <Typography noWrap={true}>
                     <a href={pData.link} target="_blank" rel="noreferrer">{pData.link}</a>
                   </Typography>
                 </div>
               </div>
             </Grid>
             <Grid item xs={5}>
               <Sponsors programData={pData} />
             </Grid>
          </Grid>
        </div>
      </Paper>
    </div>
  );
}

/*~~~~~~~~~~~~~~ List ~~~~~~~~~~~~~~~~~~~~*/
const useStyles = makeStyles (() => ({
  wrapper: {
    display: 'flex',
    gap: '4em',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '100px',
    '& hr': {
      height: '2px',
      width: '50%',
      color: 'rgba(161, 246, 64,0.2)',
      background: 'rgba(161, 246, 64,0.2)',
      border: 0,
    }
  },
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
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
    width: 'calc(100% - 450px)',
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2em',
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
      <div className={cl.wrapper}>
        <div className={cl.intro}>
          <Typography variant="h4">{intro.lede}</Typography>
          <Typography variant="h5">{intro.instruction}</Typography>
        </div>
        <hr />
        <div className={cl.container}>
          {programs.map((p) => p.name).sort().map((prog, i) => (
            <ProgramCard key={`program_card_${i}`} program={prog}  />
          ))}
        </div>
      </div>
    );
  } else {
    return '';
  }
}

export default ProgramsList;
