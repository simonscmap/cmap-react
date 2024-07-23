import React from 'react';
import Typography from '@material-ui/core/Typography';
import { sectionStyles } from '../guideStyles';
import { map } from './columnData';

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
      {item.text.map((text, i) => (
        <Typography key={i}>{text}</Typography>
      ))}
      <ul>
        {item.bullets.map((bullet, i) => (
          <li key={i}>{bullet}</li>
        ))}
      </ul>
      {item.images.map((image, i) => (
        <figure key={i}>
          <img
            src={image.src}
            alt={image.alt}
            width={image.width || '100%'}
          />
          <figcaption>{image.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
};

// Data Sheet
export const TimeColumn = ColumnSection;
export const LatColumn = ColumnSection;
export const LonColumn = ColumnSection;
export const DepthColumn = ColumnSection;
export const VarNColumns = ColumnSection;

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
export const CruiseNamesColumn = ColumnSection;

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
