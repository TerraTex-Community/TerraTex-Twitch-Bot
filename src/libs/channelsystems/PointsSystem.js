/**
 * Created by geramy on 07.01.2016.
 */
"use strict";

class PointsSystem {
    constructor(channel) {
        this._channel = channel;

        this._channel.command.registerNewCommand("points", this.cmdPoints.bind(this), "user");
        this._channel.command.registerNewCommand("addpoints", this.cmdAddPoints.bind(this), "mod");
        this._channel.command.registerNewCommand("givepoints", this.cmdGivePoints.bind(this), "user");

        this._settings = {};
        this.loadPointsSettings();
    }

    /**
     * This function adds points to the spezified username.
     * @param {String} username - Name of the User who gets the points.
     * @param {int} points - points that should be added or subtracted if negative
     */
    addPointsToUser(username, points) {
        let query = "UPDATE viewer SET points = points + :addPoints WHERE viewerName = :username AND channelID = :channelID";
        if (points < 0) {
            points = -points;
            query = query.replace("+", "-");
        }

        g_database.query(query, {addPoints: points, username: username, channelID: this._channel._ID});
    }

    /**
     * This function requests the points of a user and calls the callback
     * @param username
     * @param callback - function(err, points)
     */
    getUserPoints(username, callback) {
        g_database.query(
            "SELECT points FROM viewer WHERE channelID = :channelID AND viewerName = :username",
            {
                channelID: this._channel._ID,
                username: username
            },
            function (err, result) {
                if (err) {
                    callback(err);
                } else if (result.length === 0) {
                    callback(new Error("no such User"));
                } else {
                    callback(null, result[0].points);
                }
            }
        );
    }

    /**
     * This Function can be called by !give [username] [points]
     * Will give points from caller to the given user. if they will give more points as he have it will give only so much
     * points he have.
     * @param {object} user     - The User who executes the command.
     * @param {String} cmd      - the cmd
     * @param {String} toUser   - Username of the user who gets the points
     * @param {int} points      - number of the points that should be given to the other user
     */
    cmdGivePoints(user, cmd, toUser, points) {
        // 1. Check if this Command is only for mods or for everyone
        if (this._settings.pointsGiveOnlyMods === 0 || user["user-type"] === "mod" || user.username === this._channel._channelName) {
            // check if all Parameters are set.
            if (!toUser || !points || points < 1) {
                this._channel._client.say(this._channel._channelName, "Syntax: !give [username] [points]");
            }

            // 2. Check if toUser is online
            g_helper.api.isUserInChat(this._channel._channelName, toUser, (function (apiErr, isUserOnline) {
                if (!isUserOnline) {
                    this._channel._client.say(this._channel._channelName, this._channel.text.get("pointSystem.give_not_in_chat", {
                        fromUser: user["display-name"] || user.username,
                        toUser: toUser
                    }));
                    return;
                }

                // 3. Check if user has enough points -> If not get his maximum number of points
                let query = "SELECT points FROM viewer WHERE viewerName = :viewerName AND channelID = :channelID";
                g_database.query(query, {
                    viewerName: user.username,
                    channelID: this._channel._ID
                }, (function (dbErr, hasPoints) {
                    if (hasPoints.length === 0) {
                        return;
                    }
                    hasPoints = hasPoints[0].points;

                    if (hasPoints < points) {
                        points = hasPoints;
                    }
                    // 4. take his points
                    this.addPointsToUser(user.username, -points);
                    // 5. give the points to other user
                    this.addPointsToUser(toUser, points);
                    // 6. show the action in chat
                    this._channel._client.say(this._channel._channelName, this._channel.text.get("pointSystem.give_success", {
                        fromUser: user["display-name"] || user.username,
                        toUser: toUser,
                        count: points
                    }));
                }).bind(this));
            }).bind(this));
        }
    }


    /**
     * called by !addpoints [points] [name=*]
     * Adds points to specified username or everyone that is in chat
     * @param {object}      user        - user who send the command
     * @param {int}         points      - number of points that should be added
     * @param {string|null} [name=null] - username of the user that will get the points (if online in chat)
     */
    cmdAddPoints(user, cmd, points, name) {
        g_helper.api.getChatUser(this._channel._channelName, (function (err, users) {
            if (!parseInt(points)) {
                return;
            }
            if (!err && name && users) {
                name = name.toLowerCase();
                if (users.indexOf(name) !== -1) {
                    this.addPointsToUser(name, points);
                    this._channel._client.say(this._channel._channelName, this._channel.text.get("pointSystem.add_single_user", {
                        fromUser: user["display-name"] || user.username,
                        toUser: name,
                        count: points
                    }));
                } else {
                    this._channel._client.say(this._channel._channelName, this._channel.text.get("pointSystem.add_not_in_chat", {
                        fromUser: user["display-name"] || user.username,
                        toUser: name
                    }));
                }
            } else {
                let length = users.length;
                for (let i = 0; i < length; i++) {
                    this.addPointsToUser(users[i], points);
                }

                this._channel._client.say(this._channel._channelName, this._channel.text.get("pointSystem.add_all", {
                    fromUser: user["display-name"] || user.username,
                    count: points
                }));

            }
        }).bind(this));
    }

    /**
     * Called by !points - Shows number of Points of the user
     * @param {object} user - The user who send the command
     */
    cmdPoints(user) {
        if (this._settings.pointsEnabled === 1) {
            g_database.query("SELECT points FROM viewer WHERE channelID=:channelID AND viewerName=:viewerName", {
                channelID: this._channel._ID,
                viewerName: user.username
            }, (function (err, result) {
                if (!err && result.length > 0) {
                    this._channel._client.say(this._channel._channelName, this._channel.text.get("pointSystem.show_points", {
                        fromUser: user["display-name"] || user.username,
                        count: Math.floor(result[0].points)
                    }));
                }
            }).bind(this));
        }
    }

    loadPointsSettings() {
        let sql = "SELECT * FROM viewer_points_configs WHERE channelID = :ID;";
        g_database.query(sql, {"ID": this._channel._ID}, (function (err, result) {
            if (!err) {
                if (result.length === 0) {
                    g_database.insert("viewer_points_configs", {channelID: this._channel._ID}, (function () {
                        this.loadPointsSettings();
                    }).bind(this));
                } else {
                    this._settings = result[0];
                    this._channel.viewerSystem.saveViewerStats();
                }
            }
        }).bind(this));
    }
}
module.exports = PointsSystem;
