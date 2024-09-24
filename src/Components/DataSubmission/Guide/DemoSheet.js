import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
// $gray: rgb(243, 242, 241);
// $green: rgb(33, 115, 70);
// $gray-dark: rgb(230, 230, 230);
// $gray-darker: rgb(205, 205, 205);
const useStyles = makeStyles (() => ({
  container: {
    width: '100%',
    margin: '0 0 2em 0',
    overflowX: 'scroll',
    overflowY: 'scroll',
    position: 'relative',
  },
  containerHeight2: {
    height: '85px',
  },
  containerHeight5: {
    height: '155px',
  },
  containerHeightLarge: {
    height: '250px',
  },
  grid: {
    position: 'absolute',
    top: 0,
    left: 0,
    // allow it to expand right
  },
  cells: {
    position: 'relative',
    display: 'grid',
    gridGap: '1px',
    background: 'rgb(205, 205, 205)',
    gridAutoFlow: 'dense',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  row2: {
    gridTemplateRows: 'repeat(2, 25px)',
  },
  row9: {
    gridTemplateRows: 'repeat(9, 25px)',
  },
  col5: {
    gridTemplateColumns: '40px repeat(5, calc((100% - 50px) / 5))',
  },
  col6: {
    gridTemplateColumns: '40px repeat(6, calc((100% - 50px) / 6))',
  },
  col9: {
    gridTemplateColumns: '40px repeat(9, calc((100% - 50px) / 9))',
  },
  col10: {
    gridTemplateColumns: '40px repeat(10, calc((100% - 50px) / 10))',
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
    fontSize: '14px',
    color: 'rgb(68, 68, 68)',
    background: 'rgb(230, 230, 230)',
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '2em',
    '& > span': {
      display: 'inline-block',
      margin: '0 auto',
      padding: '0 5px'
    }
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

  console.log ({ columns, source });

  const numberOfColumns = columns.length;

  const orderedColumns = columns.map (c => c.name);

  const rowNumbers = [];

  for (let k = 0; k < source.length; k++) {
    rowNumbers.push (<div className={cl.number} key={`cell_rownum${k}`}>{k + 1}</div>);
  }

  const cells = [];

  source.forEach ((row, rix) => {
    orderedColumns.forEach ((colName, cix) => {
      cells.push (<input className={cl.input} value={row[colName]} key={`${rix}_${cix}`}/>);
    });
  });

  const cols = orderedColumns.map ((c, ix) =>
    (<div className={cl.alphabet} key={`cell_head${ix}`}><span>{c}</span></div>));


  const containerHeight = source.length > 5 ? 'containerHeightLarge' : `containerHeight${source.length}`;


  return (
    <div className={`${cl.container} ${cl[containerHeight]}`}>
      <div className={cl.grid}>
        <div className={`${cl.cells} ${cl['col'+numberOfColumns]} ${cl['row'+source.length]}`}>
          <div className={cl.spacer}></div>
          {cols}
          {rowNumbers}
          {cells}
        </div>
      </div>
    </div>
  )
}

export default Demo;
