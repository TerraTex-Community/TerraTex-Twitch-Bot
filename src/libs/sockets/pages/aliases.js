/**
 * Created by Colin on 03.01.2016.
 */
"use strict";

class PageSettings {
    static loadPageSockets(clientSocket) {
        clientSocket.on("addAlias", function (data) {
            let channelID = clientSocket.handshake.session.user.id;
            let channelName = clientSocket.handshake.session.user.name;

            let commandHandler = require("../../channelsystems/CommandHandler");

            commandHandler.commandExsitsOnChannel(channelName, data.command, function(err, result) {
                if (!result) {
                    g_database.insert("cmds_aliases", {channelID: channelID, command: data.command, aliasOf: data.aliasOf }, function(){

                        if (g_bot._channelConnectors.hasOwnProperty(clientSocket.handshake.session.user.name)) {
                            let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
                            channel.command.addAlias(data.command, data.aliasOf);
                        }

                        clientSocket.emit("notify", {
                            style: "success",
                            title: "Alias hinzugefügt",
                            text: "Der neue Alias '" + data.command + "' für '" + data.aliasOf + "' wurde erstellt."
                        });
                        clientSocket.emit("reloadPage", {});
                    });
                } else {
                    clientSocket.emit("notify", {
                        style: "danger",
                        title: "Commandname ist bereits vergeben!",
                        text: "Es extistiert bereits ein Command '" + data.command + "'."
                    });
                }
            });

        });
        clientSocket.on("removeAlias", function (data) {
            let channelID = clientSocket.handshake.session.user.id;

            g_database.delete("cmds_aliases", {
                channelID: channelID,
                command: data.command
            }, function(err){
                if (!err) {

                    if (g_bot._channelConnectors.hasOwnProperty(clientSocket.handshake.session.user.name)) {
                        let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
                        channel.command.removeAlias(data.command);
                    }
                    clientSocket.emit("notify", {
                        style: "success",
                        title: "Alias gelöscht",
                        text: "Der Alias '" + data.command + "' wurde gelöscht."
                    });
                    clientSocket.emit("reloadPage", {});
                }
            });
        });
    }

    static sendPage(clientSocket, template) {
        if (clientSocket.handshake.session.user) {
            let channelID = clientSocket.handshake.session.user.id;
            let channelName = clientSocket.handshake.session.user.name;

            let cmdHandler = require("../../channelsystems/CommandHandler");
            cmdHandler.getAllCommandsOfChannel(channelName, true, true, true, function(error, commandObjects){
                g_database.getTable("cmds_aliases", {channelID: channelID}, function(dberror, aliases){
                    clientSocket.emit("loadPage", {content: template({commandToSelect: commandObjects, aliases: aliases}), page: "aliases"});
                });
            });

        }
    }
}

module.exports = PageSettings;
