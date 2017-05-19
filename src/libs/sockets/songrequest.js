/**
 * Created by C5217649 on 18.05.2017.
 */
const srHelper = require("./../SongRequest.helper");

module.exports = (clientSocket) => {
    clientSocket.on("sr_getNextSong", () => {
        let channelID = clientSocket.handshake.session.user.id;
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

                        if (g_bot._channelConnectors.hasOwnProperty(clientSocket.handshake.session.user.name)) {
                            let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];

                            let output = channel.text.get("songrequest.play", {
                                title: data.title,
                                fromUser: data.requestedBy
                            });
                            channel._client.say(channel._channelName, output);
                        }
                    }
                });
            }
        });
    });

    clientSocket.on("sr_blacklistSong", () => {
        let channelID = clientSocket.handshake.session.user.id;
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
        let channelID = clientSocket.handshake.session.user.id;
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
        let channelID = clientSocket.handshake.session.user.id;
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

