/**
 * Created by C5217649 on 21.03.2016.
 */
"use strict";

class Timer {
    constructor(channel) {
        this._channel = channel;

        this._messageSinceLastTimer = 0;
        this._timerData = {};
        //Load all timers of the channel
        g_database.getTable("timer", {
            channelID: channel._ID
        }, (function (err, data) {
            for (let i = 0; i < data.length; i++) {
                data[i].messages = JSON.parse(data[i].messages);
                data[i].messagesSinceLastExecution = 0;
                data[i].lastTimer = setTimeout((function () {
                    this._executeTimer(data[i].id);
                }).bind(this), data[i].minutes * 60000);
                data[i].lastMessage = -1;
                this._timerData[data[i].id] = data[i];
            }
        }).bind(this));

        channel._client.on("chat", (function (inChannel, user, message, self) {
            if (!self) {
                this._messageSinceLastTimer++;

                for (let timerId in this._timerData) {
                    if (this._timerData.hasOwnProperty(timerId)) {
                        this._timerData[timerId].messagesSinceLastExecution++;
                    }
                }
            }
        }).bind(this));
    }

    _executeTimer(timerID) {
        this._timerData[timerID].lastTimer = setTimeout((function () {
            this._executeTimer(timerID);
        }).bind(this), this._timerData[timerID].minutes * 60000);
        let timer = this._timerData[timerID];

        if (this._channel._streamStatus || timer.onlyIfStreaming === 0) {

            let optionOnlyThisTimer = timer.messagesSinceLastExecution >= timer.afterMessages && timer.afterMessagesType === 0;
            let optionallTimer = this._messageSinceLastTimer >= timer.afterMessages && timer.afterMessagesType === 1;

            if (optionOnlyThisTimer || optionallTimer) {
                if (timer.messages.length > 0) {
                    timer.lastMessage++;
                    if (timer.lastMessage > timer.messages.length) {
                        timer.lastMessage = 0;
                        this._timerData[timerID].lastMessage = timer.lastMessage;
                    }

                    if (timer.sendRandom === 1) {
                        timer.lastMessage = Math.rand(0, timer.messages.length);
                    }

                    let messageData = timer.messages[timer.lastMessage];

                    if (messageData) {
                        this._timerData[timerID].messagesSinceLastExecution = 0;
                        this._messageSinceLastTimer = 0;
                        if (messageData.intern) {
                            this._channel.command.runCommandByBot(messageData.message);
                        } else {
                            this._channel._client.say(this._channel._channelName, messageData.message);
                        }
                    }
                }
            }
        }
    }

    deleteTimer(timerID) {
        clearTimeout(this._timerData[timerID].lastTimer);
        delete this._timerData[timerID];
    }

    newTimer(id) {
        g_database.getTable("timer", {
            channelID: this._channel._ID,
            id: id
        }, (function (err, data) {
            let i = 0;
            data[i].messages = JSON.parse(data[i].messages);
            data[i].messagesSinceLastExecution = 0;
            data[i].lastTimer = setTimeout((function () {
                this._executeTimer(data[i].id);
            }).bind(this), data[i].minutes * 60000);
            data[i].lastMessage = -1;
            this._timerData[data[i].id] = data[i];
        }).bind(this));
    }

    changeTimer(id) {
        this.deleteTimer(id);
        this.newTimer(id);
    }
}

module.exports = Timer;