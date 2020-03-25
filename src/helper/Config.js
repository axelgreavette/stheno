const { parse } = require("toml");
const { existsSync, readFileSync } = require("fs");

class Config {
    constructor(filePath) {
        if(!existsSync(filePath)) throw new Error("That is not a valid config file path.");

        let results = parse(readFileSync(filePath));

        this.results = results;

        return results;
    }
}

module.exports = Config;