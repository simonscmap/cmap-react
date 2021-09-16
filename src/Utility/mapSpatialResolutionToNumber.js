import spatialResolutions from '../enums/spatialResolutions';

const mapSpatialResolutionToNumber = (resolution) => {
    let map = {
        [spatialResolutions.halfDegree] : .5,
        [spatialResolutions.quarterDegree] : .25,
        [spatialResolutions.twentyFifthDegree] : .04,
        [spatialResolutions.fourKm] : .041672,
        [spatialResolutions.twelfthDegree] : .083333,
        [spatialResolutions.oneDegree] : 1,
        [spatialResolutions.seventyKm] : .25,
        [spatialResolutions.nineKm] : .083333,
        [spatialResolutions.twentyFiveKm] : .23148
    };

    return map[resolution];
}

export default mapSpatialResolutionToNumber;