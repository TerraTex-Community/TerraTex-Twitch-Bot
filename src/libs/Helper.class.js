/**
 * Created by Colin on 26.12.2015.
 */
"use strict";

const crypto = require('crypto');

class Helper {
    static encrypt(text){
        const cipher = crypto.createCipher(g_configs.database.algorithm, g_configs.database.encryptPassword);
        let crypted = cipher.update(text,'utf8','base64');
        crypted += cipher.final('base64');
        return crypted;
    }

    static decrypt(text){
        const decipher = crypto.createDecipher(g_configs.database.algorithm, g_configs.database.encryptPassword);
        let dec = decipher.update(text,'base64','utf8');
        dec += decipher.final('utf8');
        return dec;
    }
    static get time() { return require("./Helper/Time.class.js"); }
    static get api() { return require("./Helper/API.class.js"); }


    /**
     *
     * @param {string|int} channel
     */
    static getChannelIdFromIdOrName(channel, callback) {
        let channelId = channel;
        if (!Number.isInteger(channel)) {
            if (isNaN(channel)) {
                g_database.getTable("channel", {channelName: channel}, (err, data) => {
                    if (err) {
                        throw err;
                    }

                    if (data.length !== 1) {
                        throw new Error("There is not a channel '" + channel + "' existing!");
                    }

                    callback(data[0].ID);
                })
            } else {
                channelId = parseInt(channel);
                callback(channelId);
            }
        } else {
            callback(channelId);
        }
    }
}

/**
 * additional prototypes
 */
String.prototype.replaceAll = function (find, replace) {
    const str = this;
    return str.split(find).join(replace);
};

module.exports = Helper;
