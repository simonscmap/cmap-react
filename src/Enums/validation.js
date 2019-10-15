const validation = {
    depth: {
        depthOneIsLower: 'Start cannot be larger than end',
        depthOneOutOfBounds: 'Start must be smaller than $',
        depthTwoOutOfBounds: 'End must be larger than $',
        negative: 'Depth cannot be negative'
    },

    date: {
        dateOneIsLater: 'Start cannot be later than end',
        dateOneOutOfBounds: 'Start must be before $',
        dateTwoOutOfBounds: 'End must be after $'
    },

    lat: {
        latOneIsHigher: 'Start cannot be larger than end.',
        latOneOutOfBounds: 'Start must be less than $',
        latTwoOutOfBounds: 'End must be greater than $'
    },

    lon: {
        lonOneIsHigher: 'Start cannot be larger than end.',
        lonOneOutOfBounds: 'Start must be less than $',
        lonTwoOutOfBounds: 'End must be greater than $'
    },

    type: {
        dataIsIrregular: '$ is not available for sparse data',
        dateRangeRequired: '$ requires a range of dates',
        depthRangeRequired: '$ requires a range of depths',
        surfaceOnlyDataset: '$ contains only surface data',
        irregularOnly: 'Sparse map is only available for sparse data',
        dataSizeTooLarge: 'Data set is too large for this visualization type.'
    },

    generic: {
        invalid: 'Invalid input',
        dataSizeWarning: 'Wait time and application performance may be poor due to size of data.',
        dataSizePrevent: 'Data set is too large. Please reduce date range or area size.'
    }
}

export default validation;