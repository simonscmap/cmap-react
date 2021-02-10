const aggregateChartDataSize = (charts) => {
    let size = 0;

    charts.forEach(ch => {
        size += ch.data.variableValues && ch.data.variableValues.length ? ch.data.variableValues.length : 0;
    });


    return size;
}

export default aggregateChartDataSize;