/**
 * Created by C5217649 on 05.04.2016.
 */
"use strict";

class LuaUtilities {
    /**
     *
     * @param {LuaRunner} runner
     */
    constructor(runner) {
        this._channel = runner._channel;
        this._runner = runner;

    }

    /**
     *
     * @param parameter
     * @returns {Date}
     */
    getDate(parameter) {
        if (!parameter) {
            return new Date();
        } else {
            return new Date(parameter);
        }
    }

}
module.exports = LuaUtilities;