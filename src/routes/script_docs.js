/**
 * Created by geramy on 08.01.2016.
 */
"use strict";

const express = require('express');
const router = express.Router();
const version = require('./../../package.json').version;
const path = require("path");

/* GET home page. */
router.get('/*', function (req, res) {
    const request = req.url.substr(1);

    let fs = require("fs");

    fs.readdir(path.resolve(__root, "views","documentations","sc"), function (err, files) {
        let navPoints = [],fileName, loadFile = "01.Start.hbs", active="Start";
        for (let i = 0; i < files.length; i++) {
            fileName = files[i].split(".")[1];
            navPoints.push(fileName);
            if (request === fileName) {
                loadFile = files[i];
                active = fileName;
            }
        }

        const content = "" + fs.readFileSync(path.resolve(__root,"views","documentations","sc", loadFile));
        const hogan = require("handlebars");
        const template = hogan.compile(content);

        res.render('index.hbs', {
            content: 'script_docs',
            show: template(),
            active: active,
            navPoints: navPoints,
            version: (version + "-BUILD." + g_build)
        });

    });
});

module.exports = router;
