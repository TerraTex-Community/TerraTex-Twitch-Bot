/**
 * Created by Colin on 26.12.2015.
 */
"use strict";

g_socket.on("connection", function(clientSocket){
    clientSocket.on("channelStateChange", function(state){
        let channel = clientSocket.handshake.session.user.name;
        if (state) {
            // request Login Data if exist
            g_database.getTable("channel", {channelName: channel}, function(err, result){
                if (!err) {
                    g_bot.createNewChannel(channel, result[0].customLoginData, result[0].connectMessage );
                    g_database.update("channel", {connected: 1}, {channelName: channel});
                }
            });
        } else {
            if (g_bot._channelConnectors.hasOwnProperty(channel)) {
                g_bot._channelConnectors[channel]._client.disconnect();
                delete g_bot._channelConnectors[channel];
                g_database.update("channel", {connected: 0}, {channelName: channel});
            }
        }
    });
    var fs = require("fs");

    clientSocket.on("getPage", function(name){
        // If user is not loggedin anymore don't excute any code
        if (!clientSocket.handshake.session.user) {
            return;
        }

        var content = "" + fs.readFileSync("views/pages/" + name + ".hbs");
        var hogan = require("handlebars");
        var template = hogan.compile(content);
        if (fs.existsSync("libs/sockets/pages/" + name + ".js")) {
            let pageHandler = require("./pages/" + name + ".js");

            if (typeof pageHandler.sendPage === "function") {
                pageHandler.sendPage(clientSocket, template);
            } else {
                clientSocket.emit("loadPage", {content: template(), page: name});
            }
        } else {
            clientSocket.emit("loadPage", {content: template(), page: name});
        }
    });

    /**
     * Load Pages
     */
    fs.readdir("./libs/sockets/pages", function(err, files) {
        files.forEach(function(file) {
            let pageFile = require("./pages/" + file);
            if (pageFile.loadPageSockets) {
                pageFile.loadPageSockets(clientSocket);
            }
        });
    });

});