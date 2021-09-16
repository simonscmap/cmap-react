import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import VideocamIcon from '@material-ui/icons/Videocam';
import { AiFillApi } from "react-icons/ai";
import { ImLifebuoy } from "react-icons/im";
import { ReactComponent as Python } from '../../assets/icons/python.svg';
import { ReactComponent as Julia } from '../../assets/icons/julia-language-icon.svg';
import { ReactComponent as Matlab } from '../../assets/icons/matlab.svg';
import { ReactComponent as Rlang } from '../../assets/icons/Rlogo.svg';

import Tooltip from '@material-ui/core/Tooltip';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import ExploreIcon from '@material-ui/icons/Explore';


const useStyles = makeStyles((theme) => ({
  speedDial: {
    transform: 'translateZ(0px)',
    flexGrow: 1,
    position: 'absolute',
    '&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft': {
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
    '&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight': {
      top: theme.spacing(2),
      left: theme.spacing(2),
    },
  },
}));



export default function Help(props) {
  const classes = useStyles();
  const [direction, setDirection] = React.useState('up');
  const [open, setOpen] = React.useState(false);

  const handleDirectionChange = (event) => {
    setDirection(event.target.value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };




  const actions = [
    { icon: <ExploreIcon style={{width:25, height:25}}/>, name: 'Explore', link: 'Explore'},
    { icon: <VideocamIcon style={{width:25, height:25}}/>, name: 'Video Tutorial', link: props.videoLink },
    { icon: <AiFillApi style={{width:25, height:25}}/>, name: 'API', link: props.apiLink },
    { icon: <Python style={{width:25, height:25}}/>, name: 'Python', link: props.pythonLink },
    { icon: <Rlang style={{width:25, height:25}}/>, name: 'R', link: props.rLink },
    { icon: <Matlab style={{width:25, height:25}}/>, name: 'Matlab', link: props.matlabLink },
    { icon: <Julia style={{width:25, height:25}}/>, name: 'Julia', link: props.juliaLink },
  ];


  return (
        
        <Tooltip title="Help" aria-label="help" placement="left-end">
          <SpeedDial
            ariaLabel="help"
            className={classes.speedDial}
            hidden={false}
            icon={<SpeedDialIcon icon={<ImLifebuoy style={{width:27, height:27}} />}  style={{display:'flex', justifyContent:'center', alignItems:'center'}}  />}
            onClose={handleClose}
            onOpen={handleOpen}
            open={open}
            direction={direction}
          >
            {actions.map((action) => ( action.link ? 
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={handleClose}
                target="_blank" 
                rel="noopener noreferrer"
                href={action.link }
              />              
              :
              null
              ))}
          </SpeedDial>
        </Tooltip>

  );
}
