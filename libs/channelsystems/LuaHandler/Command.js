/**
 * Created by geramy on 24.03.2016.
 */
"use strict";

class LuaCommand {
    constructor(runner) {
        this._channel = runner._channel;
        this._runner = runner;

    }

    get parameter() {
        return this._runner._args.join(" ");
    }

    get parameterArray() {
        return this._runner._args;
    }

    setData(data) {
        this._channel.scriptedCommands.setCommandSave(this._runner._cmd, data);
    }

    getData() {
        let data = this._channel.scriptedCommands._commands[this._runner._cmd.toLowerCase()].save;
        return data ? data : null;
    }

}
module.exports = LuaCommand;