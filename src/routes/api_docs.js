/**
 * Created by geramy on 08.01.2016.
 */
"use strict";

var express = require('express');
var router = express.Router();
var path = require("path");

/* GET home page. */
router.get('/*', function (req, res) {
    let fs = require("fs");
    fs.readFile(path.resolve(__root, "tmp","api_docs.html"), function(err, content) {
         res.send(content.toString());
    });
});

module.exports = router;
