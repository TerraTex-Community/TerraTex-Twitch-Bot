/**
 * Created by Colin on 03.01.2016.
 */
"use strict";

class PageSettings {
    static loadPageSockets(clientSocket) {
        clientSocket.on("settings_customLogin", function (data) {
            var userName = data.loginName;
            var userOauthPass = data.oauthPass;

            if (userOauthPass.startsWith("oauth:") || (userOauthPass === "" && userName === "")) {
                let channel = clientSocket.handshake.session.user.name;
                if (g_bot._channelConnectors.hasOwnProperty(channel)) {
                    g_bot._channelConnectors[channel]._client.disconnect();
                    delete g_bot._channelConnectors[channel];
                }

                if (userName === "") {
                    // delete old Data
                    g_bot.createNewChannel(channel, null, (data.connectMessage ? 1 : 0));
                    g_database.update("channel", {customLoginData: null}, {channelName: channel});
                } else {
                    // save new Data
                    var loginData = {
                        login: userName,
                        password: userOauthPass
                    };
                    var loginString = g_helper.encrypt(JSON.stringify(loginData));
                    g_bot.createNewChannel(channel, loginString, (data.connectMessage ? 1 : 0));

                    g_database.update("channel", {customLoginData: loginString}, {channelName: channel});

                    clientSocket.emit("notify", {
                        style: "success",
                        title: "Neue Daten gespeichert",
                        text: "Die Zugangsdaten des Bottes wurden gespeichert."
                    });
                }

            } else {
                clientSocket.emit("notify", {
                    style: "danger",
                    title: "Fehler beim Speichern",
                    text: "Die Zugangsdaten des Bottes konnten nicht gespeichert werden, da das Passwort fehlerhaft ist."
                });
            }
        });

        clientSocket.on("settings_additionalOptions", function (data) {
            if (typeof data.connectMessage !== "undefined") {
                let channel = clientSocket.handshake.session.user.name;
                g_database.update("channel", {connectMessage: (data.connectMessage ? '1' : '0')}, {channelName: channel}, function () {
                    clientSocket.emit("notify", {
                        style: "success",
                        title: "Additional Options",
                        text: "Die Einstellungen wurden gespeichert."
                    });
                });
            }
        });
    }

    static sendPage(clientSocket, template) {
        if (clientSocket.handshake.session.user) {
            let channel = clientSocket.handshake.session.user.name;
            g_database.getTable("channel", {channelName: channel}, function (err, result) {
                let login = "";
                if (result[0].customLoginData) {
                    let loginStats = JSON.parse(g_helper.decrypt(result[0].customLoginData));
                    login = loginStats.login;
                }

                clientSocket.emit("loadPage", {
                    content: template({
                        botname: login,
                        connectmessage: result[0].connectMessage === 1
                    }), page: "settings"
                });

            });
        }
    }
}

module.exports = PageSettings;