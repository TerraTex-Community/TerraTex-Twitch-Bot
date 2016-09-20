/**
 * Created by Colin on 26.02.2016.
 */
"use strict";

class PageSettings {
    static loadPageSockets(clientSocket) {
        clientSocket.on("chatGames_saveRoulette", function(data){
            let channelID = clientSocket.handshake.session.user.id;
            let channelName = clientSocket.handshake.session.user.name;

            g_database.update("minigames", {roulette: JSON.stringify(data)}, {channelID: channelID}, function(err) {
                if (!err) {
                    if (g_bot._channelConnectors.hasOwnProperty(channelName)) {
                        g_bot._channelConnectors[channelName].chatGames.roulette.settings = data;
                    }

                    clientSocket.emit("notify", {
                        style: "success",
                        title: "Roulette",
                        text: "Die Einstellungen zum Pointsroulette wurden gespeichert."
                    });
                }
            });
        });
    }

    static sendPage(clientSocket, template) {
        if (clientSocket.handshake.session.user) {
            let channelID = clientSocket.handshake.session.user.id;

            let sql = "SELECT * FROM minigames WHERE channelID = :ID;";
            g_database.query(sql, {"ID": channelID}, function (err, result) {
                if (!err) {
                    let _rawSettings = result[0];
                    let _settings = {};

                    for (let key in _rawSettings) {
                        if (_rawSettings.hasOwnProperty(key)) {
                            if (key !== "ID" && key !== "channelID") {
                                try {
                                    _settings[key] = JSON.parse(_rawSettings[key]);
                                } catch (e) {
                                    _settings[key] = _rawSettings[key];
                                }
                            }
                        }
                    }
                    clientSocket.emit("loadPage", {content: template( _settings), page: "chatgames"});
                }
            });

        }
    }
}

module.exports = PageSettings;