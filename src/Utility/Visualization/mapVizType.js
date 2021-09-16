import vizSubTypes from '../../enums/visualizationSubTypes';
import storedProcedures from '../../enums/storedProcedures';

const mapVizType = (vizType) => {
    const mapping = {
        [vizSubTypes.sectionMap]: {
            sp: storedProcedures.sectionMap,
            subType: vizSubTypes.sectionMap
        },
        [vizSubTypes.contourSectionMap]: {
            sp: storedProcedures.sectionMap,
            subType: vizSubTypes.contourSectionMap
        },
        [vizSubTypes.timeSeries]: {
            sp: storedProcedures.timeSeries,
            subType: vizSubTypes.timeSeries
        },
        [vizSubTypes.histogram]: {
            sp: storedProcedures.spaceTime,
            subType: vizSubTypes.histogram
        },
        [vizSubTypes.depthProfile]: {
            sp: storedProcedures.depthProfile,
            subType: vizSubTypes.depthProfile
        },
        [vizSubTypes.heatmap]: {
            sp: storedProcedures.spaceTime,
            subType: vizSubTypes.heatmap
        },
        [vizSubTypes.contourMap]: {
            sp: storedProcedures.spaceTime,
            subType: vizSubTypes.contourMap
        },
        [vizSubTypes.sparse]: {
            sp: storedProcedures.spaceTime,
            subType: vizSubTypes.sparse
        }   
    }

    return mapping[vizType];
}

export default mapVizType;