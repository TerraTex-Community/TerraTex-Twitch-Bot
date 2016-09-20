/**
 * Created by Colin on 26.12.2015.
 */
"use strict";

var crypto = require('crypto');

class Helper {
    static encrypt(text){
        var cipher = crypto.createCipher(g_configs.database.algorithm, g_configs.database.encryptPassword);
        var crypted = cipher.update(text,'utf8','base64');
        crypted += cipher.final('base64');
        return crypted;
    }

    static decrypt(text){
        var decipher = crypto.createDecipher(g_configs.database.algorithm, g_configs.database.encryptPassword);
        var dec = decipher.update(text,'base64','utf8');
        dec += decipher.final('utf8');
        return dec;
    }
    static get time() { return require("./Helper/Time.class.js"); }
    static get api() { return require("./Helper/API.class.js"); }
}

/**
 * additional prototypes
 */
String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.split(find).join(replace);
};

module.exports = Helper;