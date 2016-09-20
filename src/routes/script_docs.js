/**
 * Created by geramy on 08.01.2016.
 */
"use strict";

var express = require('express');
var router = express.Router();
var version = require('./../../package.json').version;
var path = require("path");

/* GET home page. */
router.get('/*', function (req, res) {
    var request = req.url.substr(1);

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

        var content = "" + fs.readFileSync(path.resolve(__root,"views","documentations","sc", loadFile));
        var hogan = require("handlebars");
        var template = hogan.compile(content);

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
