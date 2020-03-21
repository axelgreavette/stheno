/**
 * Selects and returns a random item from the given array.
 * @property {Array} array The array to select the random item from
 */
function randomItem (array) {
    return array[~~(array.length * Math.random())];
}

module.exports = {
    randomItem
}