/**
 * Created by C5217649 on 09.03.2016.
 */
"use strict";

class BadWord {
    constructor(chatFilter) {
        this._chatFilter = chatFilter;

        this._chatFilter._channel._client.on("chat", this._checkChatMessage.bind(this));


        /**
         * List of Settings
         * @type {Object}
         * @property {int}  badWords - enabled/disabled
         * @property {int}  badWords_useDefaultList - enabled/disabled
         * @property {int}  badWords_useDefaultList - enabled/disabled
         * @property {int}  badWords_banTime - Duration of ban in minutes
         * @property {int}  badWords_banAfterTimes - How often has a bad Word to be send to get banned
         * @property {int}  badWords_resetCounterTime - Time in Minutes that resets the counter
         * @property {int}  adDomains - enabled/disabled
         * @property {int}  adIps - enabled/disabled
         * @property {[]}   adExclude  - JSON.parsed Array of IPs/Domains
         * @property {int}  adPermitTime - Duration of !permit in Minutes
         * @property {int}  adBanTime - Duration of Ban in Minutes
         * @property {int}  adBanAfterTimes - How often have a AD to be send to get banned
         * @property {int}  adResetCounterTime - Time in Minutes that resets the counter
         * @private
         */
        this._settings = this._chatFilter._settings;
        this._badWords = [];
        this._badUsers = {};

        this._loadBadWords();
    }

    /**
     * @private
     */
    _loadBadWords() {
        g_database.getTable("chatfilter_custom_badwords", {channelID: this._chatFilter._channel._ID}, (function (err, result) {
            if (!err && result.length > 0) {
                this._badWords = result;
            }
        }).bind(this));
    }

    setSettings(settings) {
        this._settings = settings;
    }

    reloadBadWords() {
        this._badWords = [];
        this._loadBadWords();
    }

    /**
     *
     * @param channel
     * @param user
     * @param message
     * @private
     */
    _checkChatMessage(channel, user, message) {
        if (this._settings.badWords === 1) {
            if (!(user["user-type"] === "mod" || user.username === this._chatFilter._channel._channelName)) {
                //not mod

                let fullFilter = [];
                fullFilter = fullFilter.concat(this._badWords);

                if (this._settings.badWords_useDefaultList) {
                    fullFilter = fullFilter.concat(g_configs.badWord.badwords);
                }

                if (this._settings.badWords_useDefaultList_en) {
                    fullFilter = fullFilter.concat(g_configs.badWordEn.badwords);
                }

                let found = false;

                for (let c = 0; c < fullFilter.length; c++) {
                    let regex = new RegExp(fullFilter[c].regex, "i");
                    if (message.search(regex) !== -1) {
                        found = true;

                        console.info("Found BadWord: " + fullFilter[c].description + " in " + message);
                        break;
                    }
                }

                if (found) {
                    let date = (new Date()).getTime();
                    if (this._badUsers.hasOwnProperty(user.username)) {
                        let count = this._badUsers[user.username].count;
                        if (this._badUsers[user.username].lastDetect < date - (this._settings.badWords_resetCounterTime * 60000)) {
                            count = 0;
                        }
                        count++;
                        this._badUsers[user.username] = {
                            count: count,
                            lastDetect: date
                        };

                    } else {
                        this._badUsers[user.username] = {
                            count: 1,
                            lastDetect: date
                        };
                    }

                    let timeOut = 1;
                    if (this._settings.badWords_banAfterTimes <= this._badUsers[user.username].count) {
                        timeOut = this._settings.badWords_banTime * 60;
                    }

                    if (timeOut < 0) {
                        this._chatFilter._channel._client.ban(
                            this._chatFilter._channel._channelName,
                            user.username
                        );
                    } else {
                        this._chatFilter._channel._client.timeout(
                            this._chatFilter._channel._channelName,
                            user.username,
                            timeOut
                        );
                    }

                    this._chatFilter._channel._client.say(
                        this._chatFilter._channel._channelName,
                        this._chatFilter._channel.text.get("chatfilter.badword_ban", {
                            fromUser: user["display-name"] || user.username
                        })
                    );
                }
            }
        }
    }
}
module.exports = BadWord;
