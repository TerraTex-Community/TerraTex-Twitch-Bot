/**
 * Created by geramy on 07.01.2016.
 */
"use strict";

class ViewerSystem {
    constructor(channel) {
        this._channel = channel;

        this._channel.command.registerNewCommand("chat", this.cmdChat.bind(this), "user");
        this._channel.command.registerNewCommand("view", this.cmdView.bind(this), "user");
        this._channel.command.registerNewCommand("follow", this.cmdFollow.bind(this), "user");

        this._channelChatCounters = {};
        //Init Command and Chat Listener
        channel._client.on("chat", (function (chatChannel, user, message, self) {
            // Do your stuff.
            if (!self && chatChannel === "#" + this._channel._channelName) {
                if (!this._channelChatCounters[user.username]) {
                    this._channelChatCounters[user.username] = 0;
                }
                this._channelChatCounters[user.username]++;
            }
        }).bind(this));

        this._settings = {};
    }

    cmdFollow (user) {
        g_twitchAPI.getUserFollowsChannel(user.username, this._channel._channelName, (function (err, result) {
            if (!err) {
                let date = new Date(result.created_at);

                let output = this._channel.text.get("viewerSystem.cmd_follow",{
                    fromUser: user["display-name"] || user.username,
                    date: g_helper.time.dateToDateString(date)
                });
                this._channel._client.say(this._channel._channelName, output);
            }
        }).bind(this));
    }

    cmdView (user) {
        g_database.query("SELECT viewTime FROM viewer WHERE channelID=:channelID AND viewerName=:viewerName", {
            channelID: this._channel._ID,
            viewerName: user.username
        }, (function (err, result) {
            if (!err && result.length > 0) {
                let time = result[0].viewTime;

                let output = this._channel.text.get("viewerSystem.cmd_view",{
                    fromUser: user["display-name"] || user.username,
                    timeFormated: g_helper.time.minutesToLongTimeString(time),
                    minutes: time
                });
                this._channel._client.say(this._channel._channelName, output);
            }
        }).bind(this));
    }

    cmdChat (user) {
        g_database.query("SELECT chatMessages FROM viewer WHERE channelID=:channelID AND viewerName=:viewerName", {
            channelID: this._channel._ID,
            viewerName: user.username
        }, (function (err, result) {
            if (!err && result.length > 0) {
                let output = this._channel.text.get("viewerSystem.cmd_chat",{
                    fromUser: user["display-name"] || user.username,
                    count: result[0].chatMessages
                });
                this._channel._client.say(this._channel._channelName, output);
            }
        }).bind(this));
    }

    // save functions
    saveViewerStats() {
        setTimeout(this.saveViewerStats.bind(this), 60000);
        this._settings = this._channel.pointsSystem._settings;
        g_helper.api.getChatUser(this._channel._channelName, (function(err, users){
            if (!err) {
                //Complete User Array
                let completeCalculation = {};

                for (let i = 0; i < users.length; i++) {
                    completeCalculation[users[i]] = {
                        addPoints: 0,
                        addMessages: 0,
                        addTime: this._channel._streamStatus ? 1 : 0
                    };

                    if (this._settings.pointsEnabled === 1 && this._channel._streamStatus) {
                        completeCalculation[users[i]].addPoints = this._settings.pointsPerMinute / this._settings.pointsEveryMinutes;
                    }
                }

                let additionalUsers = this._channelChatCounters;
                this._channelChatCounters = {};

                Object.keys(additionalUsers).forEach((function (element) {
                    if (!completeCalculation[element]) {
                        completeCalculation[element] = {
                            addPoints: 0,
                            addMessages: 0,
                            addTime: this._channel._streamStatus ? 1 : 0
                        };
                    }

                    if (this._settings.pointsEnabled === 1 && this._channel._streamStatus) {
                        completeCalculation[element].addPoints = this._settings.pointsPerMinuteInChat / this._settings.pointsEveryMinutesInChat;
                    }
                    completeCalculation[element].addMessages = additionalUsers[element];
                }).bind(this));

                // Run Querys

                let query = "";
                query += "INSERT INTO viewer (channelID, viewerName, points, viewTime, chatMessages) VALUES ";
                query += "(:channelID, :viewerName, :points, :viewTime, :chatMessages) ";
                query += "ON DUPLICATE KEY UPDATE points = points + VALUES(points), ";
                query += "viewTime = viewTime + VALUES(viewTime), chatMessages = chatMessages + VALUES(chatMessages)";
                Object.keys(completeCalculation).forEach((function (element) {
                    g_database.query(query, {
                        channelID: this._channel._ID,
                        viewerName: element,
                        points: completeCalculation[element].addPoints,
                        viewTime: completeCalculation[element].addTime,
                        chatMessages: completeCalculation[element].addMessages
                    });
                }).bind(this));

                let botList = g_configs.twitch.defaultBotNames.join("','");
                botList = "'" + botList + "','" + this._channel._botName + "'";

                g_database.query("UPDATE viewer SET isBot = 1 WHERE channelID = :channelID AND viewerName IN (" + botList + ")", {
                    channelID: this._channel._ID
                });

                this._channel.rankSystem.updateRanks();
            }

        }).bind(this));
    }


}
module.exports = ViewerSystem;