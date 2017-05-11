/**
 * Created by C5217649 on 05.04.2016.
 */
"use strict";
class LuaStream {
    /**
     *
     * @param {LuaRunner} runner
     */
    constructor(runner) {
        this._channel = runner._channel;
        this._runner = runner;
    }

    getStreamStart(callback) {

        g_twitchAPI.getChannelStream(this._channel._channelName, (function(err, response) {

            try {
                if (response.stream) {
                    callback.apply(new Date(response.stream.created_at));
                } else {
                    callback.apply(false);
                }
            } catch (e) {
                this._runner.writeChannelLog("Error on executing Command " + this._runner._cmd);
                this._runner.writeChannelLog(e.lua_stack);
            }
        }).bind(this));
    }

    /**
     *
     * @param callback
     */
    getStream(callback) {
        g_twitchAPI.getChannelStream(this._channel._channelName, (function(err, response) {
            try {
                callback.apply(response);
            } catch (e) {
                this._runner.writeChannelLog("Error on executing Command " + this._runner._cmd);
                this._runner.writeChannelLog(e.lua_stack);
            }
        }).bind(this));
    }

    /**
     *
     */
    getChannelCreateDate(callback) {
        g_twitchAPI.getChannel(this._channel._channelName, (function(err, response) {
            try {
                callback.apply(new Date(response.created_at));
            } catch (e) {
                this._runner.writeChannelLog("Error on executing Command " + this._runner._cmd);
                this._runner.writeChannelLog(e.lua_stack);
            }
        }).bind(this));
    }

    /**
     *
     * @param callback
     */
    getChannel(callback) {
        g_twitchAPI.getChannel(this._channel._channelName, (function(err, response) {
            try {
                callback.apply(response);
            } catch (e) {
                this._runner.writeChannelLog("Error on executing Command " + this._runner._cmd);
                this._runner.writeChannelLog(e.lua_stack);
            }
        }).bind(this));
    }

    /**
     * @param callback
     */
    getGame(callback) {
        g_twitchAPI.getChannel(this._channel._channelName, (function(err, response) {
            try {
                callback.apply(response.game);
            } catch (e) {
                this._runner.writeChannelLog("Error on executing Command " + this._runner._cmd);
                this._runner.writeChannelLog(e.lua_stack);
            }
        }).bind(this));
    }

    /**
     * @param callback
     */
    getTitle(callback) {
        g_twitchAPI.getChannel(this._channel._channelName, (function(err, response) {
            try {
                callback.apply(response.status);
            } catch (e) {
                this._runner.writeChannelLog("Error on executing Command " + this._runner._cmd);
                this._runner.writeChannelLog(e.lua_stack);
            }
        }).bind(this));
    }

}
module.exports = LuaStream;
