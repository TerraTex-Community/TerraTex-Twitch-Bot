/**
 * Created by geramy on 08.01.2016.
 */
"use strict";

const express = require('express');
const router = express.Router();
const version = require('./../../package.json').version;

/* GET home page. */
router.get('/', function (req, res) {
    let url = require('url');
    let urlParts = url.parse(req.url, true);

    let channel = urlParts.query.channel;
    if (!channel) {
        channel = "-empty-";
    }

    let page = urlParts.query.page;
    if (!page) {
        page = 1;
    }

    if (page < 1) {
        page = 1;
    }

    page = parseInt(page);

    let maxEntriesPerPage = ENV.maxQuotesEntries;

    g_database.exist("channel", {channelName: channel}, function (existErr, exist) {

        if (!existErr && exist) {
            let query = "SELECT count(ID) AS anzahl FROM quotes WHERE channelID IN (SELECT ID FROM channel WHERE channelName = :channelName)";

            g_database.query(query, {channelName: channel}, function (dbErr, result) {

                let zitateCounted = result[0].anzahl;
                let maxPages = Math.floor(zitateCounted / maxEntriesPerPage) + 1;

                if (page > maxPages) {
                    page = maxPages;
                }

                let start = (page - 1) * maxEntriesPerPage;

                if (start > zitateCounted) {
                    start = (maxPages - 1) * maxEntriesPerPage;
                }

                // generate link array
                let pageArray = [];
                for (let i = 1; i <= maxPages; i++) {
                    pageArray.push({
                        link: "?channel=" + channel + "&page=" + i,
                        active: page === i,
                        number: i
                    });
                }

                let isLastPage = (maxPages === page);
                let isFirstPage = (page === 1);

                let getQuery = "SELECT quoteToChannelID, name, quote, date FROM quotes WHERE channelID IN ";
                getQuery += "(SELECT ID FROM channel WHERE channelName = :channelName) ORDER BY quoteToChannelID DESC LIMIT ";
                getQuery += start + ",50";

                g_database.query(getQuery, {channelName: channel}, function(err, results){

                    for (let y=0; y<results.length; y++) {
                        let date = results[y].date;
                        let output = (((date.getDate()<10?'0':'') + date.getDate()) + ".");
                        output += ((date.getMonth()<10?'0':'') + (date.getMonth() + 1));
                        output += ("." + date.getFullYear());
                        output += (" " + ((date.getHours()<10?'0':'') + date.getHours()) + ":");
                        output += ((date.getMinutes()<10?'0':'') + date.getMinutes());
                        output += (":" + (date.getSeconds()<10?'0':'') + date.getSeconds());
                        results[y].showDate = output;
                    }

                    res.render('index', {
                        content: 'quotes',
                        channel: channel,
                        page: page,
                        isLastPage: isLastPage,
                        isFirstPage: isFirstPage,
                        pages: pageArray,
                        previousPageLink: ("?channel=" + channel + "&page=" + (page - 1)),
                        nextPageLink: ("?channel=" + channel + "&page=" + (page + 1)),
                        quotes: results
                    });
                });
            });
        } else if (!existErr) {
            res.render('index.hbs', {content: 'quotes', channelNotExist: true, channel: channel, version: (version + "-BUILD." + g_build)});
        }
    });
});

module.exports = router;
