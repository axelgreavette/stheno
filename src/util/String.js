/**
 * Cuts off the end of a text block to shorten it to the length supplied to maxLen
 * @param {String} text 
 * @param {Integer}} maxLen 
 */
function shorten(text, maxLen = 2000) {
    return text.length > maxLen ? `${text.substr(0,maxLen-3)}...` : text;
}

/**
 * Capitalizes the first letter of a string
 * @param {String} toReplace The string to capitalize
 */
capitalize = toReplace => toReplace.replace(/^\w/, c => c.toUpperCase());

module.exports = {
    shorten,
    capitalize
};