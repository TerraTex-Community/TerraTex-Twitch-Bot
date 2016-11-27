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

    g_database.exist("channel", {channelName: channel}, function (existErr, exist) {

        if (!existErr && exist) {

            let commandHandler = require("../libs/channelsystems/CommandHandler");
            commandHandler.getAllCommandsOfChannel(channel, true, true, true, function(err, commands) {
                if (err) {
                    g_logger.system.error(err);
                } else {
                    res.render('index', {
                        content: 'cmdlist',
                        cmds: commands,
                        channel: channel,
                        version: (version + "-BUILD." + g_build)
                    });
                }
            });
        } else if (!existErr) {
            res.render('index.hbs', {
                content: 'cmdlist',
                channelNotExist: true,
                channel: channel,
                version: (version + "-BUILD." + g_build)
            });
        }
    });
});

module.exports = router;
