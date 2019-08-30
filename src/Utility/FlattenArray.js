// Flattens an array by 1 level
// [[[],[]], [[],[]], [[],[]]] => [[], [], [], [], [], []]

const flattenArray = (arr) => {
    let flattenedArray = [];

    for(let i = 0; i < arr.length; i++){
        for(let j = 0; j < arr[i].length; j++){
            flattenedArray.push(arr[i][j]);
        }
    }

    return flattenedArray;
}

export default flattenArray;