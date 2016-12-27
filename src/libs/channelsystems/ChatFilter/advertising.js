/**
 * Created by C5217649 on 09.03.2016.
 */
"use strict";

class Advertising {
    constructor(chatFilter) {
        this._chatFilter = chatFilter;

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
        this._badUsers = {};
        this._permited = {};

        this._chatFilter._channel._client.on("chat", this._checkAdvertising.bind(this));

        this._chatFilter._channel.command.registerNewCommand("permit", this.cmdPermit.bind(this), "mod");
    }

    cmdPermit(user, cmd, toUser) {
        if (!toUser) {
            this._chatFilter._channel._client.say(this._chatFilter._channel._channelName, "Syntax: !permit [username]");
            return;
        }

        g_helper.api.isUserInChat(this._chatFilter._channel._channelName, toUser, (function (err, isUserOnline) {
            if (!isUserOnline) {
                this._chatFilter._channel._client.say(
                    this._chatFilter._channel._channelName,
                    this._chatFilter._channel.text.get("chatfilter.permit_not_in_chat", {
                        fromUser: user["display-name"] || user.username,
                        toUser: toUser
                    })
                );
            } else {
                this._permited[toUser.toLowerCase()] = (new Date()).getTime();
                this._chatFilter._channel._client.say(
                    this._chatFilter._channel._channelName,
                    this._chatFilter._channel.text.get("chatfilter.permit", {
                        fromUser: user["display-name"] || user.username,
                        toUser: toUser
                    })
                );
            }
        }).bind(this));
    }

    _checkAdvertising(channel, user, message) {
        let date = (new Date()).getTime();
        if (!(user["user-type"] === "mod" || user.username === this._chatFilter._channel._channelName)) {

            if (this._permited.hasOwnProperty(user.username)) {
                if (this._permited[user.username] > (date - (this._settings.adPermitTime * 60000))) {
                    return;
                }
            }

            let found = false;
            if (this._settings.adIps === 1) {
                let ipConf = g_configs.advertising.ipadress;
                let regex = new RegExp(ipConf.regex, "ig");

                let m;
                while ((m = regex.exec(message)) !== null) {
                    if (m.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                    if (this._settings.adExclude.indexOf(m[0]) === -1) {
                        console.info("Found Advertising: " + m[0] + " in " + message);
                        found = true;
                    }
                }
            }

            if (this._settings.adDomains === 1) {
                let domainConf = g_configs.advertising.domains;

                let regex = new RegExp(domainConf.regex.replace("{tlds}", domainConf.tlds.join("|")), "ig");
                let excludeExpression = new RegExp("(" + this._settings.adExclude.join("|") + ")", "i");
                let m;
                while ((m = regex.exec(message)) !== null) {
                    if (m.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                    if (m[0].search(excludeExpression) === -1) {
                        if (this._settings.adExclude.indexOf(m[0]) === -1) {
                            found = true;
                            console.info("Found Advertising: " + m[0] + " in " + message);
                        }
                    }
                }
            }
            if (found) {
                if (this._badUsers.hasOwnProperty(user.username)) {
                    let count = this._badUsers[user.username].count;
                    if (this._badUsers[user.username].lastDetect < date - (this._settings.adResetCounterTime * 60000)) {
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
                if (this._settings.adBanAfterTimes <= this._badUsers[user.username].count) {
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
                    this._chatFilter._channel.text.get("chatfilter.advertising_ban", {
                        fromUser: user["display-name"] || user.username
                    })
                );
            }
        }
    }


    setSettings(settings) {
        this._settings = settings;
    }

    setExclude(exclude) {
        this._settings.adExclude = exclude;
    }
}

module.exports = Advertising;