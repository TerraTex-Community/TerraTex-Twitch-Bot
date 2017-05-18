/**
 * Created by C5217649 on 18.05.2017.
 */
const srHelper = require("./../SongRequest.helper");

class SongRequest {
    constructor(channel) {
        this._channel = channel;

        this._settings = {};
        this._channel.command.registerNewCommand("songrequest", this._requestSong.bind(this), "user");
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
        const username = user.username;
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
