const validation = {
    depth: {
        depthOneIsLower: 'Cannot be larger than end',
        depthOneOutOfBounds: 'Data ends at $',
        depthTwoOutOfBounds: 'Data begins at $',
        negative: 'Cannot be negative'
    },

    date: {
        dateOneIsLater: 'Cannot be after end',
        dateOneOutOfBounds: 'Data ends at $',
        dateTwoOutOfBounds: 'Data begins at $'
    },

    lat: {
        latOneIsHigher: 'Cannot be larger than end',
        latOneOutOfBounds: 'Data ends at $',
        latTwoOutOfBounds: 'Data begins at $'
    },

    lon: {
        lonOneIsHigher: 'Cannot be larger than end',
        lonOneOutOfBounds: 'Data ends at $',
        lonTwoOutOfBounds: 'Data begins at $'
    },

    type: {
        dataIsIrregular: '$ is not available for sparse data',
        dateRangeRequired: '$ requires a range of dates',
        depthRangeRequired: '$ requires a range of depths',
        surfaceOnlyDataset: '$ contains only surface data',
        irregularOnly: 'Sparse map is only available for sparse data',
        dataSizeTooLarge: 'Data set is too large for this visualization type.',
        webGLContextLimit: 'Rendering limit exceeded for plots. Please delete one or more.'
    },

    generic: {
        invalid: 'Invalid input',
        dataSizeWarning: 'Wait time and application performance may be poor due to size of data.',
        dataSizePrevent: 'Data set is too large. Please reduce date range or area size.',
        variableMissing: 'Please select a variable',
        vizTypeMissing: 'Please select a visualization type',
        guestMaximumReached: 'Guests are limited to creating 10 plots per day. Please log in or register.'
    }
}

export default Object.freeze(validation);