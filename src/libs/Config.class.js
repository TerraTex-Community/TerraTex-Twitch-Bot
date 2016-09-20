/**
 * Created by C5217649 on 17.12.2015.
 */
"use strict";


let fs = require("fs");
/**
 *
 */
class Config {
    /**
     * Creates an read and setable object for Config files.
     * Will not update automatically while running.
     * @param {String} configName - Name of JsonFile (without .JSON)
     */
    constructor(configName) {
        if (fs.existsSync(__dirname + "/../configs/" + configName + ".json")) {
            this._config = JSON.parse(fs.readFileSync(__dirname + "/../configs/" + configName + ".json"));
            this._fileName = configName;

            //create getter
            for (let i in this._config) {
                if (this._config.hasOwnProperty(i)) {
                    Object.defineProperty(this, i, {
                        value: this._config[i]
                    });
                }
            }
        } else {
            throw "Config " + configName + " does not exist";
        }
    }

    save () {
        let code = JSON.stringify(this._config);
        fs.writeFileSync(__dirname + "/../configs/" + this._fileName + ".json", code);
    }
}

module.exports = Config;
