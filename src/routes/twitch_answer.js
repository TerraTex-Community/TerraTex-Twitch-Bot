/**
 * Created by geramy on 28.02.2016.
 */
"use strict";
const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const url = require('url');
    const url_parts = url.parse(req.url, true);

    g_twitchAPI.getAccessToken(url_parts.query.code, (accessErr, body) => {
        if (!accessErr) {
            g_twitchAPI.getAuthenticatedUser(body.access_token, function (authErr, result) {
                if (!authErr) {
                    let name = result.name;
                    let logo = result.logo;
                    let partnered = result.partnered;
                    let email = result.email;

                    g_database.exist("channel", {channelName: name}, function (dbExistErr, exist) {
                        if (!dbExistErr && !exist) {
                            g_bot.createChannelEntries(name, email, partnered, function(createErr, insertId){
                                if (!insertId) {
                                    req.session.login = body;
                                    req.session.user = {
                                        name: name,
                                        logo: logo,
                                        partnered: partnered,
                                        email: email,
                                        beta: 0,
                                        id: insertId
                                    };
                                    req.session.save(function() {
                                        res.redirect("/");
                                    });
                                }
                            });
                        } else if (!dbExistErr && exist) {
                            g_database.getTable("channel", {channelName: name}, function (getError, getResult) {
                                if (!getError) {
                                    g_bot.checkTableEntries(getResult[0].ID, function(){
                                        req.session.login = body;
                                        req.session.user = {
                                            name: name,
                                            logo: logo,
                                            partnered: partnered,
                                            email: email,
                                            beta: 0,
                                            id: getResult[0].ID
                                        };
                                        req.session.save(function() {
                                            res.redirect("/");
                                        });
                                    });
                                } else {
                                    res.redirect("/");
                                }
                            });

                        } else {
                            res.redirect("/");
                        }
                    });
                } else {
                    res.redirect("/");
                }
            });

        } else {
            res.redirect("/");
        }
    });
});

module.exports = router;
