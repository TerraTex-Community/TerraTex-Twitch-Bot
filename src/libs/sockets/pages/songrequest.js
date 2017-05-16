/**
 * Created by Colin on 03.01.2016.
 */
"use strict";

class SongRequest {
    static loadPageSockets(clientSocket) {
        clientSocket.on("addAlias", function (data) {
            let channelID = clientSocket.handshake.session.user.id;
            let channelName = clientSocket.handshake.session.user.name;
        });
    }

    static sendPage(clientSocket, template) {
        if (clientSocket.handshake.session.user) {
            let channelID = clientSocket.handshake.session.user.id;
            let channelName = clientSocket.handshake.session.user.name;

            g_database.getTable("cmds_aliases", {channelID: channelID}, function(dberror, aliases){
                clientSocket.emit("loadPage", {content: template({}), page: "songrequest"});
            });
        }
    }
}

module.exports = SongRequest;
