/**
 * Created by C5217649 on 26.02.2016.
 */
"use strict";

class ChatGames {
    constructor(channel) {

        /**
         * @private
         */
        this._channel = channel;
        /**
         * @private
         */
        this._rawSettings = {};
        /**
         * @private
         */
        this._settings = {};
        /**
         * @private
         */
        this._games = {};

        this._loadSettings();
    }

    /**
     * loads game objects
     * @private
     */
    _loadGames() {
        let fs = require("fs");

        fs.readdir("./libs/channelsystems/ChatGames", (function(err, files) {
            files.forEach((function(file) {
                g_logger.bot.info("Load Game File " + file);
                let Game = require("./ChatGames/" + file);
                file = file.replace(".js", "");
                this._games[file] = new Game(this._channel, this, this._settings[file]);
            }).bind(this));
        }).bind(this));
    }

    /**
     * Load Settings
     * @private
     */
    _loadSettings() {
        let sql = "SELECT * FROM minigames WHERE channelID = :ID;";
        g_database.query(sql, {"ID": this._channel._ID}, (function (err, result) {
            if (!err) {
                if (result.length === 0) {
                    g_database.insert("minigames", {channelID: this._channel._ID}, (function () {
                        this._loadSettings();
                    }).bind(this));
                } else {
                    this._rawSettings = result[0];

                    for (let key in this._rawSettings) {
                        if (this._rawSettings.hasOwnProperty(key)) {
                            if (key !== "ID" && key !== "channelID") {
                                try {
                                    this._settings[key] = JSON.parse(this._rawSettings[key]);
                                } catch (e) {
                                    this._settings[key] = this._rawSettings[key];
                                }
                            }
                        }
                    }

                    this._loadGames();
                }
            }
        }).bind(this));
    }

    /* game getter */
    /**
     * @returns {Roulette}
     */
    get roulette() {
        return this._games.roulette;
    }
}
module.exports = ChatGames;