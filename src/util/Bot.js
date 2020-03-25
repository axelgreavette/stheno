const { readdirSync, statSync } = require("fs");
const { join } = require("path");

/**
 * Humanizes the bot's uptime
 * @returns {object} An object containing a formatted time-string and a humanized time string
 */
function uptime() {
    let msec = Number(process.uptime().toFixed(0)) * 1000;
        days = Math.floor(msec / 1000 / 60 / 60 / 24);
        msec -= days * 1000 * 60 * 60 * 24;
        hours = Math.floor(msec / 1000 / 60 / 60);
        msec -= hours * 1000 * 60 * 60;
        mins = Math.floor(msec / 1000 / 60);
        msec -= mins * 1000 * 60;
        secs = Math.floor(msec / 1000);

    let timestr = {
        formatted: "",
        humanized: ""
    };

    if (days > 0) {
        timestr.humanized += days + " days ";
        timestr.formatted += days + "d ";
    }

    if (hours > 0) {
        timestr.humanized += hours + " hours ";
        timestr.formatted += hours + "h ";
    }

    if (mins > 0) {
        timestr.humanized += mins + " minutes ";
        timestr.formatted += mins + "m ";
    }

    if (secs > 0) {
         timestr.humanized += secs + " seconds";
         timestr.formatted += secs + "s ";
    }

     return timestr;
}

/**
 * Scrapes a supplied directory and returns recursive directories and files within.
 * @param {File Path} srcPath The directory to scrape.
 */
const getDirectories = srcPath => readdirSync(srcPath).filter(file => statSync(join(srcPath, file)).isDirectory());

/**
 * Converts a Discord snowflake to a valid timestamp.
 * @param {Snowflake} sf The snowflake
 */
const snowflake = sf => new Date((sf * Math.pow(2, -22)) + 1420070400000).toLocaleDateString();

module.exports = {
    uptime,
    getDirectories,
    snowflake
};