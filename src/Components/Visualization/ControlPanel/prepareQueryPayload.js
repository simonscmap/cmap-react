import { mapVizType, cleanSPParams } from '../helpers';
import manageDateParams from './manageDateParams';

/* parameters :: {
   depth1,
   depth2,
   dt1,
   dt2,
   lat1,
   lat2,
   lon1,
   lon2,
   fields,
   tableName,
   spName
   }
*/

/* enums/visualizationSubTypes */
/* subType :: 'Section Map' | 'Contour Section Map' | 'Time Series' | 'Histogram' | 'Depth Profile' | 'Heatmap' | 'Contour Map' | 'Sparse' */

/* metadata :: {} */

// Payload :: { parameters, subType, metadata }

const fn = (currentState, currentProps) => {
  const {
    depth1,
    depth2,
    lat1,
    lat2,
    lon1,
    lon2,
    selectedVizType, // note, selectedVizType must be set in order to prep params
  } = currentState;

  if (!selectedVizType) {
    return null;
  }

  const mapping = mapVizType(selectedVizType);
  const dateParams = manageDateParams(currentState, currentProps);
  const parameters = cleanSPParams({
    depth1,
    depth2,
    ...dateParams,
    lat1,
    lat2,
    lon1,
    lon2,
    fields: currentProps.vizPageDataTargetDetails.Variable,
    tableName: currentProps.vizPageDataTargetDetails.Table_Name,
    spName: mapping.sp,
  });

  return {
    parameters,
    subType: mapping.subType,
    metadata: currentProps.vizPageDataTargetDetails,
  };
};

export default fn;
