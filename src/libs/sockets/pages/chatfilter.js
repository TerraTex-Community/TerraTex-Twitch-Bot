/**
 * Created by C5217649 on 11.03.2016.
 */
"use strict";

class PageSettings {
    static loadPageSockets(clientSocket) {
        clientSocket.on("onSaveChatFilterBadWordSettings", function (data) {
            if (g_bot._channelConnectors.hasOwnProperty(clientSocket.handshake.session.user.name)) {
                let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
                channel.chatFilter.setSettings(data);
            }

            g_database.update("chatfilter", data, {channelID: clientSocket.handshake.session.user.id}, function (err) {
                if (!err) {
                    clientSocket.emit("notify", {
                        style: "success",
                        title: "Einstellungen gespeichert",
                        text: "Die Einstellungen zum Bad-Word-Filter wurden gespeichert."
                    });
                }
            });

        });
        clientSocket.on("onSaveChatFilterAdSettings", function (data) {
            if (g_bot._channelConnectors.hasOwnProperty(clientSocket.handshake.session.user.name)) {
                let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
                channel.chatFilter.setSettings(data);
            }

            g_database.update("chatfilter", data, {channelID: clientSocket.handshake.session.user.id}, function (err) {
                if (!err) {
                    clientSocket.emit("notify", {
                        style: "success",
                        title: "Einstellungen gespeichert",
                        text: "Die Einstellungen zum Werbefilter wurden gespeichert."
                    });
                }
            });
        });
        clientSocket.on("getBadWords", function () {
            let channelId = clientSocket.handshake.session.user.id;
            g_database.getTable("chatfilter_custom_badwords", {channelID: channelId}, function(err, result) {
               clientSocket.emit("sendBadWords", result);
            });
        });

        clientSocket.on("getADWhiteList", function () {
            let channelId = clientSocket.handshake.session.user.id;
            g_database.getTable("chatfilter" ,{channelID: channelId}, function(err, result) {
                clientSocket.emit("sendADWhiteList", JSON.parse(result[0].adExclude));
            });
        });

        clientSocket.on("saveBadWords", function (data) {
            let channelId = clientSocket.handshake.session.user.id;

            g_database.delete("chatfilter_custom_badwords", {channelID: channelId}, function (err) {
                if (!err) {
                    let length = data.badwords.length;
                    for (let i = 0; i < length; i++) {
                        data.badwords[i].channelID = channelId;
                    }

                    g_database.multiInsert("chatfilter_custom_badwords", [
                        "channelID", "description", "regex"
                    ], data.badwords, function () {
                        clientSocket.emit("notify", {
                            style: "success",
                            title: "BadWords",
                            text: "Die Änderungen an der Badwordliste wurden gespeichert."
                        });

                        if (g_bot._channelConnectors.hasOwnProperty(clientSocket.handshake.session.user.name)) {
                            let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
                            channel.chatFilter._filter.badWords.reloadBadWords();
                        }
                    });
                }
            });
        });

        clientSocket.on("saveAdWhiteList", function (data) {
            let channelId = clientSocket.handshake.session.user.id;
            let save = JSON.stringify(data.domains);

            g_database.update("chatfilter", {adExclude: save}, {channelID: channelId}, function() {
                clientSocket.emit("notify", {
                    style: "success",
                    title: "Advertising Whitelist",
                    text: "Die Änderungen an der Advertising-Whitelist wurden gespeichert."
                });

                if (g_bot._channelConnectors.hasOwnProperty(clientSocket.handshake.session.user.name)) {
                    let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
                    channel.chatFilter._filter.advertising.setExclude(data.domains);
                }
            });

        });


    }

    static sendPage(clientSocket, template) {
        if (clientSocket.handshake.session.user) {
            let channel = clientSocket.handshake.session.user.id;
            g_database.getTable("chatfilter", {channelID: channel}, function (err, result) {

                clientSocket.emit("loadPage", {
                    content: template(result[0]), page: "chatfilter"
                });

            });
        }
    }
}

module.exports = PageSettings;
