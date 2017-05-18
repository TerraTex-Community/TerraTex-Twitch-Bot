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

};

