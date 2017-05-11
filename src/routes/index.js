"use strict";

const express = require('express');
const router = express.Router();
const version = require('./../../package.json').version;

/* GET home page. */
router.get('/', function (req, res) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const sess = req.session;

    if (!sess.login) {
        let loginUrl = g_twitchAPI.getAuthorizationUrl();

        let options = {loginUrl: loginUrl, content: 'home', version: (version + "-BUILD." + g_build)};

        // Add Streamer Options
        g_database.getTable("terratex_partners", {}, function(err, result){
            for (let i = 0; i < result.length; i++) {
                result[i].lastState = result[i].lastState === 1;
                result[i].twitchPartnered = result[i].twitchPartnered === 1;
            }

            options.twitchStreamer = result;

            g_database.getTable("terratex_bot_channels", {}, function(boterr, botresult){
                for (let i = 0; i < result.length; i++) {
                    botresult[i].lastState = botresult[i].lastState === 1;
                    botresult[i].twitchPartnered = botresult[i].twitchPartnered === 1;
                }

                options.botChannels = botresult;

                res.render('index.hbs', options);
            }, "ORDER BY lastState DESC, lastViewerCount DESC, lastFollowerCount DESC");
        }, "ORDER BY lastState DESC, lastViewerCount DESC, lastFollowerCount DESC");

    } else {
        let connected = false;
        if (g_bot._channelConnectors.hasOwnProperty(req.session.user.name)) {
            connected = true;
        }

        let navigation = require("./../configs/navigation.json");

        res.render('index.hbs', {content: 'main', connected: connected, version: (version + "-BUILD." + g_build), navi: navigation});
    }
});


router.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect("/");
});

module.exports = router;
