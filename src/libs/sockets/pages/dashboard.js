/**
 * Created by Colin on 03.01.2016.
 */
"use strict";

class PageSettings {
    static loadPageSockets(clientSocket) {

        clientSocket.on("getDashBoardData", function (data) {
            let channelID = clientSocket.handshake.session.user.id;

            if (data.chart !== "channelData") {
                let followerSql = "SELECT value, diff, time FROM stats_follows WHERE channelID = :channelID AND time ";
                let viewerSql = "SELECT viewer, time FROM stats_viewer WHERE channelID = :channelID AND time ";

                let timeRange;

                if (data.timerange === "l60m") {

                    timeRange = ">= NOW() - INTERVAL 1 HOUR";
                    followerSql += timeRange;
                    viewerSql += timeRange;

                } else if (data.timerange === "l24h" || data.timerange === "l12h") {

                    if (data.timerange === "l24h") {
                        timeRange = ">= NOW() - INTERVAL 24 HOUR";
                    } else {
                        timeRange = ">= NOW() - INTERVAL 12 HOUR";
                    }

                    followerSql = "SELECT max(value) as value, sum(diff) as diff, max(time) as time, UNIX_TIMESTAMP(time) DIV (15 * 60) as tmp_time ";
                    followerSql += "FROM stats_follows WHERE channelID = :channelID AND time " + timeRange + " ";
                    followerSql += "GROUP BY tmp_time";

                    viewerSql = "SELECT max(viewer) as viewer, max(time) as time, UNIX_TIMESTAMP(time) DIV (15 * 60) as tmp_time ";
                    viewerSql += "FROM stats_viewer WHERE channelID = :channelID AND time " + timeRange + " ";
                    viewerSql += "GROUP BY tmp_time";

                }  else if (data.timerange === "l12mo" || data.timerange === "l3mo" || data.timerange === "l6mo") {

                    switch (data.timerange) {
                        case "l3mo":
                            timeRange = ">= NOW() - INTERVAL 3 MONTH";
                            break;
                        case "l6mo":
                            timeRange = ">= NOW() - INTERVAL 6 MONTH";
                            break;
                        // l12mo
                        default:
                            timeRange = ">= NOW() - INTERVAL 1 YEAR";
                    }

                    followerSql = "SELECT max(value) as value, SUM(diff) as diff, DATE(time) as time FROM stats_follows WHERE channelID = :channelID AND time ";
                    followerSql += timeRange;
                    followerSql += " GROUP BY DATE(time)";

                    viewerSql = "SELECT max(viewer) as viewer, DATE(time) as time FROM stats_viewer WHERE channelID = :channelID AND time ";
                    viewerSql += timeRange;
                    viewerSql += " GROUP BY DATE(time)";
                }

                if (data.chart === "follower") {
                    g_database.query(followerSql, {channelID: channelID}, function (err, result) {
                        clientSocket.emit("recieveDashBoardData", {
                            chart: "follower",
                            data: result
                        });
                    });
                } else if (data.chart === "viewer") {
                    g_database.query(viewerSql, {channelID: channelID}, function (err, result) {
                        clientSocket.emit("recieveDashBoardData", {
                            chart: "viewer",
                            data: result
                        });
                    });
                }
            } else {
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
            }
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