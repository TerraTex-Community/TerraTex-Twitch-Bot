/**
 * Created by C5217649 on 26.01.2016.
 */
/**
 * Created by geramy on 07.01.2016.
 */
"use strict";

class ViewerRankSystem {
    constructor(channel) {
        this._channel = channel;

        this._settings = {};
        this._updateQuery = "";

        this.loadRanksSettings();
        this._ranks = [];
        this._ranksByName = {};


        this._channel.command.registerNewCommand("level", this.cmdLevel.bind(this), "user");
    }

    cmdLevel(user) {
        if (this._settings.enabled) {
            g_database.getTable("viewer", {
                channelID: this._channel._ID,
                viewerName: user.username
            }, (function (err, result) {
                if (!err) {
                    let rankName, minutesUntil;
                    rankName = result[0].level;
                    minutesUntil = (this._ranksByName[rankName]) - result[0].viewTime;

                    let output = this._channel.text.get("rankSystem.cmd_level", {
                        fromUser: user["display-name"] || user.username,
                        level: rankName,
                        timeFormated: g_helper.time.minutesToLongTimeString(minutesUntil),
                        minutes: minutesUntil
                    });

                    if (!minutesUntil || minutesUntil===0) {
                        output = this._channel.text.get("rankSystem.cmd_level_lastLevel", {
                            fromUser: user["display-name"] || user.username,
                            level: rankName
                        });
                    }


                    this._channel._client.say(this._channel._channelName, output);
                }
            }).bind(this));
        }
    }

    loadRanksSettings() {
        let sql = "SELECT * FROM viewer_ranks_configs WHERE channelID = :ID;";
        g_database.query(sql, {"ID": this._channel._ID}, (function (err, result) {
            if (!err) {
                if (result.length === 0) {
                    g_database.insert("viewer_ranks_configs", {channelID: this._channel._ID}, (function () {
                        this.loadRanksSettings();
                    }).bind(this));
                } else {
                    this._settings = result[0];
                    this.buildRankSetUp();
                }
            }
        }).bind(this));
    }

    buildRankSetUp() {
        let sql = "SELECT * FROM viewer_ranks WHERE channelID = :ID ORDER BY levelHours DESC;";
        g_database.query(sql, {"ID": this._channel._ID}, (function (err, result) {
            if (!err) {
                let length = result.length;
                this._ranks = result;
                if (length > 0) {
                    let hours = 0, rankName, lastHours;
                    let query = "UPDATE viewer SET level= \n CASE \n";
                    for (let i = 0; i < length; i++) {
                        lastHours = hours;
                        hours = result[i].levelHours * 60;
                        rankName = result[i].levelName;
                        this._ranksByName[rankName] = lastHours;
                        query += "WHEN viewTime > " + hours + " THEN '" + rankName + "'\n";
                    }
                    this._ranksByName[this._settings.defaultRank] = hours;

                    query += "ELSE '" + this._settings.defaultRank + "'\n";
                    query += "END\nWHERE channelID=:channelID";
                    this._updateQuery = query;
                } else {
                    this._updateQuery = "UPDATE viewer SET level= '" + this._settings.defaultRank + "' WHERE channelID=:channelID";
                }
            }
        }).bind(this));
    }

    updateRanks() {
        g_database.query(this._updateQuery, {"channelID": this._channel._ID});
    }
}
module.exports = ViewerRankSystem;