/**
 * Created by geramy on 08.01.2016.
 */
"use strict";

var express = require('express');
var router = express.Router();
var version = require('./../../package.json').version;

/* GET home page. */
router.get('/', function (req, res) {
    let url = require('url');
    let urlParts = url.parse(req.url, true);

    let channel = urlParts.query.channel;
    if (!channel) {
        channel = "-empty-";
    }

    let orderby = urlParts.query.orderby;

    if (orderby !== "points" && orderby !== "time" && orderby !== "chat") {
        orderby = "points";
    }

    g_database.exist("channel", {channelName: channel}, function (existErr, exist) {

        if (!existErr && exist) {
            let query = "SELECT * FROM viewer WHERE channelID IN (";
            query += "SELECT ID FROM channel WHERE isBot = 0 AND channelName = :channelName AND viewerName != :channelName)";
            query += " ORDER BY ";
            switch (orderby) {
                case "points":
                    query += "points";
                    break;
                case "time":
                    query += "viewTime";
                    break;
                case "chat":
                    query += "chatMessages";
                    break;
                default:
                    query += "points";
                    break;
            }

            query += " DESC LIMIT 0, 100";

            g_database.query(query, {channelName: channel}, function (dbErr, results) {
                res.render('index', {
                    content: 'toplist',
                    channel: channel,
                    list: results,
                    activeorder: orderby,
                    version: (version + "-BUILD." + g_build)
                });
            });
        } else if (!existErr) {
            res.render('index.hbs', {
                content: 'toplist',
                channelNotExist: true,
                activeorder: orderby,
                channel: channel,
                version: (version + "-BUILD." + g_build)
            });
        }
    });
});

module.exports = router;
