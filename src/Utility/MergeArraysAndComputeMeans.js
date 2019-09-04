// mergeTargetDistance - number of hops between arrays being merged
// mergeTargetNumber - number of arrays being merged - implicit
// nextStartDistance - once a merge is complete how many hops to next start
const mergeArraysAndComputeMeans = (data, mergeTargetDistance, nextMergeStartDistance, numArraysPerMerge) => {
    let mergedArrays = [];

    let travelDistance = mergeTargetDistance * (numArraysPerMerge - 1);
    
    // Find each merging start point
    for(let i = 0; i + travelDistance < data.length; i += nextMergeStartDistance){
        let subArray = [];

        // Iterate through each value in the first array of this merge. Count
        // the number of values summed so we can ignore nulls and compute a mean.
        for(let j = 0; j < data[i].length; j ++){
            let sum = 0;
            let count = 0;

            // Aggregate values of all merge targets
            for(let k = i; k < i + (mergeTargetDistance * numArraysPerMerge); k += mergeTargetDistance){
                if(data[k][j] !== null) {
                    sum += data[k][j];
                    count ++;
                };
            }
            subArray.push(count < 1 ? null : sum / (count));
        }

        mergedArrays.push(subArray)
    }

    return mergedArrays;
}

export default mergeArraysAndComputeMeans;