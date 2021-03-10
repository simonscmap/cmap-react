const setsFromList = (list, setKeys) => {
    // return an object literal where each value is a set containing the unique values for that key
    let result = {};

    setKeys.forEach(key => result[key] = new Set());

    list.forEach(item => {
        setKeys.forEach(key => {
            if(item[key]) result[key].add(item[key]);
        })
    });

    return result;
}

export default setsFromList;