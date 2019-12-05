import visualizationSubTypes from '../Enums/visualizationSubTypes';

export default (charts) => {
    let count = 0;
    charts.forEach(chart => {
        if(chart.subType === visualizationSubTypes.heatmap) count ++;
        if(chart.subType === visualizationSubTypes.sparse){
            count ++;
            if(chart.data.variableValues.length > 10000) count +=3;
        }
    })
    return count;
}