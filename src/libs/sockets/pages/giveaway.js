/**
 * Created by Colin on 03.01.2016.
 */
"use strict";
const path = require("path");

class PageGiveAway {
    static loadPageSockets(clientSocket) {
        clientSocket.on("startGiveAway", function (data){
            let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
            channel.giveaway._active = true;
            channel.giveaway._neededPoints = data.points;
            channel.giveaway._pointOption = data.option;
            channel.giveaway._registeredSocket = clientSocket;

            let output = channel.text.get("giveAway.start_" + data.option,{
                points: data.points
            });
            channel._client.say(channel._channelName, output);

            PageGiveAway.resendPage(clientSocket);
        });

        clientSocket.on("sendMeGiveAwayUsers", function(){
            let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
            channel.giveaway.resendUserList();
        });

        clientSocket.on("GiveAwayWinner", function(data){
            let channelName = clientSocket.handshake.session.user.name;
            let channel = g_bot._channelConnectors[channelName];
            channel.giveaway._winner = data.winner;

            g_twitchAPI.getUserFollowsChannel(data.winner, channelName, function (apiFollowErr, apiFollowResult) {
                if (apiFollowErr) {
                    clientSocket.emit("sendWinnerIsFollower", {
                        isFollower: !!apiFollowResult.created_at
                    });
                }
            });
        });

        clientSocket.on("closeGiveAway", function(){
            let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
            channel.giveaway.closeGiveAway();
            PageGiveAway.resendPage(clientSocket);
        });

        clientSocket.on("stopGiveAway", function(){
            let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
            channel.giveaway.cancelGiveAway();
            PageGiveAway.resendPage(clientSocket);
        });
    }

    static resendPage(clientSocket) {
        let fs = require ("fs");
        const content = "" + fs.readFileSync(path.resolve(__root, "views", "pages", "giveaway.hbs"));
        const hogan = require("handlebars");
        const template = hogan.compile(content);
        PageGiveAway.sendPage(clientSocket, template);
    }

    static sendPage(clientSocket, template) {
        if (clientSocket.handshake.session.user) {
            let sendObject = {
                showGiveAway: false
            };


            //set new data object on existing channel
            if (g_bot._channelConnectors.hasOwnProperty(clientSocket.handshake.session.user.name)) {
                let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
                sendObject.showGiveAway = true;
                sendObject.activeGiveAway = channel.giveaway._active;
                sendObject.neededPoints = channel.giveaway._neededPoints;
                sendObject.pointOption = channel.giveaway._pointOption;

                if (sendObject.activeGiveAway) {
                    channel.giveaway._registeredSocket = clientSocket;
                }
                let users = channel.giveaway._users;
                sendObject.users = [];
                for (let name in users) {
                    if (users.hasOwnProperty(name)) {
                        sendObject.users.push(users[name]);
                    }
                }
            }

            clientSocket.emit("loadPage", {content: template(sendObject), page: "giveaway"});

        }
    }
}

module.exports = PageGiveAway;
