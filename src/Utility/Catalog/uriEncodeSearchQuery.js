export default ({searchWords = [], hasDepth, timeStart, timeEnd, latStart, latEnd, lonStart, lonEnd}) => {
    let qString = '';

    searchWords.forEach((keyword, i) => qString += `${i > 0 ? '&' : ''}keywords=${encodeURIComponent(keyword)}`);
    
    qString += hasDepth === 'yes' || hasDepth === 'no' ? `&hasDepth=${hasDepth}` : `&hasDepth=any`; 
    if(timeStart) qString += `&timeStart=${encodeURIComponent(timeStart)}`;
    if(timeEnd) qString += `&timeEnd=${encodeURIComponent(timeEnd)}`;
    if(latStart) qString += `&latStart=${encodeURIComponent(latStart)}`;
    if(latEnd) qString += `&latEnd=${encodeURIComponent(latEnd)}`;
    if(lonStart) qString += `&lonStart=${encodeURIComponent(lonStart)}`;
    if(lonEnd) qString += `&lonEnd=${encodeURIComponent(lonEnd)}`;
    return qString;
}
