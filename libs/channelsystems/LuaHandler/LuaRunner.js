/**
 * Created by geramy on 24.03.2016.
 */
"use strict";

class LuaRunner {

    /**
     *
     * @param {Channel} channel
     * @param {array} globalObject
     * @param {string|array} defaultScripts
     */
    constructor(channel, globalObject, defaultScripts) {
        this._channel = channel;
        var LuaVM = require('lua.vm.js');
        LuaVM.emscripten.print = (function(str) {
            this.writeChannelLog(str);
        }).bind(this);

        var l = new LuaVM.Lua.State();

        this._runner = l;

        if (globalObject) {
            let length = globalObject.length;
            for (let i = 0; i < length; i++) {
                l._G.set(globalObject[i].name, new (globalObject[i].class)(this));
            }
        }

        if (defaultScripts) {
            if (typeof defaultScripts === "string") {
                this._runner.execute(defaultScripts);
            } else {
                for (let i = 0; i < defaultScripts.length; i++) {
                    this._runner.execute(defaultScripts[i]);
                }
            }
        }
    }

    writeChannelLog(content) {
        let fs = require("fs");
        fs.appendFile("tmp/channelLogs/" + this._channel._channelName + ".log", content + "\n");
    }

    /**
     *
     * @param user
     * @param cmd
     * @param args
     * @param code
     */
    run(user, cmd, args, code) {
        this._cmd = cmd;
        this._args = args;
        this._user = user;

        try {
            this._runner.execute(code);
        } catch (e) {
            this.writeChannelLog("Error on executing Command " + cmd);
            this.writeChannelLog(e.lua_stack);
        }
    }
}
module.exports = LuaRunner;



