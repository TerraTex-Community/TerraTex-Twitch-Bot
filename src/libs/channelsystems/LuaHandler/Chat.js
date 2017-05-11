/**
 * Created by geramy on 24.03.2016.
 */
"use strict";

class LuaChat {
    constructor(runner) {
        this._channel = runner._channel;
        this._runner = runner;
    }

    /**
     * Sends a String to the Channel Chat
     * @param {String} string
     */
    output(string) {
        this._channel._client.say(this._channel._channelName, string);
    }

    /**
     * send a /me to the chat
     * @param {String} string
     */
    action(string) {
        this._channel._client.action(this._channel._channelName, string);
    }
}
module.exports = LuaChat;
