/**
 * Created by C5217649 on 18.01.2016.
 */
"use strict";

class APIHelper {
    /**
     * Returns a list of all usernames in a chat channel of twitch.
     * @param {String} channel - Channelname
     * @param {Function} callback(error, userList) - Callbackfunction that will be called with the result.
     */
    static getChatUser(channel, callback) {
        if (g_bot._channelConnectors[channel]) {
            g_bot._channelConnectors[channel]._client.api({
                url: "https://tmi.twitch.tv/group/user/" + channel + "/chatters"
            }, (err, res, body) => {
                if (!err) {
                    callback(null, this._getUserArray(body));
                } else {
                    callback(err, null);
                }
            });
        } else {
            throw new Error(channel + " - not connected");
        }
    }

    /**
     * @param body
     * @private
     */
    static _getUserArray(body) {
        let users = [];
        if (body && body.chatter) {
            const chatter = body.chatter;
            users = users.concat(chatter.moderators).concat(chatter.staff).concat(chatter.admins).concat(chatter.global_mods);
            users = users.concat(chatter.viewers);
        }
        return users;
    }

    static isUserInChat(channel, username, callback) {
        this.getChatUser(channel, function (err, userList) {
            if (err) {
                callback(err, null);
            } else {
                username = username.toLowerCase();
                callback(null, userList.indexOf(username) !== -1);
            }
        });
    }

    static formatEmotes(text, emotes) {
        let splitText = text.split('');
        let i, j, mote;

        let returnEmpty = function () {
            return '';
        };

        for (i in emotes) {
            if (emotes.hasOwnProperty(i)) {
                let e = emotes[i];
                for (j in e) {
                    if (e.hasOwnProperty(j)) {
                        mote = e[j];
                        if (typeof mote === 'string') {
                            mote = mote.split('-');
                            mote = [parseInt(mote[0]), parseInt(mote[1])];
                            let length = mote[1] - mote[0];
                            let empty = Array.apply(null, [length + 1]).map(returnEmpty);
                            splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
                            splitText.splice(mote[0], 1, '<img class="emoticon" src="http://static-cdn.jtvnw.net/emoticons/v1/' + i + '/3.0">');
                        }
                    }
                }
            }
        }
        return splitText.join('');
    }
}

module.exports = APIHelper;

