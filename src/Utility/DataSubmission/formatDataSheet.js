export default (data, workbook) => {

    let sample = data[0].time;

    // Test sample row for correct format
    if(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z)?$/.test(sample)){
        return data;
    }

    let is1904 = !!(((workbook.Workbook||{}).WBProps||{}).date1904);

    let type = typeof sample;

    try {
        if(type === 'number') {
            if(is1904){
                data.forEach(e => {
                    e.time = new Date(((e.time - (25567))*86400*1000) + 1000 * 60 * 60 * 24 * 365 * 4).toISOString().slice(0, -5);
                })
            }
    
            else {
                data.forEach(e => {
                    e.time = new Date(((e.time - (25567))*86400*1000)).toISOString().slice(0, -5);
                })
            }
    
        }
    
        else {
            data.forEach(e => {
                e.time = new Date(e.time).toISOString().slice(0, -5);
            })
        }
    }

    catch{
        return data;
    }

    return data;
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