/* Estimate Data Size

   Given the parameters of the visualization, estimate the size of the data to be visualized.

   This is used during validation checks, and will cause a warning to be displayed
   if the total size exceeds a certain limit.

   See VizControlPanel.js for use.

 */

import spatialResolutions from '../../../enums/spatialResolutions';
import temporalResolutions from '../../../enums/temporalResolutions';
import mapSpatialResolutionToNumber from '../../../Utility/mapSpatialResolutionToNumber';
import mapTemporalResolutionToNumber from '../../../Utility/mapTemporalResolutionToNumber';
import vizSubTypes from '../../../enums/visualizationSubTypes';
import depthUtils from '../../../Utility/depthCounter';

function estimateDataSize(vizPageDataTargetDetails, state) {
  const { dt1, dt2, lat1, lat2, lon1, lon2, depth1, depth2, selectedVizType } =
    state;

  if (!vizPageDataTargetDetails) {
    return 0;
  }

  if (
    vizPageDataTargetDetails.Spatial_Resolution === spatialResolutions.irregular
  ) {
    return 1;
  } else {
    const date1 =
      vizPageDataTargetDetails.Temporal_Resolution ===
      temporalResolutions.monthlyClimatology
        ? dt1
        : Date.parse(dt1);
    const date2 =
      vizPageDataTargetDetails.Temporal_Resolution ===
      temporalResolutions.monthlyClimatology
        ? dt2
        : Date.parse(dt2);

    const dayDiff = (date2 - date1) / 86400000;

    const res = mapSpatialResolutionToNumber(
      vizPageDataTargetDetails.Spatial_Resolution,
    );
    var dateCount =
      vizPageDataTargetDetails.Temporal_Resolution ===
      temporalResolutions.monthlyClimatology
        ? date2 - date1 + 1
        : Math.floor(
            dayDiff /
              mapTemporalResolutionToNumber(
                vizPageDataTargetDetails.Temporal_Resolution,
              ),
          ) || 1;

    dateCount *= 1.4; // add more weight to date because of sql indexing

    const depthCount =
      depthUtils.count({ data: vizPageDataTargetDetails }, depth1, depth2) || 1;

    const latCount = (lat2 - lat1) / res;
    const lonCount =
      lon2 > lon1 ? (lon2 - lon1) / res : (180 - lon1 + (lon2 + 180)) / res;
    const pointCount = lonCount * latCount * depthCount * dateCount;

    if (
      selectedVizType === vizSubTypes.timeSeries ||
      selectedVizType === vizSubTypes.depthProfile
    ) {
      return pointCount / 200;
    }

    return pointCount;
  }
}

export default estimateDataSize;
