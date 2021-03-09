export default (metadata) => {
    if(!metadata || !metadata.length) return;
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
        metadata.forEach(row => {
            let cellValue = row[col];
            if(typeof cellValue === 'string') row[col] = cellValue.trim();
        });
    });

    return metadata;
}