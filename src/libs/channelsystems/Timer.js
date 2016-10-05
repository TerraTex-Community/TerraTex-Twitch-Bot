/**
 * Created by Geramy92 on 05.10.2016.
 */
"use strict";

class TimerController {
    constructor(channel) {
        this._channel = channel;

        this._messageSinceLastTimer = 0;
        this._timerData = {};
        //Load all timers of the channel
        g_database.getTable("timer", {
            channelID: channel._ID
        }, (function (err, data) {
            for (let i = 0; i < data.length; i++) {
                this._timerData[data[i].id] = new Timer(channel, this, this.parseTimerData(data[i]));
            }
        }).bind(this));

        channel._client.on("chat", (function (inChannel, user, message, self) {
            if (!self) {
                this._messageSinceLastTimer++;
            }
        }).bind(this));
    }

    deleteTimer(id) {
        this._timerData[id].delete();
        delete this._timerData[id];
    }

    newTimer(id) {
        g_database.getTable("timer", {
            channelID: this._channel._ID,
            id: id
        }, (function (err, data) {
            if (!err && data.length > 0) {
                data = data[0];
                this._timerData[data.id] = new Timer(this._channel, this, this.parseTimerData(data));
            }
        }).bind(this));
    }

    changeTimer(id) {
        g_database.getTable("timer", {
            channelID: this._channel._ID,
            id: id
        }, (function (err, data) {
            if (!err && data.length > 0) {
                data = data[0];
                this._timerData[data.id].update(this.parseTimerData(data));
            }
        }).bind(this));
    }

    parseTimerData(data) {
        data.sendRandom = data.sendRandom !== 0;
        data.onlyIfStreaming = data.onlyIfStreaming !== 0;
        data.afterMessagesType = data.afterMessagesType !== 0;

        if (data.messages && data.messages.length > 0) {
            data.messages = JSON.parse(data.messages);
        } else {
            data.messages = [];
        }

        return data;
    }

    resetCounter() {
        this._messageSinceLastTimer = 0;
    }

    get counter() {
        return this._messageSinceLastTimer;
    }
}
module.exports = TimerController;

class Timer {
    /**
     * @typedef {object} TimerMessageObject
     * @property {string} message
     * @property {int} intern
     *
     */
    /**
     * @typedef {object} TimerDataObject
     * @property {int} id
     * @property {int} channelID
     * @property {string} description
     * @property {boolean} sendRandom (1 = true, 0 = false)
     * @property {int} minutes
     * @property {TimerMessageObject[]} messages
     * @property {int} afterMessages
     * @property {boolean} afterMessagesType (false = thisTimer, true = alltimer)
     * @property {boolean} onlyIfStreaming
     */
    /**
     *
     * @param {Channel} channel
     * @param {TimerController} controller
     * @param {TimerDataObject} data
     */
    constructor(channel, controller, data) {
        this._channel = channel;
        this._timerController = controller;

        this._chatMessagesCounter = 0;
        this._options = data;
        this._waitForMinMessages = false;
        this._lastMessageId = -1;

        if (data.messages.length > 0) {
            this._timerTimeout = setTimeout((function () {
                this.execute();
            }).bind(this), data.minutes * 60000);
        }

        channel._client.on("chat", (function (inChannel, user, message, self) {
            if (!self) {
                this._chatMessagesCounter++;
                if (this._waitForMinMessages) {
                    this.execute();
                }
            }
        }).bind(this));
    }

    delete() {
        if (this._timerTimeout) {
            clearInterval(this._timerTimeout);
        }
    }

    /**
     * @param {TimerDataObject} data
     */
    update(data) {
        if (this._options.minutes !== data.minutes) {
            if (this._timerTimeout) {
                clearInterval(this._timerTimeout);
            }

            this._waitForMinMessages = false;

            if (data.messages.length > 0) {
                this._timerTimeout = setTimeout((function () {
                    this.execute();
                }).bind(this), data.minutes * 60000);
            }

            this._options = data;
        }
    }

    execute() {
        if (this._timerTimeout) {
            clearInterval(this._timerTimeout);
            this._timerTimeout = false;
        }

        this._waitForMinMessages = false;

        // restart timer if not streaming
        if (this._options.onlyIfStreaming && !this._channel._streamStatus) {
            if (data.messages.length > 0) {
                this._timerTimeout = setTimeout((function () {
                    this.execute();
                }).bind(this), data.minutes * 60000);
            }
            return null;
        }

        //check messages counter
        if (this._options.afterMessages > 0) {
            if (this._options.afterMessagesType) {
                if (this._options.afterMessages > this._timerController.counter) {
                    this._waitForMinMessages = true;
                    return null;
                }
            } else {
                if (this._options.afterMessages > this._chatMessagesCounter) {
                    this._waitForMinMessages = true;
                    return null;
                }
            }
        }

        //calc next message
        if (this._options.sendRandom) {
            this._lastMessageId = Math.rand(0, (this._options.messages.length - 1));
        } else {
            this._lastMessageId++;
            if (this._lastMessageId >= (this._options.messages.length)) {
                this._lastMessageId = 0;
            }
        }

        /**
         * @type {TimerMessageObject}
         */
        let message = this._options.messages[this._lastMessageId];
        if (message) {
            if (message.intern == 1 || message.intern) {
                this._channel.command.runCommandByBot(message.message);
            } else {
                this._channel._client.say(this._channel._channelName, message.message);
            }
        }

        //restart timer and reset all counters
        this._timerController.resetCounter();
        this._chatMessagesCounter = 0;

        if (this._options.messages.length > 0) {
            this._timerTimeout = setTimeout((function () {
                this.execute();
            }).bind(this), this._options.minutes * 60000);
        }
    }
}