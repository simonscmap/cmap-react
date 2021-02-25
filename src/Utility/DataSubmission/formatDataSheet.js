export default (data, workbook) => {
    if(!data || !data.length) return;

    try {
        let sample = data[0].time;

        // Test sample row for correct format
        if(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z)?$/.test(sample)){
        }

        else {
            let is1904 = !!(((workbook.Workbook||{}).WBProps||{}).date1904);
    
            let type = typeof sample;
    
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

    }

    catch(e){
        console.log('Caught while formatting data');
    }

    let cols = Object.keys(data[0]);
    let keysContaining__EMPTY = [];
    cols.forEach(e => {
        if(e.indexOf('__EMPTY') !== -1) keysContaining__EMPTY.push(e);
    })

    if(keysContaining__EMPTY.length){
        data.forEach(e => {
            keysContaining__EMPTY.forEach(key => {
                delete e[key];
            })
        })
    }

    return data;
}