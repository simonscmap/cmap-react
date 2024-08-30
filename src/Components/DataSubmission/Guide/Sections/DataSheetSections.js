import React from 'react';
import Typography from '@material-ui/core/Typography';
import { sectionStyles } from '../guideStyles';
import { map } from './columnData';
import { makeStyles } from '@material-ui/core/styles';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import { CustomAlert } from '../Alert';


const BulletPoints = (props) => {
  const { bullets } = props;
  if (!Array.isArray(bullets) || bullets.length < 1) {
    return '';
  }
  if (bullets.length === 1) {
    return <Typography>{bullets[0]}</Typography>
  } else {
    return (
      <ul>
        {bullets.map((bullet, i) => (
          <li key={i}>{bullet}</li>
        ))}
      </ul>
    );
  }
};

const useTableStyles = makeStyles((theme) => ({
  row: {
    fontSize: '.9em',
  },
  label: {
    color: 'rgb(135, 255, 244)',
    whiteSpace: 'nowrap',
  },
  monoValue: {
    fontFamily: 'mono',
    color: theme.palette.primary.light,
  },
  propcell: {
    borderBottom: 'none',
    padding: '2px 4px 10px 10px',
    width: '120px',
    '& p': {
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
  },
  valuecell: {
    borderBottom: 'none',
    padding: '2px 4px 10px 10px',
    fontSize: '1em',
    '& p': {
      width: '100%',
      whiteSpace: 'wrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
    '& ul': {
      listStylePosition: 'outside',
      paddingLeft: '16px'
    },
    '& li': {
      fontSize: '1.2em',
    }
  },
  textValue: {
    fontSize: '1em'
  },
  labelCell: {
    verticalAlign: 'top',
    borderBottom: 'none',
    padding: '.1em .3em .1em 0',
    width: '200px',
    minWidth: '200px',
  },
  scrollable: {
    maxHeight: '112px',
    overflowY: 'scroll',
  },
  compactTable: {
    tableLayout: 'fixed',
    '& td': {
      // fontSize: '.9em',
      padding: 0,
      // textIndent: '.5em'
    }
  }
}));


const Row = (props) => {
  const { property, val, children } = props;
  const ts = useTableStyles ();

  const v = val && typeof val !== 'object' ? val.toString() : val;

  return (
    <TableRow className={ts.row} >
      <TableCell className={ts.propcell}>
        <Typography className={ts.textValue}>{property}</Typography>
      </TableCell>
      <TableCell className={ts.valuecell}>
        {val && <Typography className={ts.textValue}>
                  {v}
                </Typography>}

          {children && children}
      </TableCell>
    </TableRow>
  );
}


export const Meta = (props) => {
  const { meta } = props;
  const cl = sectionStyles ();
  const ts = useTableStyles ();

  if (!meta) {
    return '';
  }

  // {meta.required ? <div className={cl.badge}>Required</div> : <div className={cl.badgeOptional}>Optional</div>}
  return (
    <CustomAlert severity="info">
      <div className={cl.metaContainer}>
        <TableContainer size="small" className={ts.compactTable}>
          <Table>
            <TableBody className={cl.body}>
              {meta.required
               ? <TableRow><TableCell><span className={cl.badgeRequired}>Required</span></TableCell></TableRow>
               : <TableRow><TableCell><span className={cl.badgeOptional}>Optional</span></TableCell></TableRow>}
              {meta.type && <Row property={'Type'} val={meta.type} /> }
              {meta.format && <Row property={'Format'} val={meta.format} /> }
              {meta.unit && <Row property={'Unit'} val={meta.unit} /> }
              {Array.isArray(meta.constraints) &&
               <Row property={'Constraints'} >
                 <BulletPoints bullets={meta.constraints} />
               </Row>
              }
              {meta.example && <Row property={'Example'}>{ typeof meta.example === 'function' ? meta.example.call() : meta.example }</Row> }
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </CustomAlert>
  );
}

const ColumnSection = (props) => {
  const { tocId, focus } = props;
  const cl = sectionStyles ();

  const item = map.get(tocId);

  if (!item) {
    console.log ('no item for', tocId)
    return '';
  }

  return (
    <div className={cl.container}>
      <Meta meta={item.meta} />

      {item.text.map((text, i) => (
        <Typography key={i}>{text}</Typography>
      ))}

      <BulletPoints bullets={item.bullets} />

      {Array.isArray(item.images) && item.images.map((image, i) => (
        <div className={cl.scrollWrapper} key={`${i}`}>
          <div className={cl.standoutBadgeNoOverlap}>Example: {image.alt}</div>
          <div className={cl.standoutBox} key={`${i}`}>
            <img
              src={image.src}
              alt={image.alt}
              width={image.width || '100%'}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Data Sheet
export const TimeColumn = ColumnSection;
export const LatColumn = ColumnSection;
export const LonColumn = ColumnSection;
export const DepthColumn = ColumnSection;
export const CruiseColumn = ColumnSection;

// Metadata Sheet
export const DatasetShortName = ColumnSection;
export const DatasetLongNameColumn = ColumnSection;
export const DatasetVersionColumn = ColumnSection;
export const DatasetReleaseDateColumn = ColumnSection;
export const DatasetMakeColumn = ColumnSection;
export const DatasetSourceColumn = ColumnSection;
export const DatasetDistributorColumn = ColumnSection;
export const DatasetAcknowledgmentColumn = ColumnSection;
export const DatasetHistoryColumn = ColumnSection;
export const DatasetDescriptionColumn = ColumnSection;
export const DatasetReferencesColumn = ColumnSection;
export const ClimatologyColumn = ColumnSection;

// Variable Metadata Sheet
export const VarShortNameColumn = ColumnSection;
export const VarLongNameColumn = ColumnSection;
export const VarSensorColumn = ColumnSection;
export const VarUnitColumn = ColumnSection;
export const VarSpatialResColumn = ColumnSection;
export const VarTemporalResColumn = ColumnSection;
export const VarDisciplineColumn = ColumnSection;
export const VisualizeColumn = ColumnSection;
export const VarKeywordsColumn = ColumnSection;
export const VarCommentColumn = ColumnSection;
