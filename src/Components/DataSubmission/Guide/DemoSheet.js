import React, { useEffect, useState } from 'react';
import { RevoGrid } from '@revolist/react-datagrid';
import { makeStyles } from '@material-ui/core/styles';




const useStyles = makeStyles (() => ({
  container: {
    width: '100%',
    '& .main-viewport': {
      background: 'white',
      color: 'black',
    },
    '& > .hydrated': {
      minHeight: '197px',
      fontSize: '14px'
    },
    '& .main-viewport .viewports .inner-content-table':{
      width: 'auto',
    }
  }
}));



const Demo = (props) => {
  const { columns, source } = props;
  const cl = useStyles ();

  const [inlineStyleFixed, setFixed] = useState (false);

  const fixInlineStyle = () => {
    const el = document.querySelector ('.inner-content-table');
    if (el && !inlineStyleFixed) {
      setFixed (true);
      el.style = '';
    } else {
      setTimeout(fixInlineStyle, 100);
    }
  }

  useEffect (() => {
    setTimeout (fixInlineStyle, 100);
  }, []);

  return (
    <div className={cl.container}>
      <RevoGrid
        colSize={200}
        columns={columns}
        source={source}
        resize={true} />
    </div>
  )
}

export default Demo;
