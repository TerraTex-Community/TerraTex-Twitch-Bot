/**
 * Created by C5217649 on 26.02.2016.
 */
"use strict";

class Roulette {
    /**
     *
     * @param {Channel} channel
     * @param {ChatGames} chatgamesobject
     * @param {Object} settings
     */
    constructor(channel, chatgamesobject, settings) {
        /**
         * @type {Channel}
         * @private
         */
        this._channel = channel;
        /**
         * @type {ChatGames}
         * @private
         */
        this._chatGames = chatgamesobject;

        // Time how many minutes users can join
        settings.runTime = 2;

        /**
         * Settings Object
         * @type {Object}
         * @property {bool} active
         * @property {int} option - 0: everyone same points defined by points property
         *                          1: everyone same points defined by starter and limited my minPoints and maxPoints property
         *                          2: completely free
         * @property {int} points - points definition for option 0
         * @property {int} minPoints - min points for option 1
         * @property {int} maxPoints - max points for option 2
         * @property {int} runTime - Duration of the game in Minutes
         * @private
         */
        this._settings = settings;

        /**
         * Is a game started?
         * @private
         */
        this._started = false;

        /**
         * Roulette Runtime Object
         */
        this._run = {
            users: {},
            option: 0,
            points: 0
        };


        channel.command.registerNewCommand("roulette", this._cmdRoulette.bind(this), "user");
    }

    /**
     * This Running by the command "roulette"
     * @param {Object} user
     * @param {String} cmd
     * @param {String} points
     * @private
     */
    _cmdRoulette(user, cmd, points) {
        if (this._settings.active) {
            if (!this._started) {
                //start Roulette
                this._run.option = parseInt(this._settings.option);
                if (this._run.option === 0) {
                    this._channel.pointsSystem.getUserPoints(user.username, (function (err, userPoints) {
                        //defined points
                        if (!err && userPoints >= this._settings.points) {
                            this._run.points = this._settings.points;
                            this._run.users[user.username] = this._run.points;
                            this._channel.pointsSystem.addPointsToUser(user.username, -this._run.points);
                            this._channel._client.say(this._channel._channelName, this._channel.text.get("chatgames.roulette_start_0", {
                                user: user["display-name"] || user.username,
                                points: this._run.points
                            }));
                            this._started = true;
                            setTimeout(this._getWinner.bind(this), this._settings.runTime * 60000);
                        }
                    }).bind(this));
                } else if (this._run.option === 1) {
                    //starter defines points
                    points = parseInt(points, 10);
                    if (points) {
                        this._channel.pointsSystem.getUserPoints(user.username, (function (err, userPoints) {
                            //defined points
                            if (points > this._settings.minPoints &&
                                (points < this._settings.maxPoints || this._settings.maxPoints <= this._settings.minPoints)) {

                                if (!err && userPoints >= points) {
                                    this._run.points = points;
                                    this._run.users[user.username] = points;
                                    this._channel.pointsSystem.addPointsToUser(user.username, -points);
                                    this._channel._client.say(this._channel._channelName, this._channel.text.get("chatgames.roulette_start_1", {
                                        user: user["display-name"] || user.username,
                                        points: points
                                    }));
                                    this._started = true;
                                    setTimeout(this._getWinner.bind(this), this._settings.runTime * 60000);
                                }
                            } else {
                                // output Error
                                if (this._settings.maxPoints <= this._settings.minPoints) {
                                    this._channel._client.say(
                                        this._channel._channelName,
                                        this._channel.text.get("chatgames.roulette_start_1_error_nomax", {
                                            fromUser: user["display-name"] || user.username,
                                            minPoints: this._settings.minPoints
                                        })
                                    );
                                } else {
                                    this._channel._client.say(
                                        this._channel._channelName,
                                        this._channel.text.get("chatgames.roulette_start_1_error", {
                                            fromUser: user["display-name"] || user.username,
                                            minPoints: this._settings.minPoints,
                                            maxPoints: this._settings.maxPoints
                                        })
                                    );
                                }
                            }
                        }).bind(this));
                    }

                } else if (this._run.option === 2) {
                    //dynamic points
                    points = parseInt(points, 10);
                    if (points) {
                        this._channel.pointsSystem.getUserPoints(user.username, (function (err, userPoints) {
                            //defined points
                            if (!err && userPoints >= points) {
                                this._run.points = -1;
                                this._run.users[user.username] = points;
                                this._channel.pointsSystem.addPointsToUser(user.username, -points);
                                this._channel._client.say(
                                    this._channel._channelName,
                                    this._channel.text.get("chatgames.roulette_start_2", {
                                        user: user["display-name"] || user.username
                                    })
                                );
                                this._started = true;
                                setTimeout(this._getWinner.bind(this), this._settings.runTime * 60000);
                            }
                        }).bind(this));
                    }

                }
            } else {
                if (this._run.option !== 2) {
                    this._channel.pointsSystem.getUserPoints(user.username, (function (err, userPoints) {
                        if (userPoints >= this._run.points) {
                            if (!this._run.users.hasOwnProperty(user.username)) {
                                this._channel.pointsSystem.addPointsToUser(user.username, -this._run.points);
                                this._run.users[user.username] = this._run.points;
                            }
                        }
                    }).bind(this));
                } else {
                    points = parseInt(points, 10);
                    if (points) {
                        this._channel.pointsSystem.getUserPoints(user.username, (function (err, userPoints) {
                            if (userPoints >= points) {
                                if (!this._run.users.hasOwnProperty(user.username)) {
                                    this._channel.pointsSystem.addPointsToUser(user.username, -points);
                                    this._run.users[user.username] = points;
                                } else {
                                    this._channel.pointsSystem.addPointsToUser(user.username, -points);
                                    this._run.users[user.username] = this._run.users[user.username] + points;
                                }
                            }
                        }).bind(this));
                    }
                }
            }
        }
    }

    /**
     * End of Roulette
     * @private
     */
    _getWinner() {
        let users = Object.keys(this._run.users);
        users.shuffle().shuffle().shuffle().shuffle().shuffle();
        let winner = users[0];
        let win = 0;
        if (this._run.option !== 2) {
            win = users.length * this._run.points;
        } else {
            let maxWinPerUser = this._run.users[winner];
            for (let user in this._run.users) {
                if (this._run.users.hasOwnProperty(user)) {
                    if (maxWinPerUser >= this._run.users[user]) {
                        win += this._run.users[user];
                    } else {
                        win += maxWinPerUser;
                        this._channel.pointsSystem.addPointsToUser(user, (this._run.users[user] - maxWinPerUser));
                    }
                }
            }
        }

        this._channel.pointsSystem.addPointsToUser(winner, win);
        this._channel._client.say(this._channel._channelName, this._channel.text.get("chatgames.roulette_winner", {
            user: winner,
            points: win
        }));

        this._run = {
            users: {},
            option: 0,
            points: 0
        };
        this._started = false;
    }

    /**
     * Set new Settings
     */
    set settings(object) {
        this._settings = object;
    }
}
module.exports = Roulette;
