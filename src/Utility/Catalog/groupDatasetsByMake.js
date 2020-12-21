const groupDatasetsByMake = (datasets) => datasets.reduce((acc, cur) => {
    acc[cur.variables[0].Make].push(cur);
    return acc;
}, {
    Observation: [],
    Model: []
});

export default groupDatasetsByMake;