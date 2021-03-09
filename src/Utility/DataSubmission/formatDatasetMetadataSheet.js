export default (metadata, workbook) => {
    if(!metadata || !metadata.length) return;
    
    try {
        var sample = metadata[0];
        var type = typeof sample.dataset_release_date;

        var is1904 = !!(((workbook.Workbook||{}).WBProps||{}).date1904);

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
        
    }

    let cols = Object.keys(metadata[0]);
    let keysContaining__EMPTY = [];
    cols.forEach(e => {
        if(e.indexOf('__EMPTY') !== -1) keysContaining__EMPTY.push(e);
    })

    if(keysContaining__EMPTY.length){
        metadata.forEach(e => {
            keysContaining__EMPTY.forEach(key => {
                delete e[key];
            })
        })
    }

    cols.forEach(col => {
        metadata.forEach((row) => {
            let cellValue = row[col];
            if(typeof cellValue === 'string') row[col] = cellValue.trim();
        });
    });

    return metadata;
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