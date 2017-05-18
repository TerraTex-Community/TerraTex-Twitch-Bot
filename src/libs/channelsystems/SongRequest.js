/**
 * Created by C5217649 on 18.05.2017.
 */
const srHelper = require("./../SongRequest.helper");

class SongRequest {
    /**
     *
     * @param {Channel} channel
     */
    constructor(channel) {
        this._channel = channel;

        this._settings = {};
        this._channel.command.registerNewCommand("songrequest", this._requestSong.bind(this), "user");
        this._loadSongRequestSettings();
    }

    /**
     *
     * @private
     */
    _loadSongRequestSettings() {
        let sql = "SELECT * FROM songrequest_settings WHERE channelID = :ID;";
        g_database.query(sql, {"ID": this._channel._ID}, (function (err, result) {
            if (!err) {
                if (result.length === 0) {
                    g_database.insert("songrequest_settings", {channelID: this._channel._ID}, (function () {
                        this.loadSongRequestSettings();
                    }).bind(this));
                } else {
                    this._settings = result[0];
                }
            }
        }).bind(this));
    }

    /**
     * @param {{}} user
     * @param {string} ytid
     * @private
     */
    _requestSong(user, cmd, ytid) {
        if (!this._settings.enabled) {
            return;
        }

        const username = user.username;

        const uri = require("urijs");
        if (ytid.startsWith("http")) {
            ytid = uri(ytid).search(true).v;
        }

        this._excludeBlacklistCalls(username, ytid, () => {
            this._checkViewTime(username, () => {
                this._handlePoints(username, () => {
                    srHelper.addSongToPlayList(
                        this._channel._ID,
                        username,
                        ytid,
                        "request",
                        (err, data) => {
                            if (!err && data) {
                                let output = this._channel.text.get("songrequest.requested", {
                                    title: data.title,
                                    fromUser: username
                                });
                                this._channel._client.say(this._channel._channelName, output);
                            }
                        });
                });
            });
        });
    }

    _handlePoints(username, callback) {
        if (this._settings.pointCosts > 0) {
            this._channel.pointsSystem.getUserPoints(username, (err, result) => {
                if (!err && result && result >= this._settings.pointCosts) {
                    this._channel.pointsSystem.addPointsToUser(username, -this._settings.pointCosts);
                    callback();
                }
            });
        } else {
            callback();
        }
    }

    _checkViewTime(username, callback) {
        if (this._settings.minViewTime > 0) {
            g_database.getTable("viewer", {
                channelID: this._channel._ID,
                viewerName: username
            }, (err, result) => {
                if (!err && result && result.length > 0) {
                    if (result[0].viewTime >= this._settings.minViewTime) {
                        callback();
                    }
                }
            });
        } else {
            callback();
        }
    }

    _excludeBlacklistCalls(username, ytid, callback) {
        srHelper.isUserOnBlacklist(this._channel._ID, username, (err, userIsOnBlacklist) => {
            if (!err && !userIsOnBlacklist) {
                srHelper.isSongOnBlacklist(this._channel._ID, ytid, (blerr, songIsOnBlacklist) => {
                    if (!blerr && !songIsOnBlacklist) {
                        callback();
                    }
                });
            }
        });
    }

    get settings() {
        return this._settings;
    }

    /**
     * reload settings
     */
    refreshSettings() {
        this._loadSongRequestSettings();
    }
}
module.exports = SongRequest;
