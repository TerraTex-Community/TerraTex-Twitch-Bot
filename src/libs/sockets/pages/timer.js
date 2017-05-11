/**
 * Created by Colin on 03.01.2016.
 */
"use strict";

class PageSettings {
    static loadPageSockets(clientSocket) {
        clientSocket.on("editTimer", function (data) {
            let channelID = clientSocket.handshake.session.user.id;

            g_database.getTable("timer", {
                channelID: channelID,
                id: data
            }, function (err, result) {
                if (err || result.length !== 1) {
                    clientSocket.emit("notify", {
                        style: "danger",
                        title: "Error",
                        text: "Beim Laden der Daten zum Bearbeiten des Timers ist ein Fehler aufgetreten."
                    });
                    console.error("timer.js: ", err);
                } else {
                    clientSocket.emit("sendTimerData", result[0]);
                }
            });
        });

        clientSocket.on("saveTimer", function (data) {
            let channelID = clientSocket.handshake.session.user.id;
            let channel = clientSocket.handshake.session.user.name;

            g_database.update("timer", {
                description: data.timerDesc,
                sendRandom: data.timerOrder,
                minutes: data.timerTime,
                messages: JSON.stringify(data.messages),
                afterMessages: data.timerAfterMessages,
                afterMessagesType: data.timerAfterMessagesType,
                onlyIfStreaming: data.onlyIfStreaming
            }, {
                channelID: channelID,
                id: data.timerId
            }, function (err) {
                if (err) {
                    clientSocket.emit("notify", {
                        style: "danger",
                        title: "Error",
                        text: "Beim Speichern des Timers ist ein Fehler aufgetreten."
                    });
                    console.error("timer.js: ", err);
                } else {
                    clientSocket.emit("notify", {
                        style: "success",
                        title: "Timer gespeichert",
                        text: "Die Änderungen am Timer wurden gespeichert."
                    });

                    if (g_bot._channelConnectors.hasOwnProperty(channel)) {
                        let channelRunner = g_bot._channelConnectors[channel];
                        channelRunner.timer.newTimer(data.timerId);
                    }

                    clientSocket.emit("reloadPage", {});
                }
            });


        });

        clientSocket.on("deleteTimer", function (data) {

            let channelID = clientSocket.handshake.session.user.id;
            let channel = clientSocket.handshake.session.user.name;

            g_database.delete("timer", {
                channelID: channelID,
                id: data
            }, function (err) {
                if (err) {
                    clientSocket.emit("notify", {
                        style: "danger",
                        title: "Error",
                        text: "Beim Löschen des Timers ist ein Fehler aufgetreten."
                    });
                    console.error("timer.js: ", err);
                } else {
                    clientSocket.emit("notify", {
                        style: "success",
                        title: "Timer gelöscht",
                        text: "Der neue Timer wurde gelöscht."
                    });

                    if (g_bot._channelConnectors.hasOwnProperty(channel)) {
                        let channelRunner = g_bot._channelConnectors[channel];
                        channelRunner.timer.deleteTimer(data);
                    }

                    clientSocket.emit("reloadPage", {});
                }
            });
        });

        clientSocket.on("timerGetCommandList", function () {
            let commandHandler = require("./../../channelsystems/CommandHandler");
            let channelName = clientSocket.handshake.session.user.name;
            commandHandler.getAllCommandsOfChannel(channelName, false, false, false, function(err, commands) {
                let list = [];
                for (let i = 0; i < commands.length; i++) {
                    list.push("!" + commands[i].command + (commands[i].params ? " " + commands[i].params  : ""));
                }

                clientSocket.emit("timerCommandList", list);
            });
        });

        clientSocket.on("createNewTimer", function (data) {

            let channel = clientSocket.handshake.session.user.name;
            let channelID = clientSocket.handshake.session.user.id;

            g_database.insert("timer", {
                channelID: channelID,
                description: data.timerDesc,
                sendRandom: data.timerOrder,
                minutes: data.timerTime,
                messages: JSON.stringify(data.messages),
                afterMessages: data.timerAfterMessages,
                afterMessagesType: data.timerAfterMessagesType,
                onlyIfStreaming: data.onlyIfStreaming
            }, function(err, id){
                if(!err) {
                    clientSocket.emit("notify", {
                        style: "success",
                        title: "Timer erstellt",
                        text: "Der neue Timer wurde erstellt."
                    });

                    if (g_bot._channelConnectors.hasOwnProperty(channel)) {
                        let channelRunner = g_bot._channelConnectors[channel];
                        channelRunner.timer.newTimer(id);
                    }

                    clientSocket.emit("reloadPage", {});
                } else {
                    clientSocket.emit("notify", {
                        style: "danger",
                        title: "Error",
                        text: "Beim erstellen des Timers ist ein Fehler aufgetreten."
                    });
                    console.error("timer.js: ", err);
                }
            });
        });
    }

    static sendPage(clientSocket, template) {
        if (clientSocket.handshake.session.user) {
            let channelID = clientSocket.handshake.session.user.id;
            g_database.getTable("timer", {channelID: channelID}, function (err, result) {
                clientSocket.emit("loadPage", {
                    content: template({
                        timers: result
                    }), page: "timer"
                });
            });
        }
    }
}

module.exports = PageSettings;
