/**
 * Created by Colin on 03.01.2016.
 */
"use strict";

class SongRequest {
    static loadPageSockets(clientSocket) {
        clientSocket.on("addAlias", function (data) {
            let channelID = clientSocket.handshake.session.user.id;
        });
    }

    static sendPage(clientSocket, template) {
        if (clientSocket.handshake.session.user) {
            let channelID = clientSocket.handshake.session.user.id;

            g_database.getTable("songrequest_settings", {channelID: channelID}, function(dberror, settings){
                g_database.getTable("songrequest_playlists", {channelID: channelID}, function(plerror, playlistEntries) {
                    g_database.getTable("songrequest_blacklist", {channelID: channelID}, function(blerror, blacklistEntries) {
                        clientSocket.emit("loadPage", {content: template({
                            settings: settings[0],
                            playlists: playlistEntries,
                            blacklists: blacklistEntries
                        }), page: "songrequest"});
                    });
                });
            });
        }
    }
}

module.exports = SongRequest;
