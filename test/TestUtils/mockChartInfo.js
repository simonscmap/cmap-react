import mockVariableMetaData from './mockVariableMetadata';

export default () => {
    return {
        infoObject: {
            parameters: {
                dt1: new Date().toISOString(),
                dt2: new Date().toISOString()
            },
            metadata: mockVariableMetaData(),
            hasDepth: true,
            times: [],
            lats: [],
            lons: [],
            depths: [],
            variableValues: []
        },

        xValues: [],
        yValues: [],
        markerOptions: {},
        xTitle: '',
        yTitle: '',
        type: ''
    };
};



