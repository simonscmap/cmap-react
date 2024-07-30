import { makeStyles } from '@material-ui/core/styles';
import React, { useState, useEffect, useRef } from 'react';

import Datasets from './AgGridExperimentDatasets';
import Variables from './AgGridExperimentVars';

import Proto from './Proto';


/*~~~~~~~~~~~~~~ List ~~~~~~~~~~~~~~~~~~~~*/
const useStyles = makeStyles ((theme) => ({
  container: {
    height: '700px',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    gap: '1em',
  },
  datasetListContainer: {
    position: 'relative',
    width: '60%',
    height: '100%',
  },
  tableContainer: {
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    backdropFilter: 'blur(20px)',
    height: 'calc(100% - 122px)',
    width: '100%',
    marginTop: '-1px',
    position: 'relative',
  },
  adjustibleTableContainer: {
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    backdropFilter: 'blur(20px)',
    height: '100%',
    width: '100%',
    marginTop: '-1px',
    position: 'relative',
  },

  datatsetHeaders: { // table container
    width: '100%',
  },
  variableHeaders: {
    width: '100%',
    overflow: 'hidden',
    flex: '0 0 auto',
  },

  datasetVariablesListContainer: {
    position: 'relative',
    width: '40%',
    height: 'calc(100% - 66px)',
    display: 'flex',
    flexDirection: 'column',
  },
  root: { // table header
    tableLayout: 'fixed',
    '& .MuiTableCell-stickyHeader': {
      backgroundColor: 'rgba(30, 67, 113, 1)',
    },
    '& .MuiTableCell-root': {
      borderBottom: 'unset',
    }
  },
  fullHeightWrapper: {
    flexGrow: 1,
  },
  datasetTable: {  },
  hasSelected: {
    marginTop: '40px',
  },
  variablesTable: { },

  // cell styles
  checkBoxHeader: {
    width: '12px',
  },
  headerWhenSelection: {
    '& th': {
      padding: '5px',
      top: 0,
      position: 'sticky',
      zIndex: 2, // keeps it above the radio buttons, which are absolutely position by mui
      backgroundColor: 'rgba(6, 31, 62, 1)', // background:'rgb(22, 58, 82)',//  'rgba(34, 163, 185, 0.8)',
    },
    '& th:nth-child(2)': {
      padding: '5px',
    },
    '& th:nth-child(3)': {
      padding: '5px',
    },
    '& .MuiRadio-root': {
      padding: '5px',
    }
  },
  dummyCheckBoxHeader: {
    width: '36px'
  },
  nameHeader: {
    width: 'calc(50% - 20px)',
    textOverflow: 'ellipsis',
    textWrap: 'nowrap',
    overflow: 'hidden',
    textIndent: '3px', // align with table cells below
  },
  nameAndLinkContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '5px',
    '& p': {
      textOverflow: 'ellipsis',
      textWrap: 'nowrap',
      overflow: 'hidden',
      padding: 0,
      margin: 0,
    },
    '& a': {
      color: theme.palette.primary.main,
      '&:visited': {
          color: theme.palette.primary.main
      }
    },
    '& svg': {
      fontSize: '0.9em',
    },
  },
  sourceHeader: {
    width: 'calc(50% - 20px)',
    textOverflow: 'ellipsis',
    textWrap: 'nowrap',
    overflow: 'hidden',
  },

  searchContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '55px',
    width: '55px',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: '20px',
    paddingLeft: '10px',
    transition: 'all 0.5s ease',
    borderRadius: '5px',
    '& svg': {
      paddingRight: '10px'
    },
    '& .MuiOutlinedInput-input': {
      border: 'none',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 0,
    }
  },
  searchActive:{
    width: 'calc(100% - 10px)',
    borderRadius: '5px',
    background: 'rgba(0,0,0,0.3)',
    '& .MuiOutlinedInput-input': {
      background: 'rgba(0,0,0,1)',
      borderRadius: '5px',
      border: '2px solid #22A3B9', // #3f51b5 // #22A3B9
    },
    '& fieldset': {
      borderRadius: '5px',
    },
    '& .MuiFormControl-root': {
      flexGrow: 3,
    }
  },
  inputRoot: {
  },
  selectVarInstruction: {
    margin: '.5em 0',
    padding: '.5em',
    border: '2px solid #d16265',
  },
  noVarsIndicator: {
    margin: '.5em 0',
    padding: '.5em',
    border: '2px solid #d16265',
  }
}));


const DatasetControls = (props) => {
  const cl = useStyles();
  return (
      <div className={cl.container}>
        <div className={cl.datasetListContainer}>
          {/* Dataset Column Headers */}
          <Datasets />
        </div>

        <div className={cl.datasetVariablesListContainer}>
          {/* Variables Column Headers */}
          <Variables />
        </div>
      </div>
    );
};

// List Datasets in Program

const DatasetList = () => {
  // selectors
  const selectProgramDetailsRequestStatus = (state) => state.programDetailsRequestStatus;

  const deps = [
    selectProgramDetailsRequestStatus,
  ];


  return (
    <Proto title={'Program Datasets'} deps={deps}>
      <DatasetControls />
    </Proto>
  );
};

export default DatasetList;
