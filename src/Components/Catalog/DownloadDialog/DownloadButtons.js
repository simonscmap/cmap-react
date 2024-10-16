import React from 'react';
import {
  withStyles,
  makeStyles,
  Button,
} from '@material-ui/core';
import {  useDispatch } from 'react-redux';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { downloadDialogOpen } from '../../../Redux/actions/ui';

// Filled Variant

const GreenButtonFilled = withStyles((theme) => ({
  root: {
    color: 'black',
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.secondary.light,
    },
    borderRadius: '36px',
    boxSizing: 'border-box',
    padding: '2px 16px',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: 'unset',
    textTransform: 'none',
    '& span': {
      whiteSpace: 'nowrap',
    },
    lineBreak: 'none'
  },
}))(Button);


const useFilledStyles = makeStyles((theme) => ({
  buttonTextSpacer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '.75em',
    alignItems: 'center',
  },
}));

export const DownloadButtonFilled = (props) => {
  const { shortName, action, componentId = {} } = props;
  const cl = useFilledStyles();
  const dispatch = useDispatch ();

  const onClick = action
        ? action
        : () => {
          dispatch (downloadDialogOpen (shortName))
        }
  return (
    <div style={{ display: 'inline-block'}} {...componentId}>
      <GreenButtonFilled onClick={onClick}>
        <div className={cl.buttonTextSpacer}>
          <CloudDownloadIcon />{' '}
          <span>Download</span>
        </div>
      </GreenButtonFilled>
    </div>
  );
}

// Outlined Variant

const GreenButtonOutlined = withStyles((theme) => ({
  root: {
    color: theme.palette.primary.main,
    border: `2px solid ${theme.palette.primary.main}`,
    '&:hover': {
      border: `2px solid ${theme.palette.secondary.main}`,
    },
    borderRadius: '36px',
    boxSizing: 'border-box',
    padding: '0 14px',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: 'unset',
    textTransform: 'none',
    '& span': {
      whiteSpace: 'nowrap',
    },
    lineBreak: 'none'
  },
}))(Button);

const useOutlinedStyles = makeStyles((theme) => ({
  buttonTextSpacer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '.75em',
    alignItems: 'center',
  },
}));

export const DownloadButtonOutlined = (props) => {
  const { shortName, action } = props;
  const cl = useOutlinedStyles();
  const dispatch = useDispatch ();

  const onClick = action
        ? action
        : () => {
          dispatch (downloadDialogOpen (shortName))
        }
  return (
    <div style={{ display: 'inline-block'}}>
      <GreenButtonOutlined onClick={onClick}>
        <div className={cl.buttonTextSpacer}>
          <CloudDownloadIcon />{' '}
          <span>Download</span>
        </div>
      </GreenButtonOutlined>
    </div>
  );
}
