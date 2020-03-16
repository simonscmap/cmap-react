export default (infoObject) => {    
    const xRange = infoObject.lonMax - infoObject.lonMin;
    const yRange = infoObject.latMax - infoObject.latMin;
    const sizeRatio = xRange / yRange;

    let height = 40;
    let width = 40;

    if(isNaN(sizeRatio)){
        height = height / 1.65;
    } else if (sizeRatio > 1) {
        if(sizeRatio <= 1.5){
            width = width * sizeRatio;
            // height = sizeRatio > 2 ? height / 2 : height / sizeRatio;
        } else {
            width = width * 1.5;
            height = sizeRatio > 3 ? height / 1.65 : height * (1.8 / sizeRatio);
        }
    } else {
        width = sizeRatio < .5 ? width * .5 : width * sizeRatio;
    }

    return [height, width];
}