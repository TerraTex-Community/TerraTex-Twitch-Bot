/**
 * Created by C5217649 on 27.01.2016.
 */
"use strict";
let fs = require("fs");
let content = "" + fs.readFileSync("views/pagepart/level_drawLevels.hbs");
let hogan = require("handlebars");

class PageSettings {
    static loadPageSockets(clientSocket) {
        PageSettings.clientSocket = clientSocket;
        clientSocket.on("saveLevelSettings", function (data) {
            let channelID = clientSocket.handshake.session.user.id;
            g_database.update("viewer_ranks_configs", {
                enabled: data.enabled ? 1 : 0,
                defaultRank: data.defaultLevel
            }, {
                channelID: channelID
            }, function(){
                PageSettings.updateChannel();

                clientSocket.emit("notify", {
                    style: "success",
                    title: "Neue Einstellungen gespeichert",
                    text: "Die Einstellungen des Levelsystems wurden gespeichert."
                });
            });
        });

        clientSocket.on("addNewLevel", function(data){
            let channelID = clientSocket.handshake.session.user.id;
            g_database.insert("viewer_ranks", {
                channelID: channelID,
                levelHours: data.hours,
                levelName: "Level für " + data.hours + "Stunden"
            }, function(){
                PageSettings.updateChannel();
                clientSocket.emit("notify", {
                    style: "success",
                    title: "Neues Level angelegt",
                    text: "Für das Levelsystem wurde ein neues Level ab " + data.hours + " Stunden angelegt"
                });

                PageSettings.rerender();

            });
        });

        clientSocket.on("removeLevel", function(data){
            let channelID = clientSocket.handshake.session.user.id;
            g_database.query("DELETE FROM viewer_ranks WHERE channelID = :channelID AND ID = :id", {
                channelID: channelID,
                id: data.id
            }, function(){
                PageSettings.updateChannel();

                clientSocket.emit("notify", {
                    style: "success",
                    title: "Level gelöscht",
                    text: "Das gewünschte Level wurde gelöscht."
                });

                PageSettings.rerender();
            });
        });

        clientSocket.on("saveLevelNames", function(data){
            //build query
            let query = "UPDATE viewer_ranks SET levelName = \n CASE \n";
            let executeObject = {};
            let length = data.levels.length;
            for (let i = 0; i < length; i++) {
                query += ("WHEN ID = :id_" + i + " THEN :name_" + i + "\n");
                executeObject["id_" + i] = data.levels[i].id;
                executeObject["name_" + i] = data.levels[i].name;
            }
            query += "END \n";
            query += "WHERE channelID = :channelID";
            let channelID = clientSocket.handshake.session.user.id;
            executeObject.channelID = channelID;

            g_database.query(query, executeObject, function(){
                clientSocket.emit("notify", {
                    style: "success",
                    title: "Levelnamen",
                    text: "Die Neuen Levelbezeichnungen wurden gespeichert."
                });

                PageSettings.updateChannel();
            });

        });
    }

    static sendPage(clientSocket, template) {
        if (clientSocket.handshake.session.user) {
            let channelID = clientSocket.handshake.session.user.id;

            g_database.getTable("viewer_ranks", {channelID: channelID}, function(err, result){

                let subTemplate = hogan.compile(content);
                let levelsResult = subTemplate({"levels": result});

                g_database.getTable("viewer_ranks_configs", {channelID: channelID}, function(err2, result2){

                    clientSocket.emit("loadPage", {content: template({
                        levels: levelsResult,
                        levelEnabled: result2[0].enabled === 1,
                        defaultLevel: result2[0].defaultRank
                    }), page: "level"});
                });

            }, "ORDER BY levelHours ASC");
        }
    }

    static rerender(){
        let channelID = PageSettings.clientSocket.handshake.session.user.id;
        g_database.getTable("viewer_ranks", {channelID: channelID}, function(err, result){


            let subTemplate = hogan.compile(content);
            let levelsResult = subTemplate({"levels": result});

            PageSettings.clientSocket.emit("rerenderLevelTable", {levelTemplate: levelsResult});

        }, "ORDER BY levelHours ASC");
    }

    static updateChannel(){
        if (g_bot._channelConnectors.hasOwnProperty(PageSettings.clientSocket.handshake.session.user.name)) {
            let channel = g_bot._channelConnectors[PageSettings.clientSocket.handshake.session.user.name];
            channel.rankSystem.loadRanksSettings();
        }
    }
}

module.exports = PageSettings;