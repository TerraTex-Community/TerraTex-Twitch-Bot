/**
 * Created by Colin on 03.01.2016.
 */
"use strict";

class PageSettings {
    static loadPageSockets(clientSocket) {

        clientSocket.on("getDashBoardData", function (data) {
            let channelID = clientSocket.handshake.session.user.id;
            let query = "SELECT ";
            query += "sum(points) as sumPoints, ";
            query += "sum(viewTime) as sumViewTime, ";
            query += "sum(chatMessages) as sumChatMessages, ";
            query += "count(viewerName) as viewer ";
            query += "FROM viewer ";
            query += "WHERE channelID = :channelID ";
            query += "GROUP BY channelID";

            g_database.query(query, {
                channelID: channelID
            }, function (err, result){
                result = result[0];
                if (result) {
                    result.sumViewTime = g_helper.time.minutesToLongTimeString(result.sumViewTime);
                    clientSocket.emit("recieveDashBoardData", {
                        chart: "channelData",
                        data: result
                    });
                }
            });
        });
    }

    static sendPage(clientSocket, template) {
        if (clientSocket.handshake.session.user) {
            clientSocket.emit("loadPage", {
                content: template({}), page: "dashboard"
            });
        }
    }
}

module.exports = PageSettings;
