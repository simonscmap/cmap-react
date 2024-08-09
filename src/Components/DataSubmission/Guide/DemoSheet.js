import React from 'react';
import { RevoGrid } from '@revolist/react-datagrid';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles (() => ({
  container: {
    '& .main-viewport': {
      background: 'white',
      color: 'black',
    },
    '& > .hydrated': {
      minHeight: '100px',
      fontSize: '14px'
    },
  }
}));



const Demo = (props) => {
  const { columns, source } = props;
  const cl = useStyles ();
  return (
    <div className={cl.container}>
      <RevoGrid
        columns={columns}
        source={source}
        autoSizeColumn={{ mode: 'autoSizeAll', allColumns: true}}
        rowHeaders={{ size: 20 }}
        resize={true} />
    </div>
  )
}

export default Demo;
