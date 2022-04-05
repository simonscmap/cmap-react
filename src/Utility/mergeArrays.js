const mergeArrays = (
  data,
  mergeTargetDistance,
  nextMergeStartDistance,
  numArraysPerMerge,
) => {
  let mergedArrays = [];

  let travelDistance = mergeTargetDistance * (numArraysPerMerge - 1);

  // Find each merge start point
  for (
    let i = 0;
    i + travelDistance < data.length;
    i += nextMergeStartDistance
  ) {
    let subArray = [];

    for (let j = i; j <= i + travelDistance; j += mergeTargetDistance) {
      subArray = [...subArray, ...data[j]];
    }

    mergedArrays.push(subArray);
  }

  return mergedArrays;
};

export default mergeArrays;
