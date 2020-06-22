export default (metadata, workbook) => {
    let sample = metadata[0];
    let type = typeof sample.dataset_release_date;

    let is1904 = !!(((workbook.Workbook||{}).WBProps||{}).date1904);

    try {
        if(type === 'number') {
            if(is1904){
                sample.dataset_release_date = new Date(((sample.dataset_release_date - (25567))*86400*1000) + 1000 * 60 * 60 * 24 * 365 * 4).toISOString().slice(0, -14);
            }
    
            else {
                sample.dataset_release_date = new Date(((sample.dataset_release_date - (25567))*86400*1000)).toISOString().slice(0, -14);
            }    
        }
    
        else {
            sample.dataset_release_date = new Date(sample.dataset_release_date).toISOString().slice(0, -14);
        }
    }

    catch{
        return metadata;
    }

    let collapsedRow = {...sample};

    for(let i = 1; i < metadata.length; i++){
        Object.keys(sample).forEach(e => {
            if(metadata[i][e]){
                collapsedRow[e] += '\n\n';
                collapsedRow[e] += metadata[i][e];
            }
        });
    }

    return [collapsedRow];
}

// Format must match 2016-04-21T15:22:00

// const localDateToString = (date) => {
//     let year = date.getFullYear();
//     let month = date.getMonth() + 1;
//     let day = date.getDate()

//     let nYear = year.toString();
//     let nMonth = month < 10 ? '0' + month.toString() : month.toString();
//     let nDay = day < 10 ? '0' + day.toString() : day.toString();

//     return nYear + '-' + nMonth + '-' + nDay;
// }

// export default localDateToString;