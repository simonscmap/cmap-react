import audits from './audits';

export default (value, col) => {
    let cellAudit = [];
    let auditFuncs = audits[col];

    if(auditFuncs){
        auditFuncs.forEach(func => {
            let result = func(value);

            if(result) {
                cellAudit.push(result);
            }
        });
    }

    return cellAudit;
}