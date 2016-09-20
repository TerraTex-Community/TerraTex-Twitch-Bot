/**
 * Created by C5217649 on 27.01.2016.
 */
"use strict";
let fs = require("fs");
let path = require("path");
let content = "" + fs.readFileSync(path.resolve(__root, "views","pagepart","level_drawLevels.hbs"));
let hogan = require("handlebars");

class PageSettings {
    static loadPageSockets(clientSocket) {
        clientSocket.on("getScriptedCommandExample", function (data) {
            g_database.getTable("cmds_scripted_examples", {ID: data.id}, function (err, result) {
                if (!err && result.length > 0) {
                    let fileName = result[0].file;
                    fs.readFile(path.resolve(__root, "lua","examples", fileName), function (fileErr, fileResult) {
                        clientSocket.emit("sendExample", {content: fileResult.toString()});
                    });
                }
            });
        });

        clientSocket.on("deleteScriptedCommand", function (data) {
            let channelID = clientSocket.handshake.session.user.id;
            g_database.delete("cmds_scripted", {channelID: channelID, command: data}, function () {
                clientSocket.emit("notify", {
                    style: "success",
                    title: "Scriptbarer Command gelöscht",
                    text: "Der Scriptbare Command \"" + data + "\" wurde erfolgreich gelöscht."
                });

                //set new data object on existing channel
                if (g_bot._channelConnectors.hasOwnProperty(clientSocket.handshake.session.user.name)) {
                    let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
                    channel.scriptedCommands.removeCommand(data);
                }
                clientSocket.emit("reloadPage", {});
            });
        });

        clientSocket.on("getScriptedCommandCode", function (data) {
            let channelID = clientSocket.handshake.session.user.id;
            g_database.getTable("cmds_scripted", {command: data, channelID: channelID}, function (err, result) {
                if (!err && result.length > 0) {
                    clientSocket.emit("sendScriptedCommandCode", result[0]);
                } else {
                    g_logger.socket.error(err);
                    clientSocket.emit("notify", {
                        style: "danger",
                        title: "Error",
                        text: "Es ist ein Fehler beim Laden des Commands aufgetreten."
                    });
                }
            });
        });

        clientSocket.on("getScriptedCommandLog", function(){
            let channelName = clientSocket.handshake.session.user.name;
            fs.exists("tmp/channelLogs/" + channelName + ".log", function(result) {
               if(result) {
                   fs.readFile(path.resolve(__root, "tmp", "channelLogs", channelName + ".log"), function(err, fileContent) {
                       clientSocket.emit("recieveCommandLog", fileContent.toString());
                   });
               } else {
                   clientSocket.emit("recieveCommandLog", "");
               }
            });

        });
        clientSocket.on("clearScriptedCommandLog", function(){
            let channelName = clientSocket.handshake.session.user.name;
            fs.exists(path.resolve(__root, "tmp", "channelLogs", channelName + ".log"), function(result) {
                if (result) {
                    fs.unlink(path.resolve(__root, "tmp","channelLogs", channelName + ".log"));
                }
            });

        });

        clientSocket.on("saveScriptedCommand", function (data) {
            let channelID = clientSocket.handshake.session.user.id;
            g_database.exist("cmds_scripted", {command: data.command, channelID: channelID}, function (dbErr, result) {
                if (result) {
                    // does not exist and can be created
                    g_database.update("cmds_scripted", {
                        restrictedTo: data.restrictedTo,
                        code: data.code,
                        save: data.save,
                        description: data.description,
                        paramDescription: data.paramDescription
                    }, {
                        channelID: channelID,
                        command: data.command
                    }, function (err) {
                        if (!err) {
                            clientSocket.emit("notify", {
                                style: "success",
                                title: "Scriptbarer Command gespeicher",
                                text: "Der Scriptbare Command \"" + data.command + "\" wurde erfolgreich gespeichert."
                            });
                            //set new data object on existing channel
                            if (g_bot._channelConnectors.hasOwnProperty(clientSocket.handshake.session.user.name)) {
                                let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
                                channel.scriptedCommands.addOrReloadCommand(data.command, data);
                            }
                            clientSocket.emit("reloadPage", {});

                        } else {
                            g_logger.socket.error(err);
                            clientSocket.emit("notify", {
                                style: "danger",
                                title: "Error",
                                text: "Es ist ein Fehler beim speichern des Commands aufgetreten."
                            });
                        }
                    });
                } else {
                    // exist show error
                    clientSocket.emit("notify", {
                        style: "danger",
                        title: "Error",
                        text: "Es existiert kein scriptbarer Command \"" + data.command + "\"."
                    });
                }
            });
        });

        clientSocket.on("createScriptedCommand", function (data) {
            let channelID = clientSocket.handshake.session.user.id;
            g_database.exist("cmds_scripted", {command: data.command, channelID: channelID}, function (dbErr, result) {
                if (!result) {
                    // does not exist and can be created
                    g_database.insert("cmds_scripted", {
                        channelID: channelID,
                        command: data.command,
                        restrictedTo: data.restrictedTo,
                        code: data.code,
                        save: data.save,
                        description: data.description
                    }, function (err) {
                        if (!err) {
                            //set new data object on existing channel
                            if (g_bot._channelConnectors.hasOwnProperty(clientSocket.handshake.session.user.name)) {
                                let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
                                channel.scriptedCommands.addOrReloadCommand(data.command, data);
                            }

                            clientSocket.emit("notify", {
                                style: "success",
                                title: "Scriptbarer Command erstellt",
                                text: "Der Scriptbare Command \"" + data.command + "\" wurde erfolgreich erstellt."
                            });
                            clientSocket.emit("reloadPage", {});

                        } else {
                            g_logger.socket.error(err);
                            clientSocket.emit("notify", {
                                style: "danger",
                                title: "Error",
                                text: "Es ist ein Fehler beim erstellen des Commands aufgetreten."
                            });
                        }
                    });
                } else {
                    // exist show error
                    clientSocket.emit("notify", {
                        style: "danger",
                        title: "Error",
                        text: "Es existier bereits ein Scriptbarer Command \"" + data.command + "\"."
                    });
                }
            });
        });
    }

    static sendPage(clientSocket, template) {
        if (clientSocket.handshake.session.user) {
            let channelID = clientSocket.handshake.session.user.id;

            g_database.getTable("cmds_scripted_examples", {}, function (dbErr, examples) {

                let filteredExampleList = [];
                let systemVersion = require('./../../../package.json').version;

                for (let i = 0; i < examples.length; i++) {

                    let compareVersions = require("compare-versions");

                    let versionCompare = compareVersions((systemVersion + "-build." + parseInt(g_build)), (examples[i].startingVersion).toLowerCase());
                    if (versionCompare === 1 || versionCompare === 0) {
                        filteredExampleList.push(examples[i]);
                    }
                }

                g_database.getTable("cmds_scripted", {channelID: channelID}, function (err, result) {
                    clientSocket.emit("loadPage", {
                        content: template({
                            examples: filteredExampleList,
                            commands: result
                        }), page: "scriptedCommands"
                    });
                });
            });
        }
    }
}

module.exports = PageSettings;