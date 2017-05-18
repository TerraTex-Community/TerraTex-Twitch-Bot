/**
 * Created by C5217649 on 18.05.2017.
 */
const srHelper = require("./../SongRequest.helper");

module.exports = (clientSocket) => {
    let channelID = clientSocket.handshake.session.user.id;

    clientSocket.on("sr_getNextSong", () => {
        srHelper.removeCurrentSong(channelID, (err) => {
            if (!err) {
                srHelper.getNextSong(channelID, (gnsErr, data) => {
                    if (!gnsErr && data) {
                        srHelper.setCurrentSong(channelID, data.youtubeID);
                        clientSocket.emit("sr_setSongInPlayer", {
                            id: data.youtubeID,
                            title: data.title,
                            requester: data.requestedBy
                        });
                    }
                });
            }
        });
    });

    clientSocket.on("sr_blacklistSong", () => {
        srHelper.blacklistCurrentSong(channelID, (err) => {
            if (!err) {
                clientSocket.emit("notify", {
                    style: "success",
                    title: "Blacklist",
                    text: "Der aktuelle Song wurde der Blacklist hinzugefügt."
                });
            }
        });
    });

    clientSocket.on("sr_blacklistRequester", () => {
        srHelper.blacklistCurrentRequester(channelID, (err) => {
            if (!err) {
                clientSocket.emit("notify", {
                    style: "success",
                    title: "Blacklist",
                    text: "Der Requester des aktuellen Songs wurde der Blacklist hinzugefügt."
                });
            }
        });
    });

    clientSocket.on("sr_saveSong", () => {
        srHelper.saveCurrentSong(channelID, (err) => {
            if (!err) {
                clientSocket.emit("notify", {
                    style: "success",
                    title: "Default Playlist",
                    text: "Der aktuelle Song wurde der default Playlist hinzugefügt"
                });
            }
        });
    });
};

