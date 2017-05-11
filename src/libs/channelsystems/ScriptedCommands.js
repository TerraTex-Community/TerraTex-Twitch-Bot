/**
 * Created by C5217649 on 21.03.2016.
 */
"use strict";
const path = require("path");

class ScriptedCommands {
    constructor(channel) {
        this._channel = channel;

        this._globalObject = [];

        let fs = require("fs");

        fs.readdir(path.resolve(__dirname, "LuaHandler"), (function (err, files) {
            files.forEach((function (file) {
                if (file !== "LuaRunner.js") {
                    let fileInfo = file.split(".");
                    let tmp = require("./LuaHandler/" + file);
                    this._globalObject.push({class: tmp, name: fileInfo[0]});
                }
            }).bind(this));
        }).bind(this));

        this._defaultScripts = [];

        fs.readdir(path.resolve(__root, "lua", "defaults"), (function (err, files) {
            files.forEach((function (file) {
                fs.readFile(path.resolve(__root, "lua", "defaults", file), (function (fileErr, content) {
                    if (!err) {
                        this._defaultScripts.push(content.toString());
                    } else {
                        throw new Error(err);
                    }
                }).bind(this));
            }).bind(this));
        }).bind(this));


        this._commands = {};
        this._loadCommands();
    }

    setCommandSave(cmd, data) {
        this._commands[cmd].save = data;

        g_database.update("cmds_scripted", {save: JSON.stringify(data)}, {
            channelID: this._channel._ID,
            command: cmd.toLowerCase()
        });
    }

    /**
     * Loads all scriptable commands from database
     * @private
     */
    _loadCommands() {
        g_database.getTable("cmds_scripted", {channelID: this._channel._ID}, (function (err, result) {
            if (!err) {
                let length = result.length;
                let cmd, bool;
                for (let i = 0; i < length; i++) {
                    cmd = result[i];
                    bool = this._channel.command.registerNewCommand(cmd.command.toLowerCase(), this._runCommand.bind(this), cmd.restrictedTo);
                    if (!bool) {
                        this._runner.writeChannelLog("CommandHandler.Error: Command '" + cmd.command + "' already used and cannot registered.");
                    } else {
                        try {
                            result[i].save = JSON.parse(result[i].save);
                        } catch (e) {
                            console.error("scripted commands l71: ", e);
                        }
                        this._commands[cmd.command.toLowerCase()] = result[i];
                    }
                }
            }
        }).bind(this));
    }

    /**
     *
     * @param user
     * @param cmd
     * @param args
     * @private
     */
    _runCommand(user, cmd, ...args) {
        let runner = new (require("./LuaHandler/LuaRunner"))(this._channel, this._globalObject, this._defaultScripts);
        runner.run(user, cmd.toLowerCase(), args, this._commands[cmd.toLowerCase()].code);
    }

    /**
     * remove Command
     * @param {String} cmd - Command
     * @param {function} [callback] - Function called after
     */
    removeCommand(cmd, callback) {
        if (this._commands.hasOwnProperty(cmd.toLowerCase())) {
            delete this._commands[cmd.toLowerCase()];
            this._channel.command.removeCommand(cmd);
            if (callback) {
                callback();
            }
        } else {
            if (callback) {
                callback();
            }
        }
    }

    /**
     * changes or adds a new command
     * @param {String} cmd - CMD
     * @param {Object} options -Options
     * @param {String} options.restrictedTo
     * @param {String} options.command
     * @param {String} options.code
     * @param {String} options.save
     */
    addOrReloadCommand(cmd, options) {
        this.removeCommand(cmd.toLowerCase(), (function () {
            let bool = this._channel.command.registerNewCommand(cmd.toLowerCase(), this._runCommand.bind(this), options.restrictedTo);
            if (!bool) {
                this._runner.writeChannelLog("CommandHandler.Error: Command '" + cmd + "' already used and cannot registered.");
            } else {
                this._commands[cmd.toLowerCase()] = options;
            }
        }).bind(this));
    }

}

module.exports = ScriptedCommands;
