/**
 * Created by Colin on 03.01.2016.
 */
"use strict";

class PageSettings {
    static loadPageSockets(clientSocket) {
        clientSocket.on("savePointsSettings", function (data) {

            // change data to valid data
            data.pointsPerMinute = Math.round(data.pointsPerMinute * 10) / 10;
            data.pointsPerMinuteInChat = Math.round(data.pointsPerMinuteInChat * 10) / 10;
            data.pointsEveryMinutes = Math.round(data.pointsEveryMinutes);
            data.pointsEveryMinutesInChat = Math.round(data.pointsEveryMinutesInChat);
            data.pointsEnabled = data.pointsEnabled ? 1 : 0;
            data.pointsGiveOnlyMods = data.pointsGiveOnlyMods ? 1 : 0;

            //set new data object on existing channel
            if (g_bot._channelConnectors.hasOwnProperty(clientSocket.handshake.session.user.name)) {
                let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
                channel.pointsSystem._settings = data;
            }

            //update database
            g_database.update("viewer_points_configs", data, {channelID: clientSocket.handshake.session.user.id}, function (err) {
                if (!err) {
                    clientSocket.emit("notify", {
                        style: "success",
                        title: "Points-Systemeinstellungen gespeichert",
                        text: "Die neuen Einstellungen wurden gespeichert."
                    });
                }
            });
        });
    }

    static sendPage(clientSocket, template) {
        if (clientSocket.handshake.session.user) {
            let channelID = clientSocket.handshake.session.user.id;

            g_database.getTable("viewer_points_configs", {channelID: channelID}, function (err, result) {
                clientSocket.emit("loadPage", {
                    content: template({
                        pointsActive: result[0].pointsEnabled === 1,
                        pointsPerMinute: result[0].pointsPerMinute,
                        pointsEveryMinutes: result[0].pointsEveryMinutes,
                        pointsPerMinuteInChat: result[0].pointsPerMinuteInChat,
                        pointsEveryMinutesInChat: result[0].pointsEveryMinutesInChat,
                        pointsGiveOnlyMods: result[0].pointsGiveOnlyMods === 1
                    }), page: "points"
                });
            });
        }
    }
}

module.exports = PageSettings;
