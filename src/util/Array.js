/**
 * Selects and returns a random item from the given array.
 * @property {Array} array The array to select the random item from
 */
function randomItem (array) {
    return array[~~(array.length * Math.random())];
}

/**
 * 
 * @param {Array} arr Array to shorten
 * @param {Number} maxLen Max length to set the array to.
 * @author Dragonfire353
 */
function trimArray(arr, maxLen = 10) {
    if (arr.length > maxLen) {
        const len = arr.length - maxLen;
        arr = arr.slice(0, maxLen);
        arr.push(`${len} more...`);
    }
    return arr;
}

module.exports = {
    randomItem,
    trimArray
};