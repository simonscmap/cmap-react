export default (infoObject) => {

    let lonRange = infoObject.lonMax - infoObject.lonMin;

    let sectionSize;
    if(lonRange < 2){
        sectionSize = (lonRange / 6).toFixed(2);
    } else {
        sectionSize = Math.floor(lonRange / 6);
    }

    let tickvals = Array.from(Array(5), (e, i) => Math.ceil(infoObject.lonMin + ((i + 1) * sectionSize)));
    let ticktext = tickvals.map(e => e > 180 ? e - 360 : e);

    return {
        tickmode: 'array',
        tickvals,
        ticktext
    }
}