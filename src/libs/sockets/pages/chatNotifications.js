/**
 * Created by Colin on 03.01.2016.
 */
"use strict";

class PageChatNotifications {
    static loadPageSockets(clientSocket) {
        clientSocket.on("saveFollowerAlert", function (data) {
            if (g_bot._channelConnectors.hasOwnProperty(clientSocket.handshake.session.user.name)) {
                let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
                channel._settings.chatNotifications.followerAlert = data.active ? 1 : 0;
                channel.text.set("notifications.new_follower", data.text);
            }

            g_database.update("chat_notifications", {followerAlert: data.active ? 1 : 0},
                {channelID: clientSocket.handshake.session.user.id}, function(err){
                    if (!err) {
                        clientSocket.emit("notify", {
                            style: "success",
                            title: "Einstellungen gespeichert",
                            text: "Die Einstellungen zur Follower Notification wurden gespeichert."
                        });
                    } else {
                        console.error(err);

                        clientSocket.emit("notify", {
                            style: "danger",
                            title: "Fehler",
                            text: "Beim Speichern der Einstellungen zur Follower Notification ist ein Fehler aufgetreten."
                        });
                    }
                });
        });

        clientSocket.on("saveChatJoinAlert", function (data) {
            if (g_bot._channelConnectors.hasOwnProperty(clientSocket.handshake.session.user.name)) {
                let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
                channel._settings.chatNotifications.chatJoinAlert = data.active ? 1 : 0;
                channel.text.set("notifications.new_chatter", data.text);
                channel._settings.chatNotifications.chatJoinTarget = data.target;
            }

            g_database.update("chat_notifications", {chatJoinAlert: data.active ? 1 : 0, chatJoinTarget: data.target},
                {channelID: clientSocket.handshake.session.user.id}, function(err){
                    if (!err) {

                        clientSocket.emit("notify", {
                            style: "success",
                            title: "Einstellungen gespeichert",
                            text: "Die Einstellungen zur Chat Join Notification wurden gespeichert."
                        });
                    } else {
                        console.error(err);

                        clientSocket.emit("notify", {
                            style: "danger",
                            title: "Fehler",
                            text: "Beim Speichern der Einstellungen zur  Chat Join Notification ist ein Fehler aufgetreten."
                        });
                    }
                });
        });
    }

    static sendPage(clientSocket, template) {
        let channelID = clientSocket.handshake.session.user.id;
        let sql = "SELECT * FROM chat_notifications WHERE channelID = :id";
        g_database.query(sql, {id: channelID}, function (err, result) {
            let textFile = require("../../channelsystems/TextHandler.js");
            let texts = new textFile(channelID, true);
            let context = {
                followerText: texts.get("notifications.new_follower"),
                followerAlert: result[0].followerAlert !== 0,
                chatJoinAlert: result[0].chatJoinAlert !== 0,
                chatJoinMessage: texts.get("notifications.new_chatter"),
                chatJoinTarget: result[0].chatJoinTarget,
                chatJoinTargets: {
                    chat: result[0].chatJoinTarget.toLowerCase() === "chat",
                    streamer: result[0].chatJoinTarget.toLowerCase() === "streamer"
                }
            };

            clientSocket.emit("loadPage", {content: template(context), page: "chatNotifications"});
        });
    }
}

module.exports = PageChatNotifications;