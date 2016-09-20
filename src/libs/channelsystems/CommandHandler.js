/**
 * Created by C5217649 on 14.01.2016.
 */
"use strict";
var path = require("path");

/**
 * CommandHandler Class
 */
class CommandHandler {

    /**
     * Creates a new CommandHandler.
     * @param channel
     */
    constructor(channel) {
        this._botData = {};
        g_twitchAPI.getUser(channel._botName, (function(err, result) {
            this._botData = result;
        }).bind(this));
        /**
         * Current Channel
         * @type {Channel}
         * @private
         */
        this._channel = channel;

        /**
         * List of registered Objects.
         * @type {Object.<String,Object>}
         * @private
         */
        this._registeredCommands = {};

        channel._client.on("chat", (function (chatChannel, user, message) {
            if (chatChannel === "#" + this._channel._channelName && message.startsWith("!")) {
                this.runCommand(user, message);
            }
        }).bind(this));

        this.registerNewCommand("commandlist", this.cmdCommandList.bind(this));
        this.registerNewCommand("cmdlist", this.cmdCommandList.bind(this));

        this._aliases = {};
        //load aliases
        g_database.getTable("cmds_aliases", {channelID: channel._ID}, (function (err, result) {
            if (!err) {
                for (let i = 0; i < result.length; i++) {
                    this._aliases[result[i].command] = result[i].aliasOf;
                    this.registerNewCommand(result[i].command, this.executeAlias.bind(this), "user");
                }
            }
        }).bind(this));
    }

    /**
     * @param user
     */
    executeAlias(user, cmd){
        for (var _len = arguments.length, message = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
            message[_key - 2] = arguments[_key];
        }

        let sendedMessage = message.join(' ');
        sendedMessage = "!" + this._aliases[cmd] + sendedMessage;

        this.runCommand(user, sendedMessage);
    }

    /**
     * @param cmd
     * @param aliasOf
     */
    addAlias(cmd, aliasOf) {
        this._aliases[cmd] = aliasOf;
        this.registerNewCommand(cmd, this.executeAlias.bind(this), "user");
    }

    /**
     * @param cmd
     */
    removeAlias(cmd) {
        delete this._aliases[cmd];
        this.removeCommand(cmd);
    }

    cmdCommandList() {
        let message = "Hier gehts zur Commandliste: ";
        message += "https://twitch.terratex.eu/";
        message += "cmdlist?channel=";
        message += this._channel._channelName;

        this._channel._client.say(this._channel._channelName, message);
    }

    /**
     * This Function checks if there is a Command registered with the name of cmd.
     * @param {String} cmd - Name of the command.
     * @returns {boolean} - Returns true if it is registered otherwise false.
     */
    isCommandRegistered(cmd) {
        return !!this._registeredCommands[cmd];
    }

    runCommandByBot(message) {
        let user = {
            color: null,
            'display-name': this._botData.display_name,
            emotes: null,
            mod: true,
            'room-id': null,
            subscriber: false,
            turbo: false,
            'user-id': this._botData._id,
            'user-type': 'mod',
            'emotes-raw': null,
            username: this._botData.name,
            'message-type': 'chat' };

        this.runCommand(user, message);
    }
    /**
     * This Function will be executed each time when a command was send.
     *
     * @param {Object} user    - User that executes the Command.
     * @param {String} message - Message that was sended.
     */
    runCommand(user, message) {
        message = message.replace("!", "");
        let commandParams = message.split(" ");
        let cmd = commandParams[0].toLowerCase();

        if (this.isCommandRegistered(cmd)) {
            let commandObject = this._registeredCommands[cmd];
            let hasAccess = false;

            // Check if the User has Access.
            switch (commandObject.accessLevel) {
                // if the user should be a streamer
                case "streamer":
                    if (user.username === this._channel._channelName) {
                        hasAccess = true;
                    }
                    break;
                // if the user should be a mod
                case "mod":
                    if (user["user-type"] === "mod" || user.username === this._channel._channelName) {
                        hasAccess = true;
                    }
                    break;
                // if the user can be any usertype
                default:
                    hasAccess = true;
                    break;
            }

            if (hasAccess) {
                commandParams.unshift(user);
                commandObject.callback.apply(null, commandParams);
            }
        }
    }

    /**
     * This function registers a command for execution.
     * @param {String}      cmd                 - The name of the command.
     * @param {Function}    callback            - Callback Function that will be executed if the command is typed in the chat.
     * @param {String}      [accessLevel=user]  - Level of Access: "user", "mod", "streamer"
     *
     * @return {Boolean} - Returns true if success, false otherwise.
     */
    registerNewCommand(cmd, callback, accessLevel) {
        cmd = cmd.toLowerCase();
        accessLevel = accessLevel || "user";
        accessLevel = accessLevel.toLowerCase();
        if (!this.isCommandRegistered(cmd)) {
            if (accessLevel !== "user" && accessLevel !== "mod" && accessLevel !== "streamer") {
                throw new Error("Unknown Command Access Level " + accessLevel);
            }
            this._registeredCommands[cmd] = {
                callback: callback,
                accessLevel: accessLevel,
                cmd: cmd
            };

            return true;
        } else {
            return false;
        }
    }

    removeCommand(cmd) {
        cmd = cmd.toLowerCase();
        if (this.isCommandRegistered(cmd)) {
            delete this._registeredCommands[cmd];
        }
    }


    // static functions
    /**
     *
     * @param channelName
     * @param command
     * @param callback
     */
    static commandExsitsOnChannel(channelName, command, callback) {
        CommandHandler.getAllCommandsOfChannel(channelName, true, true, true, function(err, commandObjects){
            if (err) {
                callback(err);
            } else {
                for (let i = 0; i < commandObjects.length; i++) {
                    if (commandObjects[i].command === command) {
                        callback(null, true);
                        return;
                    }
                }
                callback(null, false);
            }
        });
    }

    /**
     * @typedef {Object} commandListObject
     * @property {string} command - Commandname
     * @property {string} description - Command description
     * @property {string} params - Command paramDescription (Commandname with params)
     * @property {string} type - Type of Command, can be: "cmd","scmd","alias","system"
     * @property {string|null} permission - Permission if not alias: "user"|"mod"|"streamer"
     * @property {string|null} aliasOf - If it is an alias: name of command that is called by that alias
     */
    /**
     * @callback callback_func_gacoc
     * @param {Object|null} error - ErrorObject
     * @param {Array.<commandListObject>|null} commandObjects - Array with CommandObjects
     */
    /**
     * Get All Commands of a spezified Channel
     * @param {String} channelName - Name of the channel (without #)
     * @param {bool} [includeAliasCommands=false] - List also Alias Commands
     * @param {bool} [includeSystemCommands=false] - List also System Commands like Gamecommands or Points
     * @param {bool} [includeAdminCommands=false] - List also Admincommands starting with !admin
     * @param {callback_func_gacoc} callback - Function that is called with the result
     */
    static getAllCommandsOfChannel(channelName, includeAliasCommands, includeSystemCommands, includeAdminCommands, callback) {
        if (callback === undefined) {
            if (includeAdminCommands !== undefined) {
                if (typeof includeAdminCommands === "function")  {
                    callback = includeAdminCommands;
                    includeAdminCommands = false;
                } else {
                    callback = null;
                }
            } else {
                if (includeSystemCommands !== undefined) {
                    if (typeof includeSystemCommands === "function")  {
                        callback = includeSystemCommands;
                        includeAdminCommands = false;
                        includeSystemCommands = false;
                    } else {
                        callback = null;
                        includeAdminCommands = false;
                    }
                } else {
                    if (includeAliasCommands !== undefined) {
                        if (typeof includeAliasCommands === "function")  {
                            callback = includeAliasCommands;
                            includeAdminCommands = false;
                            includeSystemCommands = false;
                            includeAliasCommands = false;
                        } else {
                            callback = null;
                            includeAdminCommands = false;
                            includeSystemCommands = false;
                        }
                    } else {
                        callback = null;
                        includeAdminCommands = false;
                        includeSystemCommands = false;
                        includeAliasCommands = false;
                    }
                }
            }
        }


        let complete = [];
        let steps = 0;
        let allSteps = 4;

        if (!includeAliasCommands) {
            allSteps--;
        }
        if (!includeSystemCommands) {
            allSteps--;
        }
        if (!includeAdminCommands) {
            allSteps--;
        }

        //get Scripted Commands of channel
        CommandHandler.getScriptedCommands(channelName, function (error, commandObjects) {
            if (error) {
                callback(error);
                steps = -allSteps;
            } else {
                complete = complete.concat(commandObjects);
                steps++;

                if (steps === allSteps) {
                    callback(error, complete);
                }
            }
        });

        //get Alias Commands of Channel
        if (includeAliasCommands) {
            CommandHandler.getAliasCommands(channelName, function (error, commandObjects) {
                if (error) {
                    callback(error);
                    steps = -allSteps;
                } else {
                    complete = complete.concat(commandObjects);
                    steps++;

                    if (steps === allSteps) {
                        callback(error, complete);
                    }
                }
            });
        }

        //get Admin Commands
        if (includeAdminCommands) {
            CommandHandler.getAdminCommands(channelName, function (error, commandObjects) {

                if (error) {
                    callback(error);
                    steps = -allSteps;
                } else {
                    complete = complete.concat(commandObjects);
                    steps++;

                    if (steps === allSteps) {
                        callback(error, complete);
                    }
                }
            });
        }
        //get System Commands

        if (includeSystemCommands) {
            CommandHandler.getSystemCommands(channelName, function (error, commandObjects) {

                if (error) {
                    callback(error);
                    steps = -allSteps;
                } else {
                    complete = complete.concat(commandObjects);
                    steps++;

                    if (steps === allSteps) {
                        callback(error, complete);
                    }
                }
            });
        }
    }

    /**
     * Returns List of System Commands
     * @param {string} channelName
     * @param {callback_func_gacoc} callback
     */
    static getSystemCommands(channelName, callback) {

        let commands = [];
        let fs = require("fs");
        let sCmdSteps = 2;
        let counter = 0;

        // Build Query
        let query = "SELECT max(quote_enabled) AS quote_enabled, max(viewer_points_enabled) AS viewer_points_enabled, " +
            "max(viewer_ranks_enabled) AS viewer_ranks_enabled, max(roulette) AS roulette" +
            " FROM( ( SELECT enabled AS quote_enabled, NULL AS viewer_points_enabled," +
            " NULL AS viewer_ranks_enabled, NULL AS roulette, 1 AS groupbycolumn FROM quotes_settings" +
            " WHERE channelID IN (SELECT ID FROM channel WHERE channelName = :channelName)) UNION ALL" +
            " ( SELECT NULL, pointsEnabled, NULL, NULL, 1 FROM viewer_points_configs WHERE channelID" +
            " IN (SELECT ID FROM channel WHERE channelName = :channelName) ) UNION ALL ( SELECT NULL," +
            " NULL, enabled, NULL, 1 FROM viewer_ranks_configs WHERE channelID IN (SELECT ID FROM channel" +
            " WHERE channelName = :channelName) ) UNION ALL ( SELECT NULL, NULL, NULL, roulette, 1 FROM minigames" +
            " WHERE channelID IN (SELECT ID FROM channel WHERE channelName = :channelName) ) )" +
            " AS RESULT GROUP BY groupbycolumn";

        g_database.query(query, {channelName: channelName}, function(initErr, dbresult) {

            if (!initErr) {
                //check if roulette is active
                //check if levelsystem is active
                //check if pointssystem is active
                //check if quotesystem is active
                //check if viewersystem is active

                dbresult[0].roulette = JSON.parse(dbresult[0].roulette);
                if (dbresult[0].roulette.active) {
                    sCmdSteps++;
                }
                if ( dbresult[0].quote_enabled === 1) {
                    sCmdSteps++;
                }
                if ( dbresult[0].viewer_points_enabled === 1) {
                    sCmdSteps++;
                }
                if ( dbresult[0].viewer_ranks_enabled === 1) {
                    sCmdSteps++;
                }

                let path = require("path");

                fs.readFile(path.resolve(__dirname, "..", "..", "configs", "commandlists", "de", "general.json"), function (err, list) {
                    if (err) {
                        callback(err);
                        counter = -sCmdSteps;
                    } else {
                        commands = commands.concat(JSON.parse(list.toString()));
                        counter++;

                        if (counter === sCmdSteps) {
                            callback(err, commands);
                        }
                    }
                });

                fs.readFile(path.resolve(__dirname, "..", "..", "configs", "commandlists", "de", "viewersystem.json"), function (err, list) {
                    if (err) {
                        callback(err);
                        counter = -sCmdSteps;
                    } else {
                        commands = commands.concat(JSON.parse(list.toString()));
                        counter++;

                        if (counter === sCmdSteps) {
                            callback(err, commands);
                        }
                    }
                });
                if (dbresult[0].roulette.active) {
                    fs.readFile(path.resolve(__dirname, "..", "..", "configs", "commandlists", "de", "roulette.json"), function (err, list) {
                        if (err) {
                            callback(err);
                            counter = -sCmdSteps;
                        } else {
                            commands = commands.concat(JSON.parse(list.toString()));
                            counter++;

                            if (counter === sCmdSteps) {
                                callback(err, commands);
                            }
                        }
                    });
                }
                if (dbresult[0].viewer_ranks_enabled === 1) {
                    fs.readFile(path.resolve(__dirname, "..", "..", "configs", "commandlists", "de", "levelsystem.json"), function (err, list) {
                        if (err) {
                            callback(err);
                            counter = -sCmdSteps;
                        } else {
                            commands = commands.concat(JSON.parse(list.toString()));
                            counter++;

                            if (counter === sCmdSteps) {
                                callback(err, commands);
                            }
                        }
                    });
                }
                if (dbresult[0].viewer_points_enabled === 1) {
                    fs.readFile(path.resolve(__dirname, "..", "..", "configs", "commandlists", "de", "pointsystem.json"), function (err, list) {
                        if (err) {
                            callback(err);
                            counter = -sCmdSteps;
                        } else {
                            let pquery = "SELECT pointsGiveOnlyMods FROM viewer_points_configs WHERE channelID IN (" +
                                "SELECT ID FROM channel WHERE channelName = :channelName )";
                            g_database.query(pquery, {channelName: channelName}, function (pErr, presult) {
                                if (!pErr) {
                                    let data = JSON.parse(list.toString());
                                    if (presult[0].pointsGiveOnlyMods === 1) {
                                        for (let key in data) {
                                            if (data.hasOwnProperty(key)) {
                                                if (data[key].command === "givepoints") {
                                                    data[key].permission = "mod";
                                                }
                                            }
                                        }
                                    }

                                    commands = commands.concat(data);
                                    counter++;

                                    if (counter === sCmdSteps) {
                                        callback(err, commands);
                                    }
                                } else {
                                    callback(pErr);
                                    counter = -sCmdSteps;
                                }
                            });
                        }
                    });
                }
                if (dbresult[0].quote_enabled === 1) {
                    fs.readFile(path.resolve(__dirname, "..", "..", "configs", "commandlists", "de", "quotesystem.json"), function (err, list) {
                        if (err) {
                            callback(err);
                            counter = -sCmdSteps;
                        } else {
                            commands = commands.concat(JSON.parse(list.toString()));
                            counter++;

                            if (counter === sCmdSteps) {
                                callback(err, commands);
                            }
                        }
                    });
                }
            } else {
                callback(initErr);
            }

        });
    }

    /**
     * Returns List of Admin Commands
     * @param {string} channelName
     * @param {callback_func_gacoc} callback
     * @todo implement
     */
    static getAdminCommands(channelName, callback) {
        callback(null,[]);
    }

    /**
     * Returns List of Alias Commands
     * @param {string} channelName
     * @param {callback_func_gacoc} callback
     */
    static getAliasCommands(channelName, callback) {
        g_database.query("SELECT command FROM cmds_aliases WHERE channelID IN (SELECT ID FROM channel WHERE channelName = :channelName)", {
            "channelName": channelName
        }, function(err, result) {
            if (err) {
                callback(err);
            } else {
                let objectiveArray = [];
                let object;
                /**
                 * @type {commandListObject}
                 */
                let newObject;
                for (let i = 0; i < result.length; i++) {
                    object = result[i];
                    newObject = {
                        command: object.command,
                        description: null,
                        permission: null,
                        params: null,
                        aliasOf: object.aliasOf,
                        type: "alias"
                    };
                    objectiveArray.push(newObject);
                }
                callback(null, objectiveArray);
            }
        });
    }

    /**
     * Returns List of Scripted Commands
     * @param {string} channelName
     * @param {callback_func_gacoc} callback
     */
    static getScriptedCommands(channelName, callback) {
        let query = "SELECT command, restrictedTo, description FROM cmds_scripted WHERE channelID IN (SELECT ID FROM channel WHERE channelName = :channelName)";
        g_database.query(query, {
            "channelName": channelName
        }, function(err, result) {
            if (err) {
                callback(err);
            } else {
                let objectiveArray = [];
                let object;
                /**
                 * @type {commandListObject}
                 */
                let newObject;
                for (let i = 0; i < result.length; i++) {
                    object = result[i];
                    newObject = {
                        command: object.command,
                        description: object.description,
                        permission: object.restrictedTo.toLowerCase(),
                        params:object.paramDescription,
                        aliasOf: null,
                        type: "scmd"
                    };
                    objectiveArray.push(newObject);
                }
                callback(null, objectiveArray);
            }
        });
    }

}
module.exports = CommandHandler;