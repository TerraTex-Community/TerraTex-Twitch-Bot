/**
 * Created by C5217649 on 05.04.2016.
 */
"use strict";

class LuaUser {
    /**
     *
     * @param {LuaRunner} runner
     */
    constructor(runner) {
        this._channel = runner._channel;
        this._runner = runner;

    }

    /**
     * Is User Moderator or higher?
     * @return {boolean} True if yes, false otherwise.
     */
    isModerator() {
        return !!(this._runner._user["user-type"] === "mod" || this._runner._user.username === this._channel._channelName);
    }

    /**
     * Is User Streamer?
     * @return {boolean} True if yes, false otherwise.
     */
    isStreamer() {
        return this._runner._user.username === this._channel._channelName;
    }

    /**
     * Get the Users Nickname
     * @returns {String}
     */
    getUsername() {
        return this._runner._user.username;
    }

    /**
     * get the defined display name (case)
     * @returns {String}
     */
    getDisplayName() {
        return this._runner._user["display-name"] || this._runner._user.username;
    }

    /**
     * Has the user Turbo?
     * @returns {boolean}
     */
    hasTurbo() {
        return this._runner._user.turbo;
    }

    /**
     * Is the user a subscriber of the channel?
     * @returns {boolean}
     */
    isSubscriber() {
        return this._runner._user.subscriber;
    }
}
module.exports = LuaUser;