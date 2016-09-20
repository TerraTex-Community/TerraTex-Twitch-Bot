/**
 * Created by C5217649 on 27.01.2016.
 */
"use strict";

class GiveAwaySystem {
    constructor(channel) {
        this._channel = channel;

        //Set defaults
        this._winner = "";
        this._active = false;
        this._users = {};
        this._neededPoints = 0;
        /**
         * Posible pointOptions:
         * 0 - it is only be required to own the given number of points
         * 1 - it is required to pay the points, except the winner everyone gets the points back
         * 2 - it is required to pay the points and no one gets points back
         * 3 - it is required to pay the points and the winner gets all points additionally
         *
         * @type {number}
         * @private
         */
        this._pointOption = 0;
        /**
         *
         * @type {Socket}
         * @private
         */
        this._registeredSocket = null;

        this.loadLastStateFromDB();

        //register Command
        this._channel.command.registerNewCommand("giveaway", this.cmdGiveAway.bind(this), "user");

        channel._client.on("chat", (function (chatChannel, user, message) {
            if (this._winner === user.username && this._registeredSocket) {
                let date = new Date();
                this._registeredSocket.emit("sendWinnerMessage", {
                    userName: user["display-name"] || user.username,
                    color: user.color,
                    time: date.getHours() + ":" + date.getMinutes(),
                    message: g_helper.api.formatEmotes(message, user.emotes)
                });
            }
        }).bind(this));
    }

    loadLastStateFromDB() {
        g_database.getTable("giveaway_tmp_data", {channelID: this._channel._ID}, (function (err, result) {
            if (!err && result.length > 0) {
                this._users = JSON.parse(result[0].users);
                let configs = JSON.parse(result[0].configs);
                this._active = configs.active;
                this._pointOption = configs.pointOption;
                this._neededPoints = configs.neededPoints;
            }
        }).bind(this));
    }

    cmdGiveAway(user) {
        if (this._active && !this._users[user.username]) {
            //get user data // profile picture etc.
            g_twitchAPI.getUser(user.username, (function (apiErr, userResult) {
                if (!apiErr) {
                    //extend user object with logo
                    user.logo = userResult.logo;
                    // get Points of the user
                    g_database.getTable("viewer", {
                        channelID: this._channel._ID,
                        viewerName: user.username
                    }, (function (dbErr, viewerResult) {
                        if (!dbErr && viewerResult.length > 0) {
                            if (this._neededPoints === 0 || this._neededPoints < viewerResult[0].points) {
                                this._users[user.username] = user;

                                if (this._registeredSocket) {
                                    this._registeredSocket.emit("newGiveAwayViewer", user);
                                    this.resendUserList();
                                }

                                if (this._pointOption > 0) {
                                    let query = "UPDATE viewer SET points = points - " + this._neededPoints;
                                    query += " WHERE channelID = :channelID and viewerName=:viewerName";
                                    g_database.query(query, {
                                        channelID: this._channel._ID,
                                        viewerName: user.username
                                    });
                                }
                                this.saveStateToDB();
                            }
                        }
                    }).bind(this));
                }
            }).bind(this));

        }
    }

    resendUserList() {
        if (this._registeredSocket) {
            this._registeredSocket.emit("generateNewSlideBar", this._users);
        }
    }

    /**
     * Finish GiveAway
     */
    closeGiveAway() {
        if (this._neededPoints > 0) {
            if (this._pointOption === 1) {
                //everyone except winner gets the points back
                for (let userName in this._users) {
                    if (this._users.hasOwnProperty(userName)) {
                        if (userName !== this._winner) {
                            this._channel.pointsSystem.addPointsToUser(userName, this._neededPoints);
                        }
                    }
                }
            } else if (this._pointOption === 3) {
                //winner gets all points
                let counter = 0;
                for (let userName in this._users) {
                    if (this._users.hasOwnProperty(userName)) {
                        if (userName !== this._winner) {
                            counter++;
                        }
                    }
                }
                this._channel.pointsSystem.addPointsToUser(this._winner, (this._neededPoints * counter));
            }
        }
        this.resetSettingsToDefault();
    }

    /**
     * Cancel GiveAway (so reset and give all points back
     */
    cancelGiveAway() {
        if (this._neededPoints > 0 && this._pointOption > 0) {
            for (let userName in this._users) {
                if (this._users.hasOwnProperty(userName)) {
                    this._channel.pointsSystem.addPointsToUser(userName, this._neededPoints);
                }
            }
        }
        this.resetSettingsToDefault();
    }

    resetSettingsToDefault() {
        this._winner = "";
        this._active = false;
        this._users = {};
        this._neededPoints = 0;
        this._pointOption = 0;
        this._registeredSocket = null;

        g_database.query("DELETE FROM giveaway_tmp_data WHERE channelID = :channelID", {
            channelID: this._channel._ID
        });
    }

    saveStateToDB() {
        g_database.query("DELETE FROM giveaway_tmp_data WHERE channelID = :channelID", {
            channelID: this._channel._ID
        }, (function () {
            g_database.insert("giveaway_tmp_data", {
                channelID: this._channel._ID,
                users: JSON.stringify(this._users),
                configs: JSON.stringify({
                    active: this._active,
                    neededPoints: this._neededPoints,
                    pointOption: this._pointOption
                })
            });
        }).bind(this));
    }
}
module.exports = GiveAwaySystem;