const Helper = require("./Helper.class");
const request = require("request");
const uri = require("urijs");

const checkSongInDatabase = (channelId, requester, songId, songTitle, playlistId, callback) => {
    g_database.exist("songrequest_playlists", {
        youtubeID: songId,
        channelID: channelId,
        autoplayPlaylist: playlistId
    }, (err, exist) => {
        if (err) {
            return callback(err);
        }
        if (!exist) {
            return g_database.insert("songrequest_playlists", {
                youtubeID: songId,
                channelID: channelId,
                autoplayPlaylist: playlistId,
                requestedBy: requester,
                title: songTitle
            }, err => {
                if (err) {
                    return callback(err);
                }
                return callback(null, {
                    youtubeID: songId,
                    channelID: channelId,
                    autoplayPlaylist: playlistId,
                    requestedBy: requester,
                    title: songTitle
                });
            });
        } else {
            return callback(new Error("Song already exist in Playlist"));
        }
    });
};

/**
 *
 * @param {string|int} channel
 * @param {string} requester
 * @param {string} song - can be the id or url
 * @param {"default"|"request"} playlist
 * @param callback
 */
const addSongToPlayList = (channel, requester, song, playlist, callback) => {
    Helper.getChannelIdFromIdOrName(channel, channelId => {
        let songId = song;
        if (song.startsWith("http")) {
            songId = uri(song).search(true).v;
        }

        request('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + songId + '&key=' + g_configs.youtube.ytDataAuthKey, (error, response, body) => {
            if (!error) {
                body = JSON.parse(body);
                if (body.items.length > 0) {
                    const songTitle = body.items[0].snippet.title + ' (YT-Channel: ' + body.items[0].snippet.channelTitle + ')';

                    // check for doublicates
                    const playlistId = playlist === "default" ? 1 : 0;

                    checkSongInDatabase(channelId, requester, songId, songTitle, playlistId, callback);

                } else {
                    callback(new Error("No Song with this Youtube Id found."));
                }
            } else {
                callback(error);
            }
        });
    });
};
exports.addSongToPlayList = addSongToPlayList;

const doPlaylistRequest = (channelId, requester, playlistId, internalPlayerListId, pageToken, newItems, completedItems, callback) => {
    let url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId='
        + playlistId
        + '&key='
        + g_configs.youtube.ytDataAuthKey
        + '&maxResults=50';

    if (pageToken) {
        url += "&pageToken=" + pageToken;
    }

    request(url, (error, response, body) => {
        if (!error) {
            body = JSON.parse(body);
            if (body.items && body.items.length > 0) {
                const results = [];
                completedItems += body.items.length;

                for (const item of body.items) {
                    const songTitle = item.snippet.title + ' (YT-Channel: ' + item.snippet.channelTitle + ')';
                    const songId = item.snippet.resourceId.videoId;

                    results.push(new Promise(resolve => {
                        checkSongInDatabase(channelId, requester, songId, songTitle, internalPlayerListId, (err) => {
                            if (!err) {
                                newItems++;
                            }
                            resolve();
                        });
                    }));
                }

                Promise.all(results).then(() => {
                    if (body.nextPageToken) {
                        doPlaylistRequest(channelId, requester, playlistId, internalPlayerListId, body.nextPageToken, newItems, completedItems, callback);
                    } else {
                        callback(null, newItems, completedItems);
                    }
                });
            } else {
                callback(new Error("No Playlist with this Youtube Id found."));
            }
        } else {
            callback(error);
        }
    });
};

/**
 *
 * @param {string|int} channel
 * @param {string} requester
 * @param {string} playlist - is url or just id
 * @param {"default"|"request"} internalPlayerList - is url or just id
 * @param callback
 */
const addPlaylistToPlaylist = (channel, requester, playlist, internalPlayerList, callback) => {
    Helper.getChannelIdFromIdOrName(channel, channelId => {
        let playlistId = playlist;
        if (playlist.startsWith("http")) {
            playlistId = uri(playlist).search(true).list;
        }
        const internalPlayerListId = internalPlayerList === "default" ? 1 : 0;

        doPlaylistRequest(channelId, requester, playlistId, internalPlayerListId, null, 0, 0, callback);
    });
};
exports.addPlaylistToPlaylist = addPlaylistToPlaylist;



/**
 *
 * @param {string|int} channel
 * @param songId
 * @param {"default"|"request"} playlist
 * @param callback
 */
const removeFromPlaylist = (channel, songId, playlist, callback) => {
    Helper.getChannelIdFromIdOrName(channel, channelId => {
        const playlistId = playlist === "default" ? 1 : 0;
        g_database.delete("songrequest_playlists", {
            channelID: channelId,
            youtubeID: songId,
            autoplayPlaylist: playlistId
        }, callback);
    });
};
exports.removeFromPlaylist = removeFromPlaylist;

/**
 *
 * @param {string|int} channel
 * @param {"default"|"request"} playlist
 * @param callback
 */
const clearPlayList = (channel, playlist, callback) => {
    Helper.getChannelIdFromIdOrName(channel, channelId => {
        const playlistId = playlist === "default" ? 1 : 0;
        g_database.delete("songrequest_playlists", {
            channelID: channelId,
            autoplayPlaylist: playlistId
        }, callback);

    });
};
exports.clearPlayList = clearPlayList;

/**
 *
 * @param {string|int} channel
 * @param {"default"|"request"} playlist
 * @param callback
 */
const getPlaylist = (channel, playlist, callback) => {
    Helper.getChannelIdFromIdOrName(channel, channelId => {
        const playlistId = playlist === "default" ? 1 : 0;
        g_database.getTable("songrequest_playlists", {
            channelID: channelId,
            autoplayPlaylist: playlistId
        }, callback, "ORDER BY requestedAt ASC");
    });
};
exports.getPlaylist = getPlaylist;


/**
 * get Next Song
 * @param {string|int} channel
 * @param callback
 */
const getNextSong = (channel, callback) => {
    Helper.getChannelIdFromIdOrName(channel, channelId => {
        getPlaylist(channelId, "request", (err, data) => {
            if (err) {
                return callback(err);
            }
            if (data.length > 0) {
                return callback(null, data[0]);
            } else {
                getPlaylist(channelId, "default", (errDefault, dataDefault) => {
                    if (errDefault) {
                        return callback(errDefault);
                    }
                    if (dataDefault.length > 0) {
                        return callback(null, dataDefault[Math.floor(Math.random()*dataDefault.length)]);
                    } else {
                        return callback(null, null);
                    }
                });
            }
        });
    });
};
exports.getNextSong = getNextSong;

/**
 * set song as current song
 * @param {string|int} channel
 * @param {string} songId
 * @param callback
 */
const setCurrentSong = (channel, songId, callback) => {
    Helper.getChannelIdFromIdOrName(channel, channelId => {
        g_database.update("songrequest_playlists", {played: 0}, {
            channelID: channelId,
            played: 1
        }, err => {
            if (err) {
                return callback(err);
            }

            return g_database.update("songrequest_playlists", {played: 1}, {
                channelID: channelId,
                youtubeID: songId
            }, callback);
        });
    });
};
exports.setCurrentSong = setCurrentSong;

const getCurrentSong = (channel, callback) => {
    Helper.getChannelIdFromIdOrName(channel, channelId => {
        g_database.getTable("songrequest_playlists", {
            channelID: channelId,
            played: 1
        }, (err, data) => {
            if (err) {
                callback(err);
            } else {
                if (data.length > 0) {
                    callback(null, data[0]);
                } else {
                    callback();
                }
            }
        });
    });
};
exports.getCurrentSong = getCurrentSong;

const removeCurrentSong = (channel, callback) => {
    getCurrentSong(channel, (err, data) => {
        if (!err && data) {
            removeFromPlaylist(channel, data.youtubeID, "request", callback);
        } else {
            callback(err);
        }
    });
};
exports.removeCurrentSong = removeCurrentSong;

const saveCurrentSong = (channel, callback) => {
    Helper.getChannelIdFromIdOrName(channel, channelId => {
        g_database.update("songrequest_playlists", {
            autoplayPlaylist: 1
        }, {
            channelID: channelId,
            played: 1
        }, callback);
    });
};
exports.saveCurrentSong = saveCurrentSong;

/**
 *
 * @param {string|int} channel
 * @param username
 * @param callback
 */
const addUserToBlacklist = (channel, username, callback) => {
    Helper.getChannelIdFromIdOrName(channel, channelId => {
        g_database.insert("songrequest_blacklist", {
            channelID: channelId,
            nameOrID: username,
            isSong: 0
        }, callback);
    });
};
exports.addUserToBlacklist = addUserToBlacklist;

/**
 *
 * @param {string|int} channel
 * @param username
 * @param callback
 */
const isUserOnBlacklist = (channel, username, callback) => {
    Helper.getChannelIdFromIdOrName(channel, channelId => {
        g_database.exist("songrequest_blacklist", {
            channelID: channelId,
            nameOrID: username,
            isSong: 0
        }, callback);
    });
};
exports.isUserOnBlacklist = isUserOnBlacklist;

/**
 *
 * @param {string|int} channel
 * @param username
 * @param callback
 */
const removeUserFromBlacklist = (channel, username, callback) => {
    Helper.getChannelIdFromIdOrName(channel, channelId => {
        g_database.delete("songrequest_blacklist", {
            channelID: channelId,
            nameOrID: username,
            isSong: 0
        }, callback);
    });
};
exports.removeUserFromBlacklist = removeUserFromBlacklist;

/**
 *
 * @param {string|int} channel
 * @param songId
 * @param callback
 */
const addSongToBlacklist = (channel, songId, callback) => {
    Helper.getChannelIdFromIdOrName(channel, channelId => {
        request('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + songId + '&key=' + g_configs.youtube.ytDataAuthKey, (error, response, body) => {
            if (!error) {
                body = JSON.parse(body);
                if (body.items.length > 0) {
                    const songTitle = body.items[0].snippet.title + ' (YT-Channel: ' + body.items[0].snippet.channelTitle + ')';
                    g_database.insert("songrequest_blacklist", {
                        channelID: channelId,
                        nameOrID: songId,
                        isSong: 1,
                        title: songTitle
                    }, callback);
                } else {
                    g_database.insert("songrequest_blacklist", {
                        channelID: channelId,
                        nameOrID: songId,
                        isSong: 1,
                        title: "unknown"
                    }, callback);
                }
            } else {
                g_database.insert("songrequest_blacklist", {
                    channelID: channelId,
                    nameOrID: songId,
                    isSong: 1,
                    title: "unknown"
                }, callback);
            }
        });
    });
};
exports.addSongToBlacklist = addSongToBlacklist;

/**
 *
 * @param {string|int} channel
 * @param songId
 * @param callback
 */
const isSongOnBlacklist = (channel, songId, callback) => {
    Helper.getChannelIdFromIdOrName(channel, channelId => {
        g_database.exist("songrequest_blacklist", {
            channelID: channelId,
            nameOrID: songId,
            isSong: 1
        }, callback);
    });
};
exports.isSongOnBlacklist = isSongOnBlacklist;

/**
 *
 * @param {string|int} channel
 * @param songID
 * @param callback
 */
const removeSongFromBlacklist = (channel, songID, callback) => {
    Helper.getChannelIdFromIdOrName(channel, channelId => {
        g_database.delete("songrequest_blacklist", {
            channelID: channelId,
            nameOrID: songID,
            isSong: 1
        }, callback);
    });
};
exports.removeSongFromBlacklist = removeSongFromBlacklist;


