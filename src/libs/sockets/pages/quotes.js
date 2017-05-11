/**
 * Created by Colin on 03.01.2016.
 */
"use strict";

class PageQuotesSettings {
    static loadPageSockets(clientSocket) {
        clientSocket.on("saveQuotesSettings", function (data) {

            if (g_bot._channelConnectors.hasOwnProperty(clientSocket.handshake.session.user.name)) {
                let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
                // change channel live

                channel.quote._settings = {
                    enabled: data.quoteStatus ? 1 : 0
                };

            }

            g_database.update("quotes_settings", {
                    enabled: data.quoteStatus ? 1 : 0
                },
                {channelID: clientSocket.handshake.session.user.id}, function () {
                    clientSocket.emit("notify", {
                        style: "success",
                        title: "Einstellungen gespeichert",
                        text: "Die Quote/Zitat Einstellungen wurden gespeichert."
                    });
                });
        });
    }

    static sendPage(clientSocket, template) {
        let channelID = clientSocket.handshake.session.user.id;
        let sql = "SELECT * FROM quotes_settings WHERE channelID = :id";
        g_database.query(sql, {id: channelID}, function (err, result) {
            let context = {
                quoteStatus: result[0].enabled === 1
            };
            clientSocket.emit("loadPage", {content: template(context), page: "quotes"});

        });
    }
}

module.exports = PageQuotesSettings;
