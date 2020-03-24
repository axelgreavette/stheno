function formatNumber(number) {
    return Number.parseFloat(number).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

module.exports = {
    formatNumber
}