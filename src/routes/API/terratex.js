/**
 * Created by geramy on 10.01.2016.
 */
"use strict";

var express = require('express');
var router = express.Router();

router.get("/partners", function (req, res) {
    g_database.getTable("terratex_partners", {}, function(err, result){
        for (let i = 0; i < result.length; i++) {
            result[i].lastState = result[i].lastState === 1;
            result[i].twitchPartnered = result[i].twitchPartnered === 1;
        }

        let answer = new APIResult(res);
        answer.setResponse(result);
        answer.send();
    }, "ORDER BY lastState DESC, lastViewerCount DESC, lastFollowerCount DESC");
});

router.get("/botchannels", function (req, res) {
    g_database.getTable("terratex_bot_channels", {}, function(err, result){
        for (let i = 0; i < result.length; i++) {
            result[i].lastState = result[i].lastState === 1;
            result[i].twitchPartnered = result[i].twitchPartnered === 1;
        }

        let answer = new APIResult(res);
        answer.setResponse(result);
        answer.send();
    }, "ORDER BY lastState DESC, lastViewerCount DESC, lastFollowerCount DESC");
});

module.exports = router;