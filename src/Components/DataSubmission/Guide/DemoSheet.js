import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { RevoGrid } from '@revolist/react-datagrid';

const useStyles = makeStyles (() => ({

  container: {
    position: 'relative',
    width: '100%',
    height: '200px',
    '& .main-viewport': {
      background: 'white',
      color: 'black',
    },
    '& > .hydrated': {
      minHeight: '197px',
      fontSize: '14px',
    },
    '& .main-viewport .viewports .inner-content-table': {
      width: 'auto',
    },
  },
  grid: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    overflowX: 'auto',
    overflowY: 'scroll',
    '& revo-grid': {
      width: 'auto'
    }
  },
  cells: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '40px repeat(6, calc((100% - 50px) / 6))',
    gridTemplateRows: 'repeat(6, 25px)',
    gridGap: '1px',
    background: 'rgb(205, 205, 205)',
    gridAutoFlow: 'dense',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  spacer: {
    background: 'rgb(230, 230, 230)',
    position: 'relative',
    '&:after': {
      content: "",
      position: 'absolute',
      right: '4px',
      bottom: '4px',
      height: '80%',
      width: '100%',
      background: 'linear-gradient(135deg, transparent 30px, #bbb 30px, #bbb 55px, transparent 55px)',
    }
  },
  alphabet: {
    fontFamily: 'Noto Sans, sans-serif',
    color: 'rgb(68, 68, 68)',
    background: 'rgb(230, 230, 230)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    fontFamily: 'Noto Sans, sans-serif',
    color: 'rgb(68, 68, 68)',
    background: 'rgb(230, 230, 230)',
    gridColumn: '1 / span 1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    border: 'none',
    padding: '0 6px',
  }

}));

const Demo = (props) => {
  const { columns, source } = props;
  const cl = useStyles ();

  return (
    <div className={cl.container}>
      <div className={cl.grid}>
        <RevoGrid
          colSize={200}
          columns={columns}
          source={source}
          resize={true} />
      </div>
    </div>
  )
}

export default Demo;

// <div className={cl.cells}>
//           <div className={cl.spacer}></div>
//           <div className={cl.alphabet}>A</div>
//           <div className={cl.alphabet}>B</div>
//           <div className={cl.alphabet}>C</div>
//           <div className={cl.alphabet}>D</div>
//           <div className={cl.alphabet}>E</div>
//           <div className={cl.alphabet}>F</div>
//           <div className={cl.number}>1</div>
//           <div className={cl.number}>2</div>
//           <div className={cl.number}>3</div>
//           <div className={cl.number}>4</div>
//           <div className={cl.number}>5</div>
//           <div className={cl.number}>6</div>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//           <input className={cl.input}/>
//         </div>
