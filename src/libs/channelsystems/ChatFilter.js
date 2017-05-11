/**
 * Created by C5217649 on 09.03.2016.
 */
"use strict";

class ChatFilter {
    constructor(channel) {
        this._channel = channel;

        /**
         * List of Settings
         * @type {Object}
         * @property {int}  badWords - enabled/disabled
         * @property {int}  badWords_useDefaultList - enabled/disabled
         * @property {int}  badWords_useDefaultList_en - enabled/disabled
         * @property {int}  badWords_banTime - Duration of ban in minutes
         * @property {int}  badWords_banAfterTimes - How often has a bad Word to be send to get banned
         * @property {int}  badWords_resetCounterTime - Time in Minutes that resets the counter
         * @property {int}  adDomains - enabled/disabled
         * @property {int}  adIps - enabled/disabled
         * @property {[]}   adEclude  - JSON.parsed Array of IPs / Domains
         * @property {int}  adPermitTime - Duration of !permit in Minutes
         * @property {int}  adBanTime - Duration of Ban in Minutes
         * @property {int}  adBanAfterTimes - How often have a AD to be send to get banned
         * @property {int}  adResetCounterTime - Time in Minutes that resets the counter
         * @private
         */
        this._settings = {};
        this._rawSettings = {};
        this._filter = {};


        this._loadSettings();

    }

    setSettings(settings) {
        for (let key in settings) {
            if (settings.hasOwnProperty(key)) {
                this._settings[key] = settings[key];
            }
        }

        for (let key in this._filter) {
            if (this._filter.hasOwnProperty(key)) {
                this._filter[key].setSettings(this._settings);
            }
        }
    }

    /**
     * Load Settings
     * @private
     */
    _loadSettings() {
        let sql = "SELECT * FROM chatfilter WHERE channelID = :ID;";
        g_database.query(sql, {"ID": this._channel._ID}, (function (err, result) {
            if (!err) {
                if (result.length === 0) {
                    g_database.insert("chatfilter", {channelID: this._channel._ID}, (function () {
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

                    this._loadFilters();
                }
            }
        }).bind(this));
    }

    /**
     * @private
     */
    _loadFilters() {
        this._filter.badWords = new (require("./ChatFilter/badword.js"))(this);
        this._filter.advertising = new (require("./ChatFilter/advertising.js"))(this);
    }

}
module.exports = ChatFilter;
