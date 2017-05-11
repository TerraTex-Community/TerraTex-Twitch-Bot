/**
 * Created by Colin on 03.01.2016.
 */
"use strict";

class PageSettings {
    static loadPageSockets(clientSocket) {
        clientSocket.on("saveStrings", function (data) {
            if (g_bot._channelConnectors.hasOwnProperty(clientSocket.handshake.session.user.name)) {
                let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
                let length = data.strings.length;
                for (let i = 0; i < length; i++) {
                    channel.text.set(data.cat + "." + data.strings[i].stringKey, data.strings[i].text);
                }
            } else {
                let textFile = require("../../channelsystems/TextHandler.js");
                let channelID = clientSocket.handshake.session.user.id;
                new textFile(channelID, true, function() {
                    let length = data.strings.length;
                    for (let i = 0; i < length; i++) {
                        this.set(data.cat + "." + data.strings[i].stringKey, data.strings[i].text);
                    }
                });
            }

            clientSocket.emit("notify", {
                style: "success",
                title: "Texte gespeichert",
                text: "Die neuen Texte wurden gespeichert."
            });
        });
    }

    static sendPage(clientSocket, template) {
        if (clientSocket.handshake.session.user) {
            let channelID = clientSocket.handshake.session.user.id;

            let textFile = require("../../channelsystems/TextHandler.js");
            new textFile(channelID, true, function(){
                clientSocket.emit("loadPage", {content: template({data: this._hogan}), page: "text"});
            });
        }
    }
}

module.exports = PageSettings;
