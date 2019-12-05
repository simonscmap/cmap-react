const validation = {
    depth: {
        depthOneIsLower: 'Cannot be larger than end',
        depthOneOutOfBounds: 'Must be smaller than $',
        depthTwoOutOfBounds: 'Must be larger than $',
        negative: 'Cannot be negative'
    },

    date: {
        dateOneIsLater: 'Cannot be after end',
        dateOneOutOfBounds: 'Must be before $',
        dateTwoOutOfBounds: 'Must be after $'
    },

    lat: {
        latOneIsHigher: 'Cannot be larger than end.',
        latOneOutOfBounds: 'Must be less than $',
        latTwoOutOfBounds: 'Must be greater than $'
    },

    lon: {
        lonOneIsHigher: 'Cannot be larger than end.',
        lonOneOutOfBounds: 'Must be less than $',
        lonTwoOutOfBounds: 'Must be greater than $'
    },

    type: {
        dataIsIrregular: '$ is not available for sparse data',
        dateRangeRequired: '$ requires a range of dates',
        depthRangeRequired: '$ requires a range of depths',
        surfaceOnlyDataset: '$ contains only surface data',
        irregularOnly: 'Sparse map is only available for sparse data',
        dataSizeTooLarge: 'Data set is too large for this visualization type.',
        webGLContextLimit: 'Limit exceeded for sparse and heatmaps. Please delete one or more to proceed.'
    },

    generic: {
        invalid: 'Invalid input',
        dataSizeWarning: 'Wait time and application performance may be poor due to size of data.',
        dataSizePrevent: 'Data set is too large. Please reduce date range or area size.',
        variableMissing: 'Please select a variable',
        vizTypeMissing: 'Please select a visualization type'
    }
}

export default validation;