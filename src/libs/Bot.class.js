/**
 * Created by Colin on 26.12.2015.
 */
"use strict";

const irc = require("tmi.js");
const Channel = require("./Channel.class.js");

/**
 * @property {Object.<String, Channel>} _channelConnectors
 */
class Bot {
    constructor() {
        //declare vars
        this._channelConnectors = {};
    }

    createNewChannel(channelName, customLoginData, connectMessage) {
        if (connectMessage === null || typeof connectMessage === "undefined") {
            connectMessage = 1;
        }
        console.info("create new Channel: " + channelName);

        let user = g_configs.twitch.irc.login;
        let password = g_configs.twitch.irc.password;

        if (customLoginData) {
            let login = JSON.parse(g_helper.decrypt(customLoginData));
            user = login.login;
            password = login.password;
        }

        const options = {
            options: {
                debug: true
            },
            connection: {
                // cluster: "aws",
                reconnect: true
            },
            identity: {
                username: user,
                password: password
            },
            channels: ["#" + channelName]
        };

        const client = new irc.client(options);

        let firstConnection = true;
        client.on("connected", (function () {
            if (firstConnection) {
                this._channelConnectors[channelName] = new Channel(channelName, client, user, connectMessage);
                firstConnection = false;
            }
        }).bind(this));

        client.on("logon", function () {
            console.info("#" + channelName + " logon event");
        });

        client.on('error', (err) => {
            console.error("clienterror", err);
        });

        // Connect the client to the server..
        client.connect().catch(err => {
            if (err === "Login authentication failed") {
                this._removeChannelAuthentication(channelName);
            } else {
                console.error("#" + channelName + " connection error: ", err);
            }
        });
    }

    _removeChannelAuthentication(channelName) {
        console.info("#" + channelName + " Authentication failed: Channel has been removed from startup");
        if (this._channelConnectors[channelName]) {
            delete this._channelConnectors[channelName];
        }
        g_database.update("channel", {connected: 0, customLoginData: null}, {channelName: channelName}, err => {
            if (err) {
                console.error(err);
            }
        });
    }

    createOnlineChannelsOnStartUp() {
        g_database.getTable("channel", {connected: 1}, (function (err, result) {
            if (!err) {
                let length = result.length;
                for (let i = 0; i < length; i++) {
                    console.info("Connect Channel " + result[i].channelName + " on StartUp");
                    this.createNewChannel(result[i].channelName, result[i].customLoginData, result[i].connectMessage);
                    if (process.env.NODE_ENV === 'development') {
                        break;
                    }
                }
            }
        }).bind(this));
    }

    /**
     * Creates All nessesary Entries for a new Channel in the Database.
     * @param {String} channelName
     * @param {String} email
     * @param {Boolean} partnered
     * @param {function} callback
     */
    createChannelEntries(channelName, email, partnered, callback) {
        g_database.exist("channel", {channelName: channelName}, (dbExistErr, exist) => {
            if (dbExistErr) {
                callback(dbExistErr);
            } else {
                if (!exist) {
                    // create channel entry here
                    g_database.insert("channel", {
                        channelName: channelName,
                        email: email,
                        partnered: partnered
                    }, (dbInsertErr, insertId) => {
                        if (dbInsertErr) {
                            callback(dbInsertErr);
                        } else {
                            //create all other tables here from json
                            this._executeTableInserts(insertId, callback);
                        }
                    });
                } else {
                    callback(null, null);
                }
            }
        });
    }

    /**
     * @param insertId
     * @param callback
     * @private
     */
    _executeTableInserts(insertId, callback) {
        const tablesToInsert = g_configs.database.channelTables;

        let todo = tablesToInsert.length;
        for (let i = 0; i < tablesToInsert.length; i++) {
            g_database.insert(tablesToInsert[i], {channelID: insertId}, function (err) {
                if (!err) {
                    todo--;
                    if (todo === 0) {
                        callback(null, insertId);
                    }
                } else {
                    if (todo > 0) {
                        callback(err);
                        todo = 0;
                    }
                }
            });
        }
    }

    checkTableEntries(channelID, callback) {
        g_database.exist("channel", {ID: channelID}, (dbExistErr, exist) => {
            if (dbExistErr) {
                callback(dbExistErr);
            } else {
                if (exist) {
                    //create all other tables here from json
                    let tablesToInsert = g_configs.database.channelTables;

                    let todo = tablesToInsert.length;
                    for (let i = 0; i < tablesToInsert.length; i++) {
                        g_database.exist(tablesToInsert[i], {channelID: channelID}, (checkTableExistErr, entryExist) => {
                            if (!checkTableExistErr) {
                                if (!entryExist) {
                                    g_database.insert(tablesToInsert[i], {channelID: channelID}, err => {
                                        if (!err) {
                                            todo--;
                                            if (todo === 0) {
                                                callback(null);
                                            }
                                        } else {
                                            if (todo > 0) {
                                                callback(err);
                                                todo = 0;
                                            }
                                        }
                                    });
                                } else {
                                    todo--;
                                    if (todo === 0) {
                                        callback(null);
                                    }
                                }
                            } else {
                                if (todo > 0) {
                                    callback(checkTableExistErr);
                                    todo = 0;
                                }
                            }
                        });
                    }
                } else {
                    callback(new Error("Channel does not exist."));
                }
            }
        });
    }
}
module.exports = Bot;
